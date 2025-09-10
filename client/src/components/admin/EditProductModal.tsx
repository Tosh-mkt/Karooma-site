import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import type { Product } from "@shared/schema";
import { Loader2, Save } from "lucide-react";

// Validation schema
const editProductSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  currentPrice: z.string().min(1, "Preço atual é obrigatório"),
  originalPrice: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  affiliateLink: z.string().url("URL de afiliado inválida"),
  imageUrl: z.string().url("URL da imagem inválida"),
  rating: z.number().min(0).max(5).optional(),
  featured: z.boolean(),
  tags: z.string().optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductModal({ product, open, onOpenChange }: EditProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      title: "",
      description: "",
      currentPrice: "",
      originalPrice: "",
      category: "",
      affiliateLink: "",
      imageUrl: "",
      rating: 0,
      featured: false,
      tags: "",
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title || "",
        description: product.description || "",
        currentPrice: product.currentPrice || "",
        originalPrice: product.originalPrice || "",
        category: product.category || "",
        affiliateLink: product.affiliateLink || "",
        imageUrl: product.imageUrl || "",
        rating: typeof product.rating === 'number' ? product.rating : 0,
        featured: product.featured || false,
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : (typeof product.tags === 'string' ? product.tags : ""),
      });
    }
  }, [product, form]);

  const editProductMutation = useMutation({
    mutationFn: async (data: EditProductFormData) => {
      if (!product) throw new Error("Produto não encontrado");
      
      const payload = {
        ...data,
        currentPrice: data.currentPrice,
        originalPrice: data.originalPrice || null,
        rating: data.rating || null,
        tags: data.tags 
          ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean).join(",")
          : "",
      };

      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar produto");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado!",
        description: "O produto foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditProductFormData) => {
    editProductMutation.mutate(data);
  };

  const categories = [
    "Comer e Preparar",
    "Presentear", 
    "Sono e Relaxamento",
    "Aprender e Brincar",
    "Sair e Viajar",
    "Organização",
    "Saúde e Segurança",
    "Decorar e Brilhar"
  ];

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Editar Produto
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do produto "{product.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto..." {...field} />
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
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o produto e seus benefícios..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Atual</FormLabel>
                    <FormControl>
                      <Input placeholder="99.90" {...field} />
                    </FormControl>
                    <FormDescription>Preço sem R$</FormDescription>
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
                      <Input placeholder="129.90" {...field} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avaliação</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="4.5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>De 0 a 5 estrelas</FormDescription>
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
                      <FormLabel className="text-base">
                        Produto em Destaque
                      </FormLabel>
                      <FormDescription>
                        Aparecer na seção de destaques
                      </FormDescription>
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link direto para a imagem do produto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affiliateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Afiliado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/produto"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link para compra do produto (afiliado)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="casa, cozinha, organização"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separar por vírgulas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {form.watch("imageUrl") && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Preview:</h4>
                <div className="flex items-center space-x-4">
                  <img
                    src={form.watch("imageUrl")}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <h5 className="font-semibold">{form.watch("title")}</h5>
                    <p className="text-sm text-muted-foreground">
                      R$ {form.watch("currentPrice")} • {form.watch("category")}
                    </p>
                    {form.watch("featured") && (
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs mt-1">
                        Destaque
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editProductMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {editProductMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Atualizar Produto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}