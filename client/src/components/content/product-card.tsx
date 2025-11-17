import { motion } from "framer-motion";
import { ExternalLink, ImageIcon, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import AlertModal from "@/components/AlertModal";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const calculateSavings = (originalPrice?: string | number | null, currentPrice?: string | number | null) => {
    if (!originalPrice || !currentPrice) return null;
    
    const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
    const current = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
    
    if (original <= current) return null;
    
    return original - current;
  };

  const savings = calculateSavings(product.originalPrice, product.currentPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group w-full max-w-[264px]"
    >
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/20 overflow-hidden w-full flex flex-col" style={{ minHeight: '520px' }}>
        {/* Product Image */}
        <div 
          className="relative h-48 overflow-hidden cursor-pointer" 
          style={{ height: '200px' }}
          onClick={() => window.open(product.affiliateLink, '_blank')}
          data-testid={`image-product-${product.id}`}
        >
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
          
          {/* Favorite Button */}
          <div className="absolute top-2 right-2">
            <FavoriteButton productId={product.id} size="sm" />
          </div>
        </div>

        <CardHeader className="pb-2 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold text-gray-800 line-clamp-2 leading-tight mb-3 text-center" style={{ height: '2.8em', overflow: 'hidden' }}>
            {product.title}
          </CardTitle>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
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
                {product.currentPrice ? formatPrice(product.currentPrice) : 'Preço não disponível'}
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

          {/* Alert Button */}
          <div className="mb-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 text-xs py-2 flex items-center justify-center"
              onClick={() => setIsAlertModalOpen(true)}
              data-testid={`button-create-alert-${product.id}`}
            >
              <Bell className="h-3 w-3 mr-1.5" />
              Avisar Oferta
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              size="sm"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xs py-2.5 flex items-center justify-center"
              onClick={() => window.open(product.affiliateLink, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Ver Produto
            </Button>
          </div>
          
          {/* Favorite Button - Separate row for better layout */}
          <div className="mt-2 flex-shrink-0">
            <FavoriteButton productId={product.id} showText />
          </div>
        </CardContent>
      </Card>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        productId={product.id}
        productTitle={product.title}
        type="product"
      />
    </motion.div>
  );
}