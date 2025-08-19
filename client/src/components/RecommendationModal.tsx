import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Heart, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  // Novos campos para avaliações
  teamEvaluation?: string | null;
  benefits?: string | null;
  evaluators?: string | null;
  introduction?: string | null;
  tags?: string | null;
}

interface RecommendationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Função para gerar recomendações baseadas nos dados reais dos especialistas
const generateRecommendations = (product: Product) => {
  const recommendations = [];
  
  // Se tem avaliação da equipe Karooma, usa como principal recomendação
  if (product.teamEvaluation) {
    recommendations.push({
      icon: <Star className="w-5 h-5 text-purple-500" />,
      title: "Avaliação Equipe KAROOMA",
      description: product.teamEvaluation, // Texto completo
      fullText: true
    });
  }

  // Se tem benefícios por avaliador, mostra completo
  if (product.benefits) {
    const benefitsText = product.benefits.replace(/<br>/g, '\n');
    recommendations.push({
      icon: <Check className="w-5 h-5 text-green-500" />,
      title: "Benefícios Validados",
      description: benefitsText, // Texto completo
      fullText: true
    });
  }

  // Rating dos usuários
  if (product.rating && parseFloat(product.rating) >= 4.0) {
    recommendations.push({
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: "Avaliação Excelente",
      description: `Nota ${product.rating} de 5.0 estrelas, confirmando a satisfação dos usuários.`,
      fullText: false
    });
  }

  // Tags como seção separada
  if (product.tags) {
    const tagsFormatted = product.tags.replace(/<br>/g, '\n');
    recommendations.push({
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      title: "Tags e Benefícios",
      description: tagsFormatted, // Tags completas
      fullText: true
    });
  }

  // Fallback para produtos sem dados de especialistas
  if (recommendations.length === 0) {
    recommendations.push(
      {
        icon: <Check className="w-5 h-5 text-blue-500" />,
        title: "Produto Selecionado",
        description: "Escolhido pela nossa equipe para facilitar o seu dia a dia.",
        fullText: false
      },
      {
        icon: <Heart className="w-5 h-5 text-pink-500" />,
        title: "Recomendado por Mães",
        description: "Testado e aprovado por mães reais que compartilham experiências similares.",
        fullText: false
      }
    );
  }

  return recommendations.slice(0, 4); // Máximo 4 recomendações incluindo tags
};

// Componente para texto expansível
function ExpandableText({ text, title }: { text: string; title: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > 120;
  const displayText = isExpanded || !isLong ? text : text.substring(0, 120) + "...";

  return (
    <div>
      <h4 className="font-medium text-gray-900 text-sm mb-1">
        {title}
      </h4>
      <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-xs mt-1 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              Ver menos <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Ver mais <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function RecommendationModal({ product, isOpen, onClose }: RecommendationModalProps) {
  const recommendations = generateRecommendations(product);
  const { toast } = useToast();

  const handleAmazonClick = () => {
    if (!product.affiliateLink) {
      toast({
        title: "Link indisponível",
        description: "O link afiliado para este produto não está disponível no momento.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(product.affiliateLink, '_blank');
    onClose();
  };

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

              {/* Introduction Section */}
              {product.introduction && (
                <div className="p-6 border-b border-gray-100 bg-blue-50/50">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">K</span>
                      </div>
                    </div>
                    <ExpandableText text={product.introduction} title="Análise da Equipe Karooma" />
                  </div>
                </div>
              )}

              {/* Evaluators Section */}
              {product.evaluators && (
                <div className="p-6 border-b border-gray-100 bg-purple-50/50">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">👥</span>
                      </div>
                    </div>
                    <ExpandableText text={product.evaluators.replace(/<br>/g, '\n')} title="Equipe de Especialistas" />
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
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
                    <div className="flex-1">
                      {reason.fullText ? (
                        <ExpandableText text={reason.description} title={reason.title} />
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {reason.title}
                          </h4>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            {reason.description}
                          </p>
                        </div>
                      )}
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
                    onClick={handleAmazonClick}
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