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
  Edit, 
  Save, 
  Eye, 
  FileText, 
  Image, 
  Sparkles,
  Users,
  HelpCircle,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Star
} from "lucide-react";

const editPostSchema = z.object({
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  content: z.string().min(50, "Conteúdo deve ter pelo menos 50 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  heroImageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  footerImageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

type EditPostForm = z.infer<typeof editPostSchema>;

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

interface EditPostModalProps {
  postId: string;
  trigger?: React.ReactNode;
}

export function EditPostModal({ postId, trigger }: EditPostModalProps) {
  const [open, setOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/content/${postId}`],
    enabled: open,
  }) as { data: any, isLoading: boolean };

  const form = useForm<EditPostForm>({
    resolver: zodResolver(editPostSchema),
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

  // Populate form when post data is loaded
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title || "",
        description: post.description || "",
        content: post.content || "",
        category: post.category || "",
        heroImageUrl: post.heroImageUrl || "",
        footerImageUrl: post.footerImageUrl || "",
        featured: post.featured || false,
      });
    }
  }, [post, form]);

  const updatePostMutation = useMutation({
    mutationFn: async (data: EditPostForm) => {
      console.log("Atualizando post:", data);
      const response = await fetch(`/api/content/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          heroImageUrl: data.heroImageUrl || null,
          footerImageUrl: data.footerImageUrl || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar post");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content/blog"] });
      queryClient.invalidateQueries({ queryKey: [`/api/content/${postId}`] });
      setOpen(false);
      setPreviewMode(false);
    },
    onError: (error) => {
      console.error("Erro na atualização:", error);
      toast({
        title: "Erro ao atualizar post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const insertTextFormat = (format: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = form.getValues("content");
    
    let replacement = "";
    
    switch (format) {
      case "bold":
        replacement = `**${selectedText || "texto em negrito"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "texto em itálico"}*`;
        break;
      case "h2":
        replacement = `## ${selectedText || "Título Principal"}`;
        break;
      case "h3":
        replacement = `### ${selectedText || "Subtítulo"}`;
        break;
      case "list":
        replacement = `- ${selectedText || "Item da lista"}`;
        break;
      case "quote":
        replacement = `> ${selectedText || "Citação inspiradora"}`;
        break;
      default:
        return;
    }

    const newContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);
    form.setValue("content", newContent);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold text-gray-700 mt-4 mb-2">$1</h3>')
      .replace(/^- (.*?)(\n|$)/gm, '<li class="text-gray-600 mb-1">$1</li>')
      .replace(/^> (.*?)(\n|$)/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="text-gray-600 mb-4">')
      .replace(/^(.+)/, '<p class="text-gray-600 mb-4">$1')
      .replace(/(.+)$/, '$1</p>');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Carregando post...</p>
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
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Post - Layout Moderno
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
                console.log("Form editado:", data);
                updatePostMutation.mutate(data);
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
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoria e Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
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
                      <FormItem className="flex flex-col justify-end">
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Post em Destaque
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
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
                            field.onChange(url.replace(/!\[.*?\]\((.*?)\)/, '$1'));
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
                            field.onChange(url.replace(/!\[.*?\]\((.*?)\)/, '$1'));
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

                {/* Ferramentas de Formatação */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Ferramentas de Formatação:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTextFormat("bold")}
                    >
                      <Bold className="w-3 h-3 mr-1" />
                      Negrito
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTextFormat("italic")}
                    >
                      <Italic className="w-3 h-3 mr-1" />
                      Itálico
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTextFormat("h2")}
                    >
                      H2
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTextFormat("h3")}
                    >
                      H3
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTextFormat("list")}
                    >
                      <List className="w-3 h-3 mr-1" />
                      Lista
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertTextFormat("quote")}
                    >
                      <Quote className="w-3 h-3 mr-1" />
                      Citação
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
                          rows={12}
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
                    disabled={updatePostMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updatePostMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={form.watch("featured") ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}>
                          {form.watch("category") || "Categoria"}
                        </Badge>
                        {form.watch("featured") && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                      </div>
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
                    <Edit className="w-12 h-12 mx-auto opacity-50" />
                    <p>Clique em "Preview" para ver como o post ficará</p>
                    <div className="text-sm space-y-2">
                      <p><strong>Ferramentas disponíveis:</strong></p>
                      <ul className="text-left space-y-1">
                        <li>• **Negrito** e *Itálico*</li>
                        <li>• ## Títulos e ### Subtítulos</li>
                        <li>• - Listas e citações</li>
                        <li>• Toggle de Post em Destaque</li>
                        <li>• Preview em tempo real</li>
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