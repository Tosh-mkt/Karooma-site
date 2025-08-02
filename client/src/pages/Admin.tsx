import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles, ShoppingCart } from "lucide-react";

const productSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
  category: z.enum(["tecnologia", "casa", "familia", "autocuidado", "saude"]),
  currentPrice: z.string().min(1, "Preço é obrigatório"),
  originalPrice: z.string().optional(),
  rating: z.string().optional(),
  reviewCount: z.string().optional(),
  affiliateLink: z.string().url("Link deve ser uma URL válida"),
  imageUrl: z.string().url("URL da imagem deve ser válida").optional(),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export function Admin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "casa",
      currentPrice: "",
      originalPrice: "",
      rating: "",
      reviewCount: "",
      affiliateLink: "",
      imageUrl: "",
      featured: false,
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch('/api/automation/products/sync', {
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
        title: "✅ Produto criado com sucesso!",
        description: "O card já está disponível no site",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao criar produto",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      await createProduct.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="glassmorphism border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-neon-pink animate-pulse" />
              <CardTitle className="text-3xl font-outfit gradient-text">
                Admin Karooma
              </CardTitle>
              <ShoppingCart className="h-8 w-8 text-neon-blue animate-bounce" />
            </div>
            <p className="text-muted-foreground font-poppins">
              Adicione produtos manualmente para criar cards instantâneos
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-outfit font-semibold">Título do Produto</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Balance Bike Infantil Nathor"
                            className="glassmorphism border-neon-pink/30 focus:border-neon-pink"
                            {...field} 
                          />
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
                        <FormLabel className="font-outfit font-semibold">Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glassmorphism border-neon-purple/30 focus:border-neon-purple">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tecnologia">🔌 Tecnologia</SelectItem>
                            <SelectItem value="casa">🏠 Casa & Organização</SelectItem>
                            <SelectItem value="familia">👨‍👩‍👧‍👦 Família & Crianças</SelectItem>
                            <SelectItem value="autocuidado">💆‍♀️ Autocuidado & Beleza</SelectItem>
                            <SelectItem value="saude">🏥 Saúde & Bem-estar</SelectItem>
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
                      <FormLabel className="font-outfit font-semibold">Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição detalhada do produto..."
                          className="glassmorphism border-neon-blue/30 focus:border-neon-blue min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="currentPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-outfit font-semibold">Preço Atual (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="199.90"
                            className="glassmorphism border-neon-pink/30 focus:border-neon-pink"
                            {...field} 
                          />
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
                        <FormLabel className="font-outfit font-semibold">Preço Original (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="299.90 (opcional)"
                            className="glassmorphism border-neon-purple/30 focus:border-neon-purple"
                            {...field} 
                          />
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
                        <FormLabel className="font-outfit font-semibold">Avaliação</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="4.8 (opcional)"
                            className="glassmorphism border-neon-blue/30 focus:border-neon-blue"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="affiliateLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-outfit font-semibold">Link de Afiliado</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://amzn.to/seu-link"
                            className="glassmorphism border-neon-pink/30 focus:border-neon-pink"
                            {...field} 
                          />
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
                        <FormLabel className="font-outfit font-semibold">URL da Imagem</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://m.media-amazon.com/... (opcional)"
                            className="glassmorphism border-neon-purple/30 focus:border-neon-purple"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neon-blue/30 p-4 glassmorphism">
                      <div className="space-y-0.5">
                        <FormLabel className="font-outfit font-semibold">Produto em Destaque</FormLabel>
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
                  disabled={isLoading || createProduct.isPending}
                  className="w-full h-12 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue hover:scale-105 transition-all duration-300 font-outfit font-semibold text-lg"
                >
                  {isLoading || createProduct.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando Card...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Criar Card do Produto
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}