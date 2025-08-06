import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Trash2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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

  const { data: favorites = [], isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest(`/api/favorites/${productId}`, "DELETE");
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

  const formatPrice = (price: string | null) => {
    if (!price) return "Preço não disponível";
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const calculateSavings = (original: string | null, current: string | null) => {
    if (!original || !current) return null;
    const originalPrice = parseFloat(original);
    const currentPrice = parseFloat(current);
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
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-pink-50"
            >
              Voltar
            </Button>
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
            <Link href="/">
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
              const savings = calculateSavings(product.originalPrice, product.currentPrice);
              
              return (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/20 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <ShoppingCart className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discount && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{product.discount}%
                        </Badge>
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

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {product.title}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {product.description && (
                        <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </CardDescription>
                      )}

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            {formatPrice(product.currentPrice)}
                          </span>
                          {product.originalPrice && product.originalPrice !== product.currentPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        {savings && (
                          <p className="text-sm text-green-600 font-medium">
                            Economia de {formatPrice(savings.toString())}
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center mb-4">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
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
  );
}