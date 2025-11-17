import { motion } from "framer-motion";
import { ExternalLink, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeaturedApparel } from "@shared/schema";

interface ApparelCardProps {
  apparel: FeaturedApparel;
  index?: number;
}

export function ApparelCard({ apparel, index = 0 }: ApparelCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group w-full max-w-[264px]"
    >
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 overflow-hidden w-full flex flex-col" style={{ minHeight: '450px' }}>
        {/* Product Image */}
        <div 
          className="relative overflow-hidden cursor-pointer" 
          style={{ height: '220px' }}
          onClick={() => window.open(apparel.montinkUrl, '_blank')}
          data-testid={`image-apparel-${apparel.id}`}
        >
          {apparel.imageUrl ? (
            <img
              src={apparel.imageUrl}
              alt={apparel.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Featured Badge */}
          {apparel.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-purple-500 text-white font-semibold text-xs">
                Destaque
              </Badge>
            </div>
          )}

          {/* Category Badge */}
          {apparel.category && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-pink-500 text-white font-semibold text-xs">
                {apparel.category}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
          <CardTitle 
            className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight" 
            style={{ height: '2.5em', overflow: 'hidden' }}
          >
            {apparel.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-2 px-3 pb-3 flex-1 flex flex-col">
          {/* Description */}
          {apparel.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
              {apparel.description}
            </p>
          )}

          {/* Pricing */}
          <div className="mb-3 flex-shrink-0">
            <div className="text-lg font-bold text-pink-700 dark:text-pink-400">
              {formatPrice(Number(apparel.price))}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Action Button */}
          <a
            href={apparel.montinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-all duration-200"
            data-testid={`button-view-apparel-${apparel.id}`}
          >
            <ExternalLink className="h-4 w-4" />
            Ver na Montink
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}
