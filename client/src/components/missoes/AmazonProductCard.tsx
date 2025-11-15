import { motion } from "framer-motion";
import { ExternalLink, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AmazonProduct {
  asin: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  productUrl: string;
}

interface AmazonProductCardProps {
  product: AmazonProduct;
  index?: number;
}

export function AmazonProductCard({ product, index = 0 }: AmazonProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || !product.currentPrice || product.originalPrice <= product.currentPrice) {
      return 0;
    }
    return Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100);
  };

  const discount = calculateDiscount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
      style={{ width: '100%', maxWidth: '180px', height: '380px' }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 overflow-hidden h-full w-full flex flex-col">
        {/* Product Image */}
        <div 
          className="relative overflow-hidden cursor-pointer" 
          style={{ height: '150px' }}
          onClick={() => window.open(product.productUrl, '_blank')}
          data-testid={`image-amazon-product-${product.asin}`}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 text-white font-semibold text-xs">
                -{discount}%
              </Badge>
            </div>
          )}

          {/* Prime Badge */}
          {product.isPrime && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-500 text-white font-semibold text-xs">
                Prime
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
          <CardTitle 
            className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight" 
            style={{ height: '2.5em', overflow: 'hidden' }}
          >
            {product.title}
          </CardTitle>
          {product.brand && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {product.brand}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-2 px-3 pb-3 flex-1 flex flex-col">
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="mb-3 flex-shrink-0">
            {product.currentPrice ? (
              <>
                <div className="text-lg font-bold text-red-700 dark:text-red-400">
                  {formatPrice(product.currentPrice)}
                </div>
                {product.originalPrice && product.originalPrice > product.currentPrice && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Produto recomendado
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Action Button */}
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-all duration-200"
            data-testid={`button-view-amazon-${product.asin}`}
          >
            <ExternalLink className="h-4 w-4" />
            Ver na Amazon
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}
