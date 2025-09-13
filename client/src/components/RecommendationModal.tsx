import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, Users, Award, Shield, Target, ShoppingBag, Star, Heart } from "lucide-react";
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
  // Campos para avaliações estruturadas (camelCase do Drizzle ORM)
  teamEvaluation?: string | null;
  benefits?: string | null;
  evaluators?: string | null;
  introduction?: string | null;
  tags?: string | null;
  // Campos baseados no formato fornecido (camelCase do Drizzle ORM)
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
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content?: string;
}

// Função para verificar se texto contém apenas hashtags (dados incorretos)
const isHashtagOnlyText = (text: string): boolean => {
  if (!text || text.trim().length === 0) return true;
  
  // Remove espaços e verifica se contém apenas hashtags
  const cleanText = text.trim();
  const words = cleanText.split(/\s+/);
  
  // Se mais de 70% das palavras são hashtags, consideramos dados incorretos
  const hashtagCount = words.filter(word => word.startsWith('#')).length;
  const hashtagRatio = hashtagCount / words.length;
  
  return hashtagRatio > 0.7 || (words.length <= 5 && hashtagCount >= 3);
};

// Função para extrair avaliações dos especialistas
const parseSpecialistEvaluations = (product: Product): SpecialistEvaluation[] => {
  const evaluations: SpecialistEvaluation[] = [];

  // Avaliação da Nutricionista
  if (product.nutritionistEvaluation && !isHashtagOnlyText(product.nutritionistEvaluation)) {
    evaluations.push({
      id: "nutritionist",
      title: "Nutricionista",
      icon: <Heart className="w-4 h-4" />,
      color: "bg-pink-500",
      content: product.nutritionistEvaluation
    });
  }

  // Avaliação da Organizadora Doméstica
  if (product.organizerEvaluation && !isHashtagOnlyText(product.organizerEvaluation)) {
    evaluations.push({
      id: "organizer",
      title: "Organização Doméstica",
      icon: <Target className="w-4 h-4" />,
      color: "bg-blue-500",
      content: product.organizerEvaluation
    });
  }

  // Avaliação de Design e Usabilidade
  if (product.designEvaluation && !isHashtagOnlyText(product.designEvaluation)) {
    evaluations.push({
      id: "design",
      title: "Design e Usabilidade",
      icon: <Award className="w-4 h-4" />,
      color: "bg-purple-500",
      content: product.designEvaluation
    });
  }

  return evaluations;
};

// Componente compacto para especialista com expansão
function CompactSpecialistItem({ 
  evaluation, 
  isExpanded, 
  onToggle 
}: { 
  evaluation: SpecialistEvaluation; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Header clicável */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${evaluation.color} rounded-lg flex items-center justify-center text-white`}>
            {evaluation.icon}
          </div>
          <span className="font-semibold text-gray-900 text-sm text-left">
            {evaluation.title}
          </span>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      
      {/* Conteúdo expansível */}
      <AnimatePresence>
        {isExpanded && evaluation.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {evaluation.content}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RecommendationModal({ product, isOpen, onClose }: RecommendationModalProps) {
  const { toast } = useToast();
  
  // Log temporário para debug
  console.log("🔍 RecommendationModal - Product data:", {
    id: product.id,
    title: product.title,
    introduction: product.introduction,
    teamEvaluation: product.teamEvaluation,
    karoomaTeamEvaluation: product.karoomaTeamEvaluation,
    nutritionistEvaluation: product.nutritionistEvaluation,
    organizerEvaluation: product.organizerEvaluation,
    designEvaluation: product.designEvaluation,
    categoryTags: product.categoryTags,
    searchTags: product.searchTags
  });
  
  const specialistEvaluations = parseSpecialistEvaluations(product);
  console.log("🔍 Specialist evaluations found:", specialistEvaluations);
  
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
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

              <div className="flex-1 overflow-y-auto">
                {/* Introduction Section */}
                {product.introduction && (
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Análise da Curadoria KAROOMA</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.introduction}
                    </p>
                  </div>
                )}

                {/* Specialist Evaluations - Compact Layout */}
                {specialistEvaluations.length > 0 && (
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Avaliação da Equipe de Especialistas</h4>
                    </div>
                    <div className="space-y-2">
                      {specialistEvaluations.map((evaluation, index) => (
                        <motion.div
                          key={evaluation.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CompactSpecialistItem
                            evaluation={evaluation}
                            isExpanded={expandedItems[evaluation.id] || false}
                            onToggle={() => toggleExpanded(evaluation.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Karooma Team Evaluation */}
                {(product.karoomaTeamEvaluation || product.teamEvaluation) && 
                 !isHashtagOnlyText(product.karoomaTeamEvaluation || product.teamEvaluation || '') && (
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Avaliação Final KAROOMA</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.karoomaTeamEvaluation || product.teamEvaluation}
                    </p>
                  </div>
                )}

                {/* Tags Section */}
                {(categoryTags.length > 0 || searchTags.length > 0) && (
                  <div className="p-6">
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
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
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