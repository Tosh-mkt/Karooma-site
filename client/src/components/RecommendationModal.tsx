import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface RecommendationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Função para gerar recomendações baseadas no produto
const generateRecommendations = (product: Product) => {
  const baseReasons = [
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: "Alta Qualidade",
      description: "Produto com excelentes avaliações dos usuários e qualidade comprovada."
    },
    {
      icon: <Check className="w-5 h-5 text-green-500" />,
      title: "Custo-Benefício",
      description: "Oferece o melhor valor pelo preço, ideal para quem busca economia inteligente."
    },
    {
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      title: "Recomendado por Mães",
      description: "Testado e aprovado por mães reais que compartilham experiências similares."
    }
  ];

  // Adiciona razões específicas baseadas no produto
  const specificReasons = [];

  if (product.rating && parseFloat(product.rating) >= 4.0) {
    specificReasons.push({
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: "Avaliação Excelente",
      description: `Nota ${product.rating} de 5.0 estrelas, confirmando a satisfação dos usuários.`
    });
  }

  if (product.discount && product.discount > 20) {
    specificReasons.push({
      icon: <ShoppingBag className="w-5 h-5 text-red-500" />,
      title: "Desconto Especial",
      description: `Oferta imperdível com ${product.discount}% de desconto no preço original.`
    });
  }

  // Razões específicas por categoria
  const categoryReasons: Record<string, any> = {
    "Eletrônicos": {
      icon: <Check className="w-5 h-5 text-blue-500" />,
      title: "Tecnologia Confiável",
      description: "Dispositivo moderno que simplifica o dia a dia e traz praticidade para a rotina."
    },
    "Casa": {
      icon: <Heart className="w-5 h-5 text-purple-500" />,
      title: "Facilita a Vida Doméstica",
      description: "Produto que otimiza tarefas do lar, proporcionando mais tempo para você."
    },
    "Livros": {
      icon: <Star className="w-5 h-5 text-orange-500" />,
      title: "Desenvolvimento Pessoal",
      description: "Conteúdo valioso que contribui para seu crescimento e bem-estar."
    }
  };

  if (categoryReasons[product.category]) {
    specificReasons.push(categoryReasons[product.category]);
  }

  return [...specificReasons, ...baseReasons.slice(0, 3 - specificReasons.length)];
};

export default function RecommendationModal({ product, isOpen, onClose }: RecommendationModalProps) {
  const recommendations = generateRecommendations(product);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  data-testid="button-close-modal"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    💡
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Porque Indicamos?</h2>
                    <p className="text-white/80 text-sm">Razões para nossa recomendação</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex gap-4">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-600">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-6 space-y-4 max-h-60 overflow-y-auto">
                {recommendations.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {reason.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {reason.title}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center mb-4">
                  Nossas recomendações são baseadas em análise de qualidade, custo-benefício e experiência de usuários reais.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid="button-close-recommendation"
                  >
                    Entendi
                  </Button>
                  <Button
                    onClick={() => {
                      window.open(product.affiliateLink, '_blank');
                      onClose();
                    }}
                    size="sm"
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    data-testid="button-buy-from-modal"
                  >
                    Ver na Amazon
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}