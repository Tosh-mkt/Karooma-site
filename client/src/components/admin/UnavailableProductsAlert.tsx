import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertTriangle,
  Package,
  RefreshCw,
  Loader2,
  ExternalLink,
  Search,
  FileJson,
  Replace,
  Star,
  Check,
  X
} from "lucide-react";

interface UnavailableProduct {
  id: string;
  asin: string;
  title: string;
  category: string;
  availability: string;
  status: string;
  unavailableSince?: string;
  lastChecked?: string;
}

interface ProductSuggestion {
  asin: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  recommendationScore?: number;
}

export function UnavailableProductsAlert() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProduct, setSelectedProduct] = useState<UnavailableProduct | null>(null);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [jsonReplacement, setJsonReplacement] = useState("");

  const { data: unavailableData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/products/unavailable'],
    refetchInterval: 5 * 60 * 1000,
  });

  const replaceMutation = useMutation({
    mutationFn: async ({ productId, newAsin, jsonData }: { productId: string; newAsin?: string; jsonData?: any }) => {
      const response = await apiRequest(
        'PUT',
        `/api/admin/products/${productId}/replace`,
        jsonData ? { useJsonData: true, jsonData } : { newAsin }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto substituído!",
        description: "O produto foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products/unavailable'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowReplaceDialog(false);
      setSelectedProduct(null);
      setSuggestions([]);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao substituir",
        description: error.message || "Falha ao substituir produto",
        variant: "destructive",
      });
    }
  });

  const loadSuggestions = async (asin: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await apiRequest('GET', `/api/admin/products/suggestions/${asin}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar sugestões",
        description: "Não foi possível buscar produtos similares",
        variant: "destructive",
      });
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectProduct = (product: UnavailableProduct) => {
    setSelectedProduct(product);
    setShowReplaceDialog(true);
    loadSuggestions(product.asin);
  };

  const handleReplaceWithSuggestion = (suggestion: ProductSuggestion) => {
    if (!selectedProduct) return;
    replaceMutation.mutate({ 
      productId: selectedProduct.id, 
      newAsin: suggestion.asin 
    });
  };

  const handleReplaceWithJson = () => {
    if (!selectedProduct || !jsonReplacement) return;
    
    try {
      const jsonData = JSON.parse(jsonReplacement);
      
      const requiredFields = ['asin', 'title', 'imageUrl', 'productUrl', 'price'];
      const missingFields = requiredFields.filter(f => !jsonData[f]);
      
      if (missingFields.length > 0) {
        toast({
          title: "JSON inválido",
          description: `Campos faltando: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      replaceMutation.mutate({ 
        productId: selectedProduct.id, 
        jsonData 
      });
    } catch (e) {
      toast({
        title: "JSON inválido",
        description: "Verifique a sintaxe do JSON",
        variant: "destructive",
      });
    }
  };

  const products = (unavailableData as any)?.products as UnavailableProduct[] || [];
  const count = products.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Verificando produtos...
        </CardContent>
      </Card>
    );
  }

  if (count === 0) {
    return null;
  }

  return (
    <>
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          {count} produto(s) indisponível(is)
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-6 px-2"
            data-testid="btn-refresh-unavailable"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </AlertTitle>
        <AlertDescription>
          Alguns produtos estão indisponíveis na Amazon e precisam de substituição.
        </AlertDescription>
      </Alert>

      <Card className="mb-6" data-testid="unavailable-products-panel">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos Indisponíveis
          </CardTitle>
          <CardDescription>
            Clique em um produto para ver sugestões de substituição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map(product => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleSelectProduct(product)}
                data-testid={`unavailable-product-${product.asin}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{product.asin}</Badge>
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    <Badge variant="destructive" className="text-xs">
                      {product.availability === 'unavailable' ? 'Indisponível' : product.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  <Replace className="w-4 h-4 mr-1" />
                  Substituir
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Replace className="w-5 h-5" />
              Substituir Produto
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Sugestões de Substituição
              </h3>
              
              {isLoadingSuggestions ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Buscando produtos similares...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map(suggestion => (
                    <Card key={suggestion.asin} className="overflow-hidden">
                      <div className="flex gap-4 p-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          {suggestion.imageUrl && (
                            <img 
                              src={suggestion.imageUrl} 
                              alt={suggestion.title}
                              className="w-full h-full object-contain rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{suggestion.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-primary text-sm">
                              R$ {suggestion.currentPrice?.toFixed(2)}
                            </span>
                            {suggestion.rating && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {suggestion.rating.toFixed(1)}
                              </Badge>
                            )}
                            {suggestion.isPrime && (
                              <Badge className="bg-blue-500 text-xs">Prime</Badge>
                            )}
                            {suggestion.recommendationScore !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Score: {(suggestion.recommendationScore * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleReplaceWithSuggestion(suggestion)}
                            disabled={replaceMutation.isPending}
                            data-testid={`btn-select-suggestion-${suggestion.asin}`}
                          >
                            {replaceMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`https://www.amazon.com.br/dp/${suggestion.asin}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma sugestão encontrada</p>
                  <p className="text-xs mt-1">Use a inserção manual abaixo</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Inserção Manual (JSON)
              </h3>
              
              <div className="space-y-3">
                <Label>Cole os dados do novo produto:</Label>
                <Textarea
                  value={jsonReplacement}
                  onChange={(e) => setJsonReplacement(e.target.value)}
                  placeholder={`{
  "asin": "B09XXXXX",
  "title": "Novo Produto",
  "imageUrl": "https://...",
  "productUrl": "https://www.amazon.com.br/dp/...",
  "price": 99.90
}`}
                  className="font-mono text-sm min-h-[150px]"
                  data-testid="input-json-replacement"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReplaceDialog(false)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReplaceWithJson}
                    disabled={!jsonReplacement || replaceMutation.isPending}
                    className="flex-1"
                    data-testid="btn-replace-with-json"
                  >
                    {replaceMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Replace className="w-4 h-4 mr-2" />
                    )}
                    Substituir com JSON
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
