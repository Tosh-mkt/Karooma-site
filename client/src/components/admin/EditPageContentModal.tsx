import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Save, 
  Eye, 
  FileText, 
  Sparkles,
  Users,
  Target,
  Lightbulb,
  Shield,
  Star,
  Coffee,
  Home,
  Heart
} from "lucide-react";

const editPageContentSchema = z.object({
  heroTitle: z.string().min(5, "Título principal deve ter pelo menos 5 caracteres"),
  heroSubtitle: z.string().min(10, "Subtítulo deve ter pelo menos 10 caracteres"),
  missionTitle: z.string().min(5, "Título da missão é obrigatório"),
  missionContent: z.string().min(50, "Conteúdo da missão deve ter pelo menos 50 caracteres"),
  valuesTitle: z.string().min(5, "Título dos valores é obrigatório"),
  valuesDescription: z.string().min(20, "Descrição dos valores é obrigatória"),
  helpTitle: z.string().min(5, "Título de como auxiliamos é obrigatório"),
  helpDescription: z.string().min(20, "Descrição de como auxiliamos é obrigatória"),
  impactTitle: z.string().min(5, "Título do impacto é obrigatório"),
  closingTitle: z.string().min(5, "Título de fechamento é obrigatório"),
  closingQuote: z.string().min(10, "Citação de fechamento é obrigatória"),
  closingDescription: z.string().min(20, "Descrição de fechamento é obrigatória"),
  closingSignature: z.string().min(5, "Assinatura é obrigatória"),
});

type EditPageContentForm = z.infer<typeof editPageContentSchema>;

interface EditPageContentModalProps {
  trigger?: React.ReactNode;
}

// Dados padrão da página Sobre
const defaultPageContent = {
  heroTitle: "Juntas, Sempre Encontramos um Jeito",
  heroSubtitle: "A Karooma nasceu da compreensão profunda de que ser mãe é uma das experiências mais transformadoras e desafiadoras da vida. Estamos aqui para simplificar seu dia a dia e fortalecer sua confiança como mãe.",
  missionTitle: "Nossa Missão",
  missionContent: `Acreditamos que toda mãe merece sentir-se apoiada e confiante. Nossa missão é fornecer recursos práticos, produtos cuidadosamente selecionados e conteúdo empático que realmente fazem a diferença no cotidiano familiar.

Sabemos que você carrega uma carga mental imensa - desde lembrar dos compromissos médicos das crianças até planejar as refeições da semana. Por isso, criamos um espaço onde você encontra soluções testadas e estratégias que funcionam.

Não somos apenas mais um site. Somos uma comunidade que entende que por trás de cada mãe existe uma mulher que também precisa de cuidado, compreensão e momentos para si mesma.`,
  valuesTitle: "Nossos Valores",
  valuesDescription: "Cada decisão que tomamos é guiada por estes princípios fundamentais que definem quem somos e como queremos impactar sua vida.",
  helpTitle: "Como Te Auxiliamos",
  helpDescription: "Oferecemos apoio prático e emocional através de diferentes canais, sempre com foco em soluções que realmente funcionam.",
  impactTitle: "Nosso Impacto",
  closingTitle: "Lembre-se Sempre",
  closingQuote: "Você está fazendo um trabalho incrível, mesmo quando parece que tudo está bagunçado.",
  closingDescription: "Sua família tem sorte de ter você. E nós estamos aqui para lembrá-la disso todos os dias, oferecendo o apoio prático e emocional que você merece.",
  closingSignature: "Porque juntas, a gente sempre encontra um jeito. ✨"
};

export function EditPageContentModal({ trigger }: EditPageContentModalProps) {
  const [open, setOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar conteúdo da página "sobre" se existir
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ["/api/content/page/about"],
    enabled: open,
    retry: false,
    staleTime: 0, // Sempre buscar dados atualizados
  });

  const form = useForm<EditPageContentForm>({
    resolver: zodResolver(editPageContentSchema),
    defaultValues: defaultPageContent,
  });

  // Popula o formulário com dados existentes ou padrão
  useEffect(() => {
    if (pageContent && (pageContent as any).content) {
      try {
        const parsedContent = JSON.parse((pageContent as any).content);
        form.reset(parsedContent);
      } catch (error) {
        console.error("Erro ao parsear conteúdo:", error);
        form.reset(defaultPageContent);
      }
    } else {
      form.reset(defaultPageContent);
    }
  }, [pageContent, form]);

  const updatePageContentMutation = useMutation({
    mutationFn: async (data: EditPageContentForm) => {
      console.log("Salvando conteúdo da página:", data);
      
      const contentData = {
        title: "Página Sobre",
        description: "Conteúdo editável da página Sobre",
        content: JSON.stringify(data),
        type: "page",
        category: "about",
      };

      // Se já existe, atualiza; senão, cria
      const method = pageContent ? "PUT" : "POST";
      const url = pageContent ? `/api/content/${(pageContent as any).id}` : "/api/content";
      
      console.log("Enviando para:", url, "método:", method);
      console.log("Dados:", contentData);
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", response.status, errorText);
        throw new Error(`Falha ao salvar conteúdo: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Resultado:", result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Conteúdo Atualizado!",
        description: "As alterações da página Sobre foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content/page/about"] });
      setOpen(false);
      setPreviewMode(false);
    },
    onError: (error) => {
      console.error("Erro na atualização:", error);
      toast({
        title: "Erro ao atualizar conteúdo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar Página Sobre
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Carregando conteúdo...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar Página Sobre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Conteúdo da Página "Sobre"
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
                console.log("Formulário enviado:", data);
                updatePageContentMutation.mutate(data);
              })} className="space-y-6">
                
                {/* Seção Hero */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Seção Principal (Hero)
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="heroTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Principal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heroSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                {/* Seção Missão */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Seção Missão
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="missionTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Missão</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="missionContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo da Missão</FormLabel>
                          <FormControl>
                            <Textarea rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                {/* Seção Valores */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Seção Valores
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="valuesTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título dos Valores</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valuesDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição dos Valores</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                {/* Seção Como Auxiliamos */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Seção Como Auxiliamos
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="helpTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="helpDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                {/* Seção Fechamento */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Seção de Fechamento
                  </h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="closingTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título de Fechamento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="closingQuote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Citação Principal</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="closingDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição de Fechamento</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="closingSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assinatura</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {previewMode ? "Editar" : "Preview"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePageContentMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updatePageContentMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-4">
            <Card className="h-full">
              <CardContent className="p-6">
                {previewMode ? (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="text-center">
                      <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Preview da Página
                      </Badge>
                      <h1 className="text-3xl font-bold mb-4">
                        {form.watch("heroTitle")}
                      </h1>
                      <p className="text-gray-600 mb-6">
                        {form.watch("heroSubtitle")}
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <h2 className="text-2xl font-bold mb-3">
                        {form.watch("missionTitle")}
                      </h2>
                      <p className="text-gray-600 whitespace-pre-line">
                        {form.watch("missionContent")}
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <h2 className="text-2xl font-bold mb-2">
                        {form.watch("valuesTitle")}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {form.watch("valuesDescription")}
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <h2 className="text-2xl font-bold mb-2">
                        {form.watch("helpTitle")}
                      </h2>
                      <p className="text-gray-600">
                        {form.watch("helpDescription")}
                      </p>
                    </div>

                    <div className="border-t pt-6 bg-purple-50 p-4 rounded-lg">
                      <h2 className="text-2xl font-bold mb-4">
                        {form.watch("closingTitle")}
                      </h2>
                      <p className="text-xl font-bold mb-3">
                        "{form.watch("closingQuote")}"
                      </p>
                      <p className="text-gray-600 mb-3">
                        {form.watch("closingDescription")}
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {form.watch("closingSignature")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 space-y-4">
                    <Edit className="w-12 h-12 mx-auto opacity-50" />
                    <p>Clique em "Preview" para ver as alterações</p>
                    <div className="text-sm space-y-2">
                      <p><strong>Edição disponível para:</strong></p>
                      <ul className="text-left space-y-1">
                        <li>• Título e subtítulo principal</li>
                        <li>• Seção de missão completa</li>
                        <li>• Títulos e descrições de seções</li>
                        <li>• Mensagem de fechamento</li>
                        <li>• Citações e assinatura</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}