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
import { 
  PlusCircle, 
  Save, 
  Eye, 
  FileText, 
  Image, 
  Tag,
  Sparkles,
  Users,
  Heart
} from "lucide-react";

const createPostSchema = z.object({
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  content: z.string().min(100, "Conteúdo deve ter pelo menos 100 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  imageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
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
      imageUrl: "",
      featured: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      return await apiRequest("/api/content", "POST", {
        ...data,
        type: "blog",
        imageUrl: data.imageUrl || null,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Post Criado!",
        description: `"${data.title}" foi publicado com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content/blog"] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
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
              <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Título (Hook Magnético)
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

                {/* URL da Imagem */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        URL da Imagem (Unsplash recomendado)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://images.unsplash.com/photo-..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Templates Rápidos */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Templates da Estrutura Moderna:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("hook_emocional")}
                    >
                      Hook Emocional
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("validacao")}
                    >
                      Validação + Dados
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("estrategias")}
                    >
                      5 Estratégias
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("reflexao")}
                    >
                      Reflexão Pessoal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="col-span-2"
                      onClick={() => insertTemplate("fechamento")}
                    >
                      Fechamento Empático
                    </Button>
                  </div>
                </div>

                {/* Conteúdo */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Conteúdo (Markdown aceito)
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
                    {form.watch("imageUrl") && (
                      <img
                        src={form.watch("imageUrl")}
                        alt="Preview"
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