import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import RecommendationModal from "./RecommendationModal";

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

interface AmazonStyleCardProps {
  product: Product;
  index?: number;
  compact?: boolean;
}

export default function AmazonStyleCard({ product, index = 0, compact = false }: AmazonStyleCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: string | null) => {
    if (!price) return "Preço não disponível";
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const calculateDiscount = (original: string | null, current: string | null) => {
    if (!original || !current) return null;
    const originalPrice = parseFloat(original);
    const currentPrice = parseFloat(current);
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return discount > 0 ? Math.round(discount) : null;
  };

  const discount = calculateDiscount(product.originalPrice, product.currentPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative bg-white border border-gray-300 rounded-xl overflow-hidden
        transition-all duration-300 ease-in-out
        hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-orange-400
        ${compact ? 'w-52 p-3' : 'w-64 p-4'}
        font-sans text-center
      `}
      style={{ 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Inter, Arial, sans-serif'
      }}
    >
      {/* Favorite Button - Posicionado no topo direito */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1 backdrop-blur-sm">
        <FavoriteButton productId={product.id} size="sm" />
      </div>

      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-3 left-3 z-10 bg-red-700 text-white px-2 py-1 rounded-md text-xs font-bold">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <div className={`
        w-full bg-gray-50 rounded-lg overflow-hidden mb-4 flex items-center justify-center
        ${compact ? 'h-40' : 'h-48'}
      `}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-5xl mb-2">📦</div>
            <span className="text-sm">Imagem não disponível</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="text-center">
        <h3 
          className={`
            font-semibold text-gray-900 mb-3 leading-snug
            ${compact ? 'text-sm min-h-[2.4em]' : 'text-base min-h-[2.8em]'}
          `}
          title={product.title}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.floor(parseFloat(product.rating!))
                      ? 'text-orange-400 fill-orange-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-blue-600">({product.rating})</span>
          </div>
        )}

        {/* Price Section */}
        <div className="mb-3">
          <div className={`font-bold text-red-700 mb-1 ${compact ? 'text-lg' : 'text-xl'}`}>
            {formatPrice(product.currentPrice)}
          </div>
          {product.originalPrice && product.originalPrice !== product.currentPrice && (
            <div className="text-sm text-gray-500 line-through">
              De: {formatPrice(product.originalPrice)}
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
          {product.category}
        </div>

        {/* Why We Recommend Button */}
        <button
          className={`
            w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md mb-2
            transition-all duration-200 ease-in-out
            hover:transform hover:-translate-y-0.5 active:translate-y-0
            flex items-center justify-center gap-2
            ${compact ? 'py-2 px-3 text-xs' : 'py-2.5 px-4 text-sm'}
          `}
          onClick={() => setIsModalOpen(true)}
          data-testid={`button-why-recommend-${product.id}`}
        >
          💡 Porque Indicamos?
        </button>

        {/* Buy Button */}
        <button
          className={`
            w-full bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-md
            transition-all duration-200 ease-in-out
            hover:transform hover:-translate-y-0.5 active:translate-y-0
            flex items-center justify-center gap-2
            ${compact ? 'py-2.5 px-3 text-sm' : 'py-3 px-4 text-base'}
          `}
          onClick={() => window.open(product.affiliateLink, '_blank')}
          data-testid={`button-buy-${product.id}`}
        >
          <ExternalLink className="w-4 h-4" />
          Comprar na Amazon
        </button>
      </div>

      {/* Recommendation Modal */}
      <RecommendationModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}