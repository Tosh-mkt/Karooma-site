import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PromptHelper } from "./PromptHelper";
import { ImageUploader } from "./ImageUploader";
import { 
  PlusCircle, 
  Save, 
  Eye, 
  FileText, 
  Image, 
  Tag,
  Sparkles,
  Users,
  Heart,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  Brain,
  Target
} from "lucide-react";

const createPostSchema = z.object({
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  content: z.string().min(100, "Conteúdo deve ter pelo menos 100 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  heroImageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  footerImageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

const categories = [
  "Organização Familiar",
  "Produtividade",
  "Cuidados Pessoais", 
  "Família",
  "Saúde e Bem-estar",
  "Casa e Decoração",
  "Tecnologia para Mães",
  "Alimentação",
  "Economia Doméstica"
];

const contentTemplates = {
  "hook_emocional": "Eu sei que você conhece essa sensação...",
  "validacao": "**A verdade é que [estatística] das mães brasileiras relatam [problema].** Você não está sozinha nessa.",
  "estrategias": "## [Número] Estratégias Que Realmente Funcionam (Testadas por Mães Reais)\n\n### 🌅 1. [Nome da Estratégia]\n[Descrição prática]\n\n### 📝 2. [Nome da Estratégia]\n[Descrição prática]",
  "reflexao": "## O Que Mudou na Minha Rotina (e Pode Mudar na Sua)\n\nQuando comecei a aplicar essas estratégias, algo interessante aconteceu...",
  "fechamento": "## Lembre-se Sempre:\n\n**Você está fazendo um trabalho incrível, mesmo quando parece que tudo está bagunçado.** Sua família tem sorte de ter você.\n\n**Porque juntas, a gente sempre encontra um jeito. ✨**"
};

interface CreatePostModalProps {
  trigger?: React.ReactNode;
}

export function CreatePostModal({ trigger }: CreatePostModalProps) {
  const [open, setOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      category: "",
      heroImageUrl: "",
      footerImageUrl: "",
      featured: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      console.log("Enviando dados:", data);
      const response = await apiRequest("POST", "/api/content", {
        ...data,
        type: "blog",
        imageUrl: null, // Manter compatibilidade
        heroImageUrl: data.heroImageUrl || null,
        footerImageUrl: data.footerImageUrl || null,
      });
      console.log("Resposta da API:", response);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Post Criado!",
        description: "Post foi publicado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content/featured"] });
      setOpen(false);
      form.reset();
      setPreviewMode(false);
    },
    onError: (error) => {
      console.error("Erro na mutation:", error);
      toast({
        title: "Erro ao criar post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const insertTemplate = (templateKey: keyof typeof contentTemplates) => {
    const currentContent = form.getValues("content");
    const template = contentTemplates[templateKey];
    form.setValue("content", currentContent + (currentContent ? "\n\n" : "") + template);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold text-gray-700 mt-4 mb-2">$1</h3>')
      .replace(/\n\n/g, '</p><p class="text-gray-600 mb-4">')
      .replace(/^(.+)/, '<p class="text-gray-600 mb-4">$1')
      .replace(/(.+)$/, '$1</p>');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Criar Novo Post - Layout Moderno
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
                console.log("Form submitted:", data);
                createPostMutation.mutate(data);
              })} className="space-y-4">
                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Título (Hook Magnético)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                <strong>Hook Magnético:</strong> Título que desperta curiosidade e se conecta emocionalmente. 
                                Use perguntas, situações reconhecíveis ou estatísticas surpreendentes. 
                                Ex: "Você já acordou às 5h30..." gera identificação imediata.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Você Já Acordou às 5h30 Pensando na Lista de Tarefas Infinita?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Descrição (Chamada Empática)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                <strong>Chamada Empática:</strong> Resume o benefício principal de forma humanizada. 
                                Foque na transformação que o conteúdo oferece para a vida da leitora. 
                                Use palavras como "estratégias práticas", "sem se sobrecarregar", "equilíbrio".
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Estratégias práticas para mães ocupadas que querem encontrar mais equilíbrio na rotina diária..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoria e Configurações */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Categoria
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Post em Destaque
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>



                {/* Templates Rápidos */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-semibold">Templates da Estrutura Moderna:</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="text-sm">
                            <strong>Estrutura Comprovada:</strong> Templates baseados na metodologia Karooma 
                            para posts de alto engajamento com mães ocupadas. Use em sequência para máximo impacto.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertTemplate("hook_emocional")}
                            className="flex items-center gap-2"
                          >
                            <Lightbulb className="w-3 h-3" />
                            Hook Emocional
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            <strong>Hook Emocional:</strong> Abertura que conecta emocionalmente com uma situação reconhecível. 
                            Ex: "Eu sei que você conhece essa sensação..."
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertTemplate("validacao")}
                            className="flex items-center gap-2"
                          >
                            <TrendingUp className="w-3 h-3" />
                            Validação + Dados
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            <strong>Validação + Dados:</strong> Estatística que valida o problema e mostra que ela não está sozinha. 
                            Ex: "73% das mães relatam se sentir sobrecarregadas..."
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertTemplate("estrategias")}
                            className="flex items-center gap-2"
                          >
                            <Target className="w-3 h-3" />
                            5 Estratégias
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            <strong>5 Estratégias:</strong> Soluções práticas numeradas e testadas. 
                            Use emojis, títulos claros e benefícios concretos para cada estratégia.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertTemplate("reflexao")}
                            className="flex items-center gap-2"
                          >
                            <Brain className="w-3 h-3" />
                            Reflexão Pessoal
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            <strong>Reflexão Pessoal:</strong> Compartilhamento autêntico da experiência pessoal. 
                            Humaniza o conteúdo e cria conexão através da vulnerabilidade.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="col-span-2 flex items-center gap-2"
                            onClick={() => insertTemplate("fechamento")}
                          >
                            <Heart className="w-3 h-3" />
                            Fechamento Empático
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            <strong>Fechamento Empático:</strong> Finalização memorável que reforça a autoestima 
                            e cria senso de comunidade. Sempre termine com esperança e união.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Imagem Hero */}
                <FormField
                  control={form.control}
                  name="heroImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Imagem do Início (Hero)
                        </FormLabel>
                        
                        <ImageUploader 
                          onImageInserted={(url) => {
                            field.onChange(url);
                          }}
                        />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="URL da imagem que aparecerá no início do post"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Imagem Footer */}
                <FormField
                  control={form.control}
                  name="footerImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Imagem do Final (Footer)
                        </FormLabel>
                        
                        <ImageUploader 
                          onImageInserted={(url) => {
                            field.onChange(url);
                          }}
                        />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="URL da imagem que aparecerá no final do post"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conteúdo */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Conteúdo (Markdown aceito)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="text-sm">
                                <strong>Estrutura do Conteúdo:</strong> Use os templates em sequência para criar 
                                posts de alto impacto. Markdown suportado: **negrito**, ## títulos, ### subtítulos. 
                                Mantenha parágrafos curtos e use emojis para facilitar a leitura.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Use os templates acima ou escreva seu conteúdo..."
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    disabled={createPostMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createPostMutation.isPending ? "Publicando..." : "Publicar Post"}
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
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <Badge className="mb-2">
                        {form.watch("category") || "Categoria"}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {form.watch("title") || "Título do post aparecerá aqui"}
                      </h2>
                      <p className="text-gray-600">
                        {form.watch("description") || "Descrição do post aparecerá aqui"}
                      </p>
                    </div>
                    {form.watch("heroImageUrl") && (
                      <img
                        src={form.watch("heroImageUrl")}
                        alt="Preview Hero"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: formatContent(form.watch("content") || "Conteúdo aparecerá aqui") 
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 space-y-4">
                    <Eye className="w-12 h-12 mx-auto opacity-50" />
                    <p>Clique em "Preview" para ver como o post ficará</p>
                    <div className="text-sm space-y-2">
                      <p><strong>Estrutura Moderna Incluída:</strong></p>
                      <ul className="text-left space-y-1">
                        <li>• Hook magnético no título</li>
                        <li>• Validação emocional com dados</li>
                        <li>• 5 estratégias práticas numeradas</li>
                        <li>• Reflexão pessoal autêntica</li>
                        <li>• Fechamento empático memorável</li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <PromptHelper 
                        trigger={
                          <Button variant="outline" className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Gerar com IA
                          </Button>
                        }
                      />
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