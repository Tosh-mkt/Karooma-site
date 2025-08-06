import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import FavoriteButton from "./FavoriteButton";

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

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
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

  const savings = calculateSavings(product.originalPrice, product.currentPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/20 overflow-hidden h-full">
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

          {/* Favorite Button */}
          <div className="absolute top-2 right-2">
            <FavoriteButton productId={product.id} size="sm" />
          </div>
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

        <CardContent className="pt-0 flex-1 flex flex-col">
          {product.description && (
            <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
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

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button 
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              onClick={() => window.open(product.affiliateLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Produto
            </Button>
            <FavoriteButton productId={product.id} showText />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}