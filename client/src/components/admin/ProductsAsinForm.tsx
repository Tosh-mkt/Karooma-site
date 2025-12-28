import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  FileJson, 
  Package, 
  Star, 
  Check, 
  AlertTriangle, 
  Loader2,
  ExternalLink,
  Copy,
  Plus
} from "lucide-react";

interface ProductsAsinFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: (product: any) => void;
}

interface SearchFilters {
  keywords: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sortBy: string;
}

interface ProductResult {
  asin: string;
  title: string;
  imageUrl: string;
  productUrl: string;
  currentPrice: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  brand?: string;
  availability?: string;
  recommendationScore?: number;
}

const CATEGORIES = [
  { value: "All", label: "Todas as Categorias" },
  { value: "Baby", label: "Bebê" },
  { value: "Beauty", label: "Beleza" },
  { value: "Books", label: "Livros" },
  { value: "Electronics", label: "Eletrônicos" },
  { value: "Fashion", label: "Moda" },
  { value: "GroceryAndGourmetFood", label: "Alimentos e Bebidas" },
  { value: "HealthPersonalCare", label: "Saúde e Cuidados Pessoais" },
  { value: "HomeAndKitchen", label: "Casa e Cozinha" },
  { value: "KindleStore", label: "Kindle" },
  { value: "OfficeProducts", label: "Materiais de Escritório" },
  { value: "PetSupplies", label: "Pet Shop" },
  { value: "SportsAndOutdoors", label: "Esportes" },
  { value: "Toys", label: "Brinquedos" },
];

const JSON_TEMPLATE = `{
  "asin": "B09NCKFBGQ",
  "title": "Nome do Produto na Amazon",
  "imageUrl": "https://m.media-amazon.com/images/I/xxx.jpg",
  "productUrl": "https://www.amazon.com.br/dp/B09NCKFBGQ",
  "price": 179.80,
  "originalPrice": 249.90,
  "brand": "Marca do Produto",
  "category": "casa-e-cozinha",
  "rating": 4.5,
  "reviewCount": 1250,
  "isPrime": true
}`;

export function ProductsAsinForm({ open, onOpenChange, onProductAdded }: ProductsAsinFormProps) {
  const [activeTab, setActiveTab] = useState<"search" | "json">("json");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<SearchFilters>({
    keywords: "",
    category: "All",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sortBy: "Featured"
  });

  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonPreview, setJsonPreview] = useState<ProductResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (searchFilters: SearchFilters) => {
      const response = await apiRequest('POST', '/api/admin/products/search', {
        keywords: searchFilters.keywords || undefined,
        category: searchFilters.category !== "All" ? searchFilters.category : undefined,
        minPrice: searchFilters.minPrice ? parseFloat(searchFilters.minPrice) : undefined,
        maxPrice: searchFilters.maxPrice ? parseFloat(searchFilters.maxPrice) : undefined,
        minRating: searchFilters.minRating ? parseFloat(searchFilters.minRating) : undefined,
        sortBy: searchFilters.sortBy,
        itemCount: 10
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setSearchResults(data.products || []);
      setSearchError(null);
    },
    onError: (error: any) => {
      setSearchError(error.message || "Erro ao buscar produtos");
      setSearchResults([]);
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest('POST', '/api/admin/products/json', productData);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Produto adicionado!",
        description: `${data.product?.title || 'Produto'} foi cadastrado com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onProductAdded?.(data.product);
      setJsonInput("");
      setJsonPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar produto",
        description: error.message || "Falha ao cadastrar produto",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!filters.keywords && filters.category === "All") {
      setSearchError("Informe palavras-chave ou selecione uma categoria");
      return;
    }
    setIsSearching(true);
    searchMutation.mutate(filters, {
      onSettled: () => setIsSearching(false)
    });
  };

  const handleJsonValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      const requiredFields = ['asin', 'title', 'imageUrl', 'productUrl', 'price'];
      const missingFields = requiredFields.filter(f => !parsed[f]);
      
      if (missingFields.length > 0) {
        setJsonError(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
        setJsonPreview(null);
        return;
      }

      if (!/^[A-Z0-9]{10}$/.test(parsed.asin)) {
        setJsonError("ASIN deve ter exatamente 10 caracteres alfanuméricos maiúsculos");
        setJsonPreview(null);
        return;
      }

      setJsonPreview({
        asin: parsed.asin,
        title: parsed.title,
        imageUrl: parsed.imageUrl,
        productUrl: parsed.productUrl,
        currentPrice: parsed.price,
        originalPrice: parsed.originalPrice,
        rating: parsed.rating,
        reviewCount: parsed.reviewCount,
        isPrime: parsed.isPrime,
        brand: parsed.brand,
        availability: 'available'
      });
      setJsonError(null);
      
    } catch (e) {
      setJsonError("JSON inválido. Verifique a sintaxe.");
      setJsonPreview(null);
    }
  };

  const handleAddFromJson = () => {
    if (!jsonPreview) {
      handleJsonValidate();
      return;
    }
    
    const productData = JSON.parse(jsonInput);
    addProductMutation.mutate(productData);
  };

  const handleAddFromSearch = (product: ProductResult) => {
    addProductMutation.mutate({
      asin: product.asin,
      title: product.title,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      price: product.currentPrice,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isPrime: product.isPrime,
      brand: product.brand,
      category: filters.category !== "All" ? filters.category : undefined
    });
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON_TEMPLATE);
    toast({
      title: "Template copiado!",
      description: "Cole no campo ao lado e preencha com os dados do produto.",
    });
  };

  const renderProductCard = (product: ProductResult, showAddButton: boolean = true) => (
    <Card key={product.asin} className="overflow-hidden" data-testid={`product-card-${product.asin}`}>
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 flex-shrink-0">
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt={product.title}
              className="w-full h-full object-contain rounded"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.title}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-bold text-primary">
              R$ {product.currentPrice?.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.currentPrice && (
              <span className="line-through text-xs">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {product.rating && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                {product.rating.toFixed(1)} ({product.reviewCount || 0})
              </Badge>
            )}
            {product.isPrime && (
              <Badge className="bg-blue-500 text-xs">Prime</Badge>
            )}
            {product.brand && (
              <Badge variant="outline" className="text-xs">{product.brand}</Badge>
            )}
            {product.recommendationScore !== undefined && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Score: {(product.recommendationScore * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>
        {showAddButton && (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => handleAddFromSearch(product)}
              disabled={addProductMutation.isPending}
              data-testid={`btn-add-product-${product.asin}`}
            >
              {addProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(product.productUrl, '_blank')}
              data-testid={`btn-view-product-${product.asin}`}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Adicionar Produto via ASIN
          </DialogTitle>
          <DialogDescription>
            Adicione produtos da Amazon via busca na PA-API ou inserção manual de JSON.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "search" | "json")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              JSON Manual
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Busca PA-API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Dados do Produto (JSON)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyTemplate}
                    data-testid="btn-copy-template"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Template
                  </Button>
                </div>
                
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={JSON_TEMPLATE}
                  className="font-mono text-sm min-h-[300px]"
                  data-testid="input-json"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleJsonValidate}
                    className="flex-1"
                    data-testid="btn-validate-json"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Validar JSON
                  </Button>
                  <Button
                    onClick={handleAddFromJson}
                    disabled={!jsonPreview || addProductMutation.isPending}
                    className="flex-1"
                    data-testid="btn-add-from-json"
                  >
                    {addProductMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Adicionar Produto
                  </Button>
                </div>

                {jsonError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>{jsonError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                <Label>Pré-visualização</Label>
                {jsonPreview ? (
                  renderProductCard(jsonPreview, false)
                ) : (
                  <Card className="min-h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileJson className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Cole o JSON e clique em Validar</p>
                    </div>
                  </Card>
                )}

                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Campos obrigatórios:</strong> asin, title, imageUrl, productUrl, price
                    <br />
                    <strong>Campos opcionais:</strong> brand, category, originalPrice, rating, reviewCount, isPrime
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Filtros de Busca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Palavras-chave</Label>
                    <Input
                      placeholder="Ex: garrafa térmica bebê"
                      value={filters.keywords}
                      onChange={(e) => setFilters({...filters, keywords: e.target.value})}
                      data-testid="input-search-keywords"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(v) => setFilters({...filters, category: v})}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ordenar por</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(v) => setFilters({...filters, sortBy: v})}
                    >
                      <SelectTrigger data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Featured">Destaque</SelectItem>
                        <SelectItem value="Price:LowToHigh">Menor Preço</SelectItem>
                        <SelectItem value="Price:HighToLow">Maior Preço</SelectItem>
                        <SelectItem value="AvgCustomerReviews">Avaliação</SelectItem>
                        <SelectItem value="NewestArrivals">Mais Recentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="R$ 0,00"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      data-testid="input-min-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Máximo</Label>
                    <Input
                      type="number"
                      placeholder="R$ 0,00"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      data-testid="input-max-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Avaliação Mínima</Label>
                    <Select
                      value={filters.minRating}
                      onValueChange={(v) => setFilters({...filters, minRating: v})}
                    >
                      <SelectTrigger data-testid="select-min-rating">
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Qualquer</SelectItem>
                        <SelectItem value="4">4+ estrelas</SelectItem>
                        <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full"
                  data-testid="btn-search"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Buscar Produtos
                </Button>
              </CardContent>
            </Card>

            {searchError && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {searchResults.length} produto(s) encontrado(s)
                  </h3>
                </div>
                <div className="grid gap-3">
                  {searchResults.map(product => renderProductCard(product))}
                </div>
              </div>
            )}

            {!isSearching && searchResults.length === 0 && !searchError && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Use os filtros acima para buscar produtos na Amazon</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
