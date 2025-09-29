import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Trash2, ShoppingCart, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import RecommendationModal from "@/components/RecommendationModal";

interface Product {
  id: string;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  currentPrice: string | null;
  originalPrice: string | null;
  affiliateLink: string;
  rating: string | null;
  discount: number | null;
  featured: boolean | null;
  createdAt: Date;
}

interface FavoriteWithProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: Product;
}

export default function Favorites() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: favorites = [], isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  // Debug SUPER simples - só verificar se executa
  console.log("COMPONENT EXECUTING!");

  // Log simples removido para evitar conflitos

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/favorites/${productId}`);
    },
    onMutate: (productId) => {
      setRemovingId(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removido dos favoritos",
        description: "O produto foi removido da sua lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto dos favoritos.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setRemovingId(null);
    },
  });

  const formatPrice = (price: any) => {
    console.log("FORMAT PRICE CALLED:", price, typeof price);
    
    // Se é null ou undefined
    if (price == null) {
      return "Preço não disponível";
    }
    
    // Converter para string e limpar
    const cleanPrice = String(price).trim();
    
    // Se está vazio ou é literalmente 'null'/'undefined' 
    if (!cleanPrice || cleanPrice === 'null' || cleanPrice === 'undefined') {
      return "Preço não disponível";
    }
    
    // Tentar converter para número
    const numPrice = parseFloat(cleanPrice);
    
    // Se não é um número válido
    if (isNaN(numPrice) || numPrice <= 0) {
      return "Preço não disponível";
    }
    
    // Formatar em reais
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const calculateSavings = (original: string | null | undefined | any, current: string | null | undefined | any) => {
    const originalStr = original ? String(original).trim() : null;
    const currentStr = current ? String(current).trim() : null;
    
    if (!originalStr || !currentStr || originalStr === 'null' || currentStr === 'null') return null;
    
    const originalPrice = parseFloat(originalStr);
    const currentPrice = parseFloat(currentStr);
    
    if (isNaN(originalPrice) || isNaN(currentPrice)) return null;
    
    const savings = originalPrice - currentPrice;
    return savings > 0 ? savings : null;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <Heart className="h-24 w-24 text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Faça login para ver seus favoritos
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Você precisa estar logado para acessar sua lista de produtos favoritos.
        </p>
        <Link href="/login">
          <Button>Fazer Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-pink-500" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Meus Favoritos
                </h1>
                <p className="text-gray-600 mt-1">
                  {favorites.length} {favorites.length === 1 ? 'produto salvo' : 'produtos salvos'}
                </p>
              </div>
            </div>
            <Link href="/produtos">
              <Button
                variant="outline"
                className="hover:bg-pink-50"
              >
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explore nossos produtos e clique no coração para adicionar aos seus favoritos!
            </p>
            <Link href="/produtos">
              <Button>Explorar Produtos</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.map((favorite, index) => {
              const product = favorite.product;
              console.log("PRODUCT IN RENDER:", product);
              
              const savings = calculateSavings(product.originalPrice, product.currentPrice);
              
              return (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                  style={{ width: '264px', height: '520px' }} // Fixed dimensions like Amazon cards
                >
                  <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/20 overflow-hidden h-full max-w-none w-full flex flex-col">
                    {/* Product Image */}
                    <div className="relative overflow-hidden flex-shrink-0" style={{ height: '200px' }}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-500 text-white font-semibold">
                            -{product.discount}% OFF
                          </Badge>
                        </div>
                      )}

                      {/* Remove from Favorites Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() => removeFavoriteMutation.mutate(product.id)}
                        disabled={removingId === product.id}
                      >
                        {removingId === product.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <CardHeader className="pb-2 px-4 pt-4 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-gray-800 line-clamp-2 leading-tight mb-3" style={{ height: '2.8em', overflow: 'hidden' }}>
                            {product.title}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-2 px-4 pb-4 flex-1 flex flex-col">
                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1 mb-3" style={{ height: '24px' }}>
                        {product.rating ? (
                          <>
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-gray-600">({product.rating})</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Sem avaliações</span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mb-3 text-center flex-shrink-0">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xl font-bold text-red-700">
                            {formatPrice(product.currentPrice)}
                          </span>
                        </div>
                        {product.originalPrice && product.originalPrice !== product.currentPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            De: {formatPrice(product.originalPrice)}
                          </div>
                        )}
                        {savings && (
                          <p className="text-sm text-green-600 font-medium">
                            Economia de {formatPrice(savings.toString())}
                          </p>
                        )}
                      </div>

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-1"></div>

                      {/* Why We Recommend Button */}
                      <div className="mb-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 text-sm py-2"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
                          data-testid={`button-why-recommend-${product.id}`}
                        >
                          💡 Porque Indicamos?
                        </Button>
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-sm py-2.5 flex-shrink-0"
                        onClick={() => window.open(product.affiliateLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Produto
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
    
    {/* Recommendation Modal */}
    {selectedProduct && (
      <RecommendationModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    )}
    </>
  );
}