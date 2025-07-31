import { motion } from "framer-motion";
import { Heart, Star, ExternalLink } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Product } from "@shared/schema";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handlePurchase = () => {
    // Track affiliate click
    console.log('Affiliate click tracked:', product.affiliateLink);
    window.open(product.affiliateLink, '_blank');
  };

  const discountPercent = product.originalPrice && product.currentPrice 
    ? Math.round((1 - (Number(product.currentPrice) / Number(product.originalPrice))) * 100)
    : product.discount;

  return (
    <AnimatedCard delay={index * 0.1} className="group overflow-hidden">
      <div className="relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-4 right-4">
          {discountPercent && (
            <Badge className="bg-red-500 text-white">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        
        <div className="absolute top-4 left-4">
          <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            {product.rating || "4.8"}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
            {product.category}
          </Badge>
          <motion.button
            className={`transition-colors duration-300 ${
              isLiked ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
            }`}
            onClick={() => setIsLiked(!isLiked)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </motion.button>
        </div>
        
        <h3 className="font-poppins font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-gray-600 font-inter text-sm mb-4 line-clamp-3">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-pink-500">
              R$ {product.currentPrice}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                R$ {product.originalPrice}
              </span>
            )}
          </div>
        </div>
        
        <GradientButton 
          onClick={handlePurchase}
          className="w-full"
        >
          Comprar Agora
          <ExternalLink className="ml-2 w-4 h-4" />
        </GradientButton>
      </div>
    </AnimatedCard>
  );
}
