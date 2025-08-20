import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Plus, CloudUpload, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const productSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória").max(1000, "Descrição muito longa"),
  category: z.string().min(1, "Categoria é obrigatória"),
  currentPrice: z.string().min(1, "Preço é obrigatório"),
  originalPrice: z.string().optional(),
  rating: z.string().optional(),
  affiliateLink: z.string().url("Link deve ser uma URL válida"),
  imageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  introduction: z.string().min(50, "Introdução deve ter pelo menos 50 caracteres").optional(),
  evaluators: z.string().min(20, "Especialistas obrigatórios").optional(),
  benefits: z.string().min(100, "Benefícios devem ter pelo menos 100 caracteres").optional(),
  teamEvaluation: z.string().min(50, "Avaliação da equipe obrigatória").optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface NewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProductModal({ open, onOpenChange }: NewProductModalProps) {
  const [mode, setMode] = useState<"choice" | "upload" | "manual">("choice");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      currentPrice: "",
      originalPrice: "",
      rating: "",
      affiliateLink: "",
      imageUrl: "",
      featured: false,
      introduction: "",
      evaluators: "",
      benefits: "",
      teamEvaluation: "",
      tags: "",
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Falha ao criar produto');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso!",
        description: "O card já está disponível no site",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onOpenChange(false);
      setMode("choice");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (file.type === 'application/json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        // Simular progresso
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        const response = await fetch('/api/products/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: text,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao importar produto');
        }

        const result = await response.json();
        setUploadResult(result);
        
        toast({
          title: "Produto importado com sucesso!",
          description: "O card foi criado automaticamente",
        });

        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        
        setTimeout(() => {
          onOpenChange(false);
          setMode("choice");
          setUploadResult(null);
          setUploadProgress(0);
        }, 2000);

      } else if (file.type === 'text/csv') {
        // TODO: Implementar parser CSV
        throw new Error('Upload CSV será implementado em breve');
      }
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    createProduct.mutate(data);
  };

  const resetModal = () => {
    setMode("choice");
    setUploadProgress(0);
    setUploadResult(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Novo Produto
          </DialogTitle>
        </DialogHeader>

        {mode === "choice" && (
          <div className="grid md:grid-cols-2 gap-6 py-6">
            <Card className="glassmorphism border-purple-200 hover:border-purple-400 transition-all cursor-pointer" onClick={() => setMode("upload")}>
              <CardContent className="p-6 text-center space-y-4">
                <CloudUpload className="w-12 h-12 mx-auto text-purple-500" />
                <h3 className="text-lg font-semibold">Upload de Arquivo</h3>
                <p className="text-sm text-muted-foreground">
                  Envie um arquivo JSON (template) ou CSV com os dados do produto
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-500">
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload
                </Button>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-pink-200 hover:border-pink-400 transition-all cursor-pointer" onClick={() => setMode("manual")}>
              <CardContent className="p-6 text-center space-y-4">
                <FileText className="w-12 h-12 mx-auto text-pink-500" />
                <h3 className="text-lg font-semibold">Formulário Manual</h3>
                <p className="text-sm text-muted-foreground">
                  Preencha manualmente todas as informações do produto
                </p>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Manual
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === "upload" && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setMode("choice")}
                className="mb-4"
              >
                ← Voltar às Opções
              </Button>
            </div>

            {!isUploading && !uploadResult && (
              <div
                className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center space-y-4 hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  if (files[0]) handleFileUpload(files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <CloudUpload className="w-16 h-16 mx-auto text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Arraste seu arquivo aqui</h3>
                  <p className="text-muted-foreground mb-4">
                    Ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suportado: JSON (template), CSV
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Selecionar Arquivo
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold">Processando arquivo...</h3>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Validando dados e criando produto...
                </p>
              </div>
            )}

            {uploadResult && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="text-lg font-semibold text-green-600">Produto Criado!</h3>
                <p className="text-muted-foreground">
                  {uploadResult.product?.title} foi adicionado com sucesso
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        )}

        {mode === "manual" && (
          <div className="py-6">
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={() => setMode("choice")}
                className="mb-4"
              >
                ← Voltar às Opções
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Liquidificador Mondial..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Eletrodomésticos">Eletrodomésticos</SelectItem>
                            <SelectItem value="Casa e Jardim">Casa e Jardim</SelectItem>
                            <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="Família">Família</SelectItem>
                            <SelectItem value="Autocuidado">Autocuidado</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva as características principais do produto..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="currentPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Atual *</FormLabel>
                        <FormControl>
                          <Input placeholder="189.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Original</FormLabel>
                        <FormControl>
                          <Input placeholder="229.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avaliação</FormLabel>
                        <FormControl>
                          <Input placeholder="4.6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="affiliateLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Afiliado *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://amzn.to/seu-link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="https://m.media-amazon.com/..." {...field} />
                      </FormControl>
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
                        <FormLabel>Produto em Destaque</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Produto aparecerá na seção de destaques
                        </p>
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

                <Button 
                  type="submit" 
                  disabled={createProduct.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-all"
                >
                  {createProduct.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Produto
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}