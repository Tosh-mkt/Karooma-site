import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Heart, ShoppingBag, ChevronDown, ChevronUp, Users, Award, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  // Novos campos para avaliações estruturadas
  teamEvaluation?: string | null;
  benefits?: string | null;
  evaluators?: string | null;
  introduction?: string | null;
  tags?: string | null;
  // Novos campos baseados no formato fornecido
  nutritionistEvaluation?: string | null;
  organizerEvaluation?: string | null;
  designEvaluation?: string | null;
  karoomaTeamEvaluation?: string | null;
  categoryTags?: string | null;
  searchTags?: string | null;
}

interface RecommendationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

// Interface para estruturar as avaliações dos especialistas
interface SpecialistEvaluation {
  title: string;
  icon: React.ReactNode;
  color: string;
  pros?: string;
  cons?: string;
  content?: string;
}

// Função para extrair avaliações dos especialistas baseada no novo formato
const parseSpecialistEvaluations = (product: Product): SpecialistEvaluation[] => {
  const evaluations: SpecialistEvaluation[] = [];

  // Avaliação da Nutricionista
  if (product.nutritionistEvaluation) {
    evaluations.push({
      title: "Nutricionista",
      icon: <Heart className="w-4 h-4" />,
      color: "bg-pink-500",
      content: product.nutritionistEvaluation
    });
  }

  // Avaliação da Organizadora Doméstica
  if (product.organizerEvaluation) {
    evaluations.push({
      title: "Organização Doméstica",
      icon: <Target className="w-4 h-4" />,
      color: "bg-blue-500",
      content: product.organizerEvaluation
    });
  }

  // Avaliação de Design e Usabilidade
  if (product.designEvaluation) {
    evaluations.push({
      title: "Design e Usabilidade",
      icon: <Award className="w-4 h-4" />,
      color: "bg-purple-500",
      content: product.designEvaluation
    });
  }

  return evaluations;
};

// Componente para texto expansível melhorado
function ExpandableText({ text, title, maxLength = 200 }: { text: string; title: string; maxLength?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > maxLength;
  const displayText = isExpanded || !isLong ? text : text.substring(0, maxLength) + "...";

  return (
    <div>
      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm mt-2 flex items-center gap-1 transition-colors font-medium"
        >
          {isExpanded ? (
            <>
              Ver menos <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Ver mais <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Componente para seção de especialista individual
function SpecialistSection({ evaluation }: { evaluation: SpecialistEvaluation }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 ${evaluation.color} rounded-lg flex items-center justify-center text-white`}>
          {evaluation.icon}
        </div>
        <h4 className="font-semibold text-gray-900 text-sm">
          {evaluation.title}
        </h4>
      </div>
      
      {evaluation.content && (
        <ExpandableText text={evaluation.content} title={evaluation.title} maxLength={180} />
      )}
      
      {(evaluation.pros || evaluation.cons) && (
        <div className="mt-3 space-y-2">
          {evaluation.pros && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-700">Prós</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {evaluation.pros}
              </p>
            </div>
          )}
          
          {evaluation.cons && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <X className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-medium text-orange-700">Contras</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {evaluation.cons}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RecommendationModal({ product, isOpen, onClose }: RecommendationModalProps) {
  const { toast } = useToast();
  const specialistEvaluations = parseSpecialistEvaluations(product);

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

  // Parse das tags de categoria e pesquisa
  const categoryTags = product.categoryTags ? product.categoryTags.split(' ').filter(tag => tag.startsWith('#')) : [];
  const searchTags = product.searchTags ? product.searchTags.split(' ').filter(tag => tag.startsWith('#')) : [];

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
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden">
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  data-testid="button-close-modal"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Porque Indicamos?</h2>
                    <p className="text-white/80 text-sm">Razões para nossa recomendação</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex gap-4">
                  {product.imageUrl && (
                    <div className="w-20 h-20 bg-white rounded-xl p-2 shadow-sm flex-shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">
                      {product.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
                        </div>
                      )}
                      {product.currentPrice && (
                        <span className="text-sm font-bold text-green-600">
                          R$ {product.currentPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Introduction Section */}
              {product.introduction && (
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Análise da Curadoria KAROOMA</h4>
                  </div>
                  <ExpandableText text={product.introduction} title="Introdução" maxLength={150} />
                </div>
              )}

              {/* Specialist Evaluations */}
              {specialistEvaluations.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Equipe de Especialistas</h4>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {specialistEvaluations.map((evaluation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <SpecialistSection evaluation={evaluation} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Karooma Team Evaluation */}
              {(product.karoomaTeamEvaluation || product.teamEvaluation) && (
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Avaliação Final KAROOMA</h4>
                  </div>
                  <ExpandableText 
                    text={product.karoomaTeamEvaluation || product.teamEvaluation || ""} 
                    title="Avaliação da Equipe" 
                    maxLength={200} 
                  />
                </div>
              )}

              {/* Tags Section */}
              {(categoryTags.length > 0 || searchTags.length > 0) && (
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3">Tags e Categorias</h4>
                  <div className="space-y-3">
                    {categoryTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Benefícios:</p>
                        <div className="flex flex-wrap gap-1">
                          {categoryTags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {searchTags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Categorias:</p>
                        <div className="flex flex-wrap gap-1">
                          {searchTags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed">
                  Nossas recomendações são baseadas em análise rigorosa de qualidade, custo-benefício e experiência de mães reais.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-gray-100"
                    data-testid="button-close-recommendation"
                  >
                    Entendi
                  </Button>
                  <Button
                    onClick={handleAmazonClick}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                    data-testid="button-buy-from-modal"
                  >
                    <ShoppingBag className="w-4 h-4 mr-1" />
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