import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, ChevronDown, Heart, Filter, X, Clock, Star, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProductCard } from "@/components/content/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function TestFiltersClean() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters baseado no mapa
  const [selectedPrimaryTag, setSelectedPrimaryTag] = useState("");
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);

  const { isAuthenticated } = useAuth();

  // Invalidate cache on component mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  }, []);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery<Product[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated && showFavorites,
  });

  // TAGS PRIMÁRIOS - Baseado no mapa de categorização
  const primaryTags = [
    { 
      id: "comer-preparar", 
      label: "Comer e Preparar", 
      emoji: "🍽️", 
      color: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg",
      description: "Alimentação e preparo de refeições",
      subcategories: ["CRIANÇA", "BEBÊ", "FAMÍLIA"]
    },
    { 
      id: "presentear", 
      label: "Presentear", 
      emoji: "🎁", 
      color: "bg-purple-500 hover:bg-purple-600 text-white shadow-lg",
      description: "Presentes para ocasiões especiais",
      subcategories: ["PRESENTE PARA OCASIÕES", "PRESENTE POR IDADE", "BEBÊ", "CRIANÇA", "FAMÍLIA", "PRIMEIROS SOCORROS"]
    },
    { 
      id: "sono-relaxamento", 
      label: "Sono e Relaxamento", 
      emoji: "😴", 
      color: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
      description: "Produtos para dormir e relaxar",
      subcategories: ["BEBÊ", "CRIANÇA", "PAIS E CUIDADORES"]
    },
    { 
      id: "aprender-brincar", 
      label: "Aprender e Brincar", 
      emoji: "🎨", 
      color: "bg-green-500 hover:bg-green-600 text-white shadow-lg",
      description: "Educação e diversão",
      subcategories: ["BEBÊ", "CRIANÇA", "FAMÍLIA"]
    },
    { 
      id: "sair-viajar", 
      label: "Sair e Viajar", 
      emoji: "🚗", 
      color: "bg-teal-500 hover:bg-teal-600 text-white shadow-lg",
      description: "Mobilidade e viagens",
      subcategories: ["BEBÊ", "CRIANÇA", "FAMÍLIA", "PRIMEIROS SOCORROS", "CARRO"]
    },
    { 
      id: "organizacao", 
      label: "Organização", 
      emoji: "📦", 
      color: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg",
      description: "Organizar casa e espaços",
      subcategories: ["CASA", "COZINHA", "ÁREA DE SERVIÇO", "QUARTO DO BEBÊ", "QUARTO DA CRIANÇA", "CARRO"]
    },
    { 
      id: "saude-seguranca", 
      label: "Saúde e Segurança", 
      emoji: "🏥", 
      color: "bg-red-500 hover:bg-red-600 text-white shadow-lg",
      description: "Cuidados médicos e segurança",
      subcategories: ["CASA", "COZINHA", "ÁREA DE SERVIÇO", "QUARTO DO BEBÊ", "QUARTO DA CRIANÇA", "CARRO"]
    },
    { 
      id: "decorar-brilhar", 
      label: "Decorar e Brilhar", 
      emoji: "✨", 
      color: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg",
      description: "Decoração e estética",
      subcategories: ["CASA", "COZINHA", "ÁREA DE SERVIÇO", "QUARTO DO BEBÊ", "QUARTO DA CRIANÇA", "CARRO"]
    }
  ];

  // SUBCATEGORIAS POR PÚBLICO-ALVO
  const targetAudience = [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-blue-100 text-blue-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" },
    { id: "pais-cuidadores", label: "Pais e Cuidadores", icon: "👥", color: "bg-orange-100 text-orange-800" },
  ];

  // AMBIENTES E LOCAIS
  const environments = [
    { id: "casa", label: "Casa", icon: "🏠", color: "bg-yellow-100 text-yellow-800" },
    { id: "cozinha", label: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-800" },
    { id: "area-servico", label: "Área de Serviço", icon: "🧺", color: "bg-blue-100 text-blue-800" },
    { id: "quarto-bebe", label: "Quarto do Bebê", icon: "🛏️", color: "bg-pink-100 text-pink-800" },
    { id: "quarto-crianca", label: "Quarto da Criança", icon: "🎪", color: "bg-green-100 text-green-800" },
    { id: "carro", label: "Carro", icon: "🚗", color: "bg-gray-100 text-gray-800" },
    { id: "primeiros-socorros", label: "Primeiros Socorros", icon: "🏥", color: "bg-red-100 text-red-800" },
  ];

  // OCASIÕES ESPECIAIS
  const specialOccasions = [
    { id: "presente-ocasioes", label: "Presente para Ocasiões", icon: "🎉" },
    { id: "presente-idade", label: "Presente por Idade", icon: "🎂" },
    { id: "emergencia", label: "Emergência", icon: "🚨" },
    { id: "dia-dia", label: "Uso Diário", icon: "📅" },
    { id: "viagem", label: "Viagem", icon: "✈️" },
  ];

  // HIERARQUIA QUATERNÁRIA - Categorias tradicionais
  const categories = [
    { id: "all", label: "Todos", icon: "🛍️", color: "bg-gray-100 hover:bg-gray-200 text-gray-700" },
    { id: "sleep", label: "Sono & Relaxamento", icon: "😴", color: "bg-blue-100 hover:bg-blue-200 text-blue-700" },
    { id: "meals", label: "Refeições Práticas", icon: "🍽️", color: "bg-orange-100 hover:bg-orange-200 text-orange-700" },
    { id: "travel", label: "Mobilidade", icon: "🚗", color: "bg-green-100 hover:bg-green-200 text-green-700" },
    { id: "learning", label: "Aprender & Brincar", icon: "🎨", color: "bg-purple-100 hover:bg-purple-200 text-purple-700" },
    { id: "selfcare", label: "Cuidado dos Pais", icon: "💆‍♀️", color: "bg-pink-100 hover:bg-pink-200 text-pink-700" },
  ];

  const sourceProducts = showFavorites ? favorites : products;
  
  const filteredProducts = sourceProducts?.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price range filter - convert decimal to number for comparison
    const currentPrice = product.currentPrice ? parseFloat(product.currentPrice.toString()) : 0;
    const matchesPrice = currentPrice >= selectedPriceRange[0] && currentPrice <= selectedPriceRange[1];
    
    // Rating filter - convert decimal to number for comparison
    const productRating = product.rating ? parseFloat(product.rating.toString()) : 0;
    const matchesRating = selectedRating === 0 || productRating >= selectedRating;
    
    return matchesCategory && matchesSearch && matchesPrice && matchesRating;
  }) || [];

  const currentLoading = showFavorites ? favoritesLoading : isLoading;

  const activeFiltersCount = [selectedPrimaryTag].filter(Boolean).length + 
                           selectedTargetAudience.length + selectedEnvironments.length + selectedOccasions.length +
                           (selectedRating > 0 ? 1 : 0) + (selectedPriceRange[1] < 1000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedPrimaryTag("");
    setSelectedTargetAudience([]);
    setSelectedEnvironments([]);
    setSelectedOccasions([]);
    setSelectedRating(0);
    setSelectedPriceRange([0, 1000]);
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const toggleTargetAudience = (audienceId: string) => {
    setSelectedTargetAudience(prev => 
      prev.includes(audienceId) 
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  const toggleEnvironment = (envId: string) => {
    setSelectedEnvironments(prev => 
      prev.includes(envId) 
        ? prev.filter(id => id !== envId)
        : [...prev, envId]
    );
  };

  const toggleOccasion = (occasionId: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasionId) 
        ? prev.filter(id => id !== occasionId)
        : [...prev, occasionId]
    );
  };

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-fredoka text-5xl gradient-text mb-4">
              🧪 Hierarquia Visual Melhorada
            </h1>
            <p className="font-poppins text-xl text-gray-600">
              Interface organizada por níveis de importância visual e contraste otimizado
            </p>
          </motion.div>

          {/* Search and Filter Toggle - SEMPRE VISÍVEL */}
          <motion.div 
            className="mb-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar - Máxima prioridade visual */}
            <div className="relative max-w-lg mx-auto">
              <Input
                type="text"
                placeholder="Que produto você precisa?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl bg-white shadow-lg border-2 border-white/50 focus:border-purple-400 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
            </div>

            {/* Quick Actions - Alta prioridade */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <GradientButton
                variant={showFilters ? "primary" : "glass"}
                onClick={() => setShowFilters(!showFilters)}
                className="relative text-lg px-6 py-3"
                size="lg"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtros Inteligentes
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white font-bold text-sm px-2 py-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </GradientButton>

              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearAllFilters} size="lg" className="text-lg px-6 py-3">
                  <X className="w-5 h-5 mr-2" />
                  Limpar Todos
                </Button>
              )}
            </div>
          </motion.div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                  
                  {/* NÍVEL 1: TAGS PRIMÁRIOS PRINCIPAIS */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-4 h-4 bg-white rounded-full mr-4 animate-pulse"></div>
                      <h2 className="font-fredoka text-3xl text-white">🏷️ Escolha a categoria principal:</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {primaryTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => setSelectedPrimaryTag(selectedPrimaryTag === tag.id ? "" : tag.id)}
                          className={`
                            group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform
                            ${selectedPrimaryTag === tag.id 
                              ? `${tag.color} scale-105 shadow-2xl ring-4 ring-white/30` 
                              : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/30 hover:shadow-xl hover:scale-102'
                            }
                          `}
                        >
                          <div className="text-center">
                            <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                              {tag.emoji}
                            </span>
                            <div className={`font-outfit font-bold text-lg mb-2 ${
                              selectedPrimaryTag === tag.id ? 'text-white' : 'text-white'
                            }`}>
                              {tag.label}
                            </div>
                            <div className={`text-xs ${
                              selectedPrimaryTag === tag.id ? 'text-white/90' : 'text-white/80'
                            }`}>
                              {tag.description}
                            </div>
                            {selectedPrimaryTag === tag.id && tag.subcategories && (
                              <div className="mt-3 text-xs text-white/70">
                                Incluindo: {tag.subcategories.slice(0, 2).join(", ")}...
                              </div>
                            )}
                          </div>
                          {selectedPrimaryTag === tag.id && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NÍVEL 2: FILTROS SECUNDÁRIOS */}
                  <div className="p-6 bg-gray-50 space-y-8">
                    
                    {/* Público-Alvo */}
                    <div className="border-l-4 border-purple-400 pl-6">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                        <h3 className="font-outfit text-2xl text-gray-800">👥 Para quem é o produto?</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {targetAudience.map((audience) => (
                          <button
                            key={audience.id}
                            onClick={() => toggleTargetAudience(audience.id)}
                            className={`
                              flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                              ${selectedTargetAudience.includes(audience.id) 
                                ? `${audience.color} shadow-lg transform scale-105 ring-2 ring-purple-300` 
                                : `${audience.color} hover:shadow-md border border-gray-200`
                              }
                            `}
                          >
                            <span className="mr-2 text-lg">{audience.icon}</span>
                            <span>{audience.label}</span>
                            {selectedTargetAudience.includes(audience.id) && (
                              <span className="ml-2 text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ambientes */}
                    <div className="border-l-4 border-blue-400 pl-6">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                        <h3 className="font-outfit text-2xl text-gray-800">🏠 Em que ambiente será usado?</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {environments.map((env) => (
                          <button
                            key={env.id}
                            onClick={() => toggleEnvironment(env.id)}
                            className={`
                              flex items-center p-3 rounded-xl text-sm transition-all duration-200
                              ${selectedEnvironments.includes(env.id) 
                                ? `${env.color} shadow-lg transform scale-105 ring-2 ring-blue-300` 
                                : `${env.color} hover:shadow-md border border-gray-200`
                              }
                            `}
                          >
                            <span className="mr-2">{env.icon}</span>
                            <span className="font-medium">{env.label}</span>
                            {selectedEnvironments.includes(env.id) && (
                              <span className="ml-auto text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ocasiões */}
                    <div className="border-l-4 border-green-400 pl-6">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <h3 className="font-outfit text-2xl text-gray-800">🎉 Para qual ocasião?</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {specialOccasions.map((occasion) => (
                          <button
                            key={occasion.id}
                            onClick={() => toggleOccasion(occasion.id)}
                            className={`
                              flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                              ${selectedOccasions.includes(occasion.id) 
                                ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                              }
                            `}
                          >
                            <span className="mr-2">{occasion.icon}</span>
                            <span>{occasion.label}</span>
                            {selectedOccasions.includes(occasion.id) && (
                              <span className="ml-2 text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* NÍVEL 3: FILTROS AVANÇADOS (COLAPSÁVEIS) */}
                  <div className="bg-gray-100 border-t border-gray-200">
                    <details className="group">
                      <summary className="cursor-pointer p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                            <h4 className="font-outfit text-xl text-gray-600">⚙️ Filtros Avançados</h4>
                          </div>
                          <ChevronDown className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      
                      <div className="px-6 pb-6 space-y-6">
                        {/* Resumo de Filtros Ativos */}
                        {(selectedPrimaryTag || selectedTargetAudience.length > 0 || selectedEnvironments.length > 0 || selectedOccasions.length > 0) && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <h5 className="font-poppins text-sm font-semibold text-blue-800 mb-3">Filtros Selecionados:</h5>
                            <div className="space-y-2 text-sm">
                              {selectedPrimaryTag && (
                                <div className="flex items-center text-blue-700">
                                  <span className="mr-2">🏷️</span>
                                  <span className="font-medium">Tag Principal:</span>
                                  <span className="ml-2">{primaryTags.find(t => t.id === selectedPrimaryTag)?.label}</span>
                                </div>
                              )}
                              {selectedTargetAudience.length > 0 && (
                                <div className="flex items-center text-blue-700">
                                  <span className="mr-2">👥</span>
                                  <span className="font-medium">Público:</span>
                                  <span className="ml-2">{selectedTargetAudience.map(id => targetAudience.find(t => t.id === id)?.label).join(", ")}</span>
                                </div>
                              )}
                              {selectedEnvironments.length > 0 && (
                                <div className="flex items-center text-blue-700">
                                  <span className="mr-2">🏠</span>
                                  <span className="font-medium">Ambientes:</span>
                                  <span className="ml-2">{selectedEnvironments.map(id => environments.find(e => e.id === id)?.label).join(", ")}</span>
                                </div>
                              )}
                              {selectedOccasions.length > 0 && (
                                <div className="flex items-center text-blue-700">
                                  <span className="mr-2">🎉</span>
                                  <span className="font-medium">Ocasiões:</span>
                                  <span className="ml-2">{selectedOccasions.map(id => specialOccasions.find(o => o.id === id)?.label).join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Price Range */}
                        <div>
                          <h5 className="font-poppins text-lg font-semibold text-gray-700 mb-3">Faixa de Preço:</h5>
                          <div className="px-4">
                            <Slider
                              value={selectedPriceRange}
                              onValueChange={setSelectedPriceRange}
                              max={1000}
                              min={0}
                              step={10}
                              className="mb-4"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                              <span className="font-medium">R$ {selectedPriceRange[0]}</span>
                              <span className="font-medium">R$ {selectedPriceRange[1]}{selectedPriceRange[1] >= 1000 ? "+" : ""}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <h5 className="font-poppins text-lg font-semibold text-gray-700 mb-3">Avaliação Mínima:</h5>
                          <div className="flex gap-2">
                            {[0, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setSelectedRating(rating)}
                                className={`
                                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                                  ${selectedRating === rating 
                                    ? 'bg-yellow-500 text-white shadow-md' 
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-yellow-50'
                                  }
                                `}
                              >
                                {rating === 0 ? "Todas" : `${rating}+ ⭐`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NÍVEL 4: CATEGORIAS TRADICIONAIS - Menor importância visual */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-4">
              <h4 className="font-poppins text-lg text-gray-500">Ou procure por categoria:</h4>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all border
                    ${selectedCategory === category.id 
                      ? `${category.color} border-current shadow-md` 
                      : `${category.color} border-gray-200 hover:shadow-sm`
                    }
                  `}
                >
                  <span className="mr-2 text-base">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CONTADOR DE RESULTADOS - Feedback visual importante */}
          <motion.div 
            className="text-center mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-3xl font-fredoka gradient-text mb-2">
              {filteredProducts.length} produtos encontrados
            </div>
            {activeFiltersCount > 0 && (
              <div className="text-gray-600 font-poppins">
                com <strong>{activeFiltersCount}</strong> filtros ativos
                <button 
                  onClick={clearAllFilters}
                  className="ml-4 text-purple-600 hover:text-purple-800 underline font-medium"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </motion.div>

          {/* Products Grid */}
          {currentLoading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse" style={{ width: '264px', height: '450px' }}>
                  <div className="bg-gray-200 rounded-3xl h-full w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              className="flex flex-wrap justify-center gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredProducts.map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl max-w-md mx-auto shadow-lg">
                <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="font-fredoka text-3xl text-gray-600 mb-4">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 mb-6 font-poppins text-lg">
                  Tente ajustar os filtros ou termo de busca
                </p>
                <Button onClick={clearAllFilters} variant="outline" size="lg" className="text-lg px-8 py-3">
                  Limpar todos os filtros
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Como Te Auxiliamos section */}
      <section className="py-16 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="font-fredoka text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🎨 Hierarquia Visual Aplicada
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-8">
              Interface organizada por níveis de importância: Emoções (primário), Contexto (secundário), 
              Filtros avançados (terciário), Categorias (quaternário). Contraste otimizado para WCAG AA.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-indigo-500 text-white p-6 text-center rounded-2xl">
                <div className="w-4 h-4 bg-white rounded-full mx-auto mb-4"></div>
                <h4 className="font-outfit text-lg font-bold mb-3">Nível 1 - Primário</h4>
                <p className="text-sm opacity-90">
                  Filtros emocionais - máxima prioridade visual
                </p>
              </div>
              
              <div className="bg-purple-400 text-white p-6 text-center rounded-2xl">
                <div className="w-3 h-3 bg-white rounded-full mx-auto mb-4"></div>
                <h4 className="font-outfit text-lg font-bold mb-3">Nível 2 - Secundário</h4>
                <p className="text-sm opacity-90">
                  Contextos e idades - alta importância
                </p>
              </div>
              
              <div className="bg-gray-500 text-white p-6 text-center rounded-2xl">
                <div className="w-2 h-2 bg-white rounded-full mx-auto mb-4"></div>
                <h4 className="font-outfit text-lg font-bold mb-3">Nível 3 - Terciário</h4>
                <p className="text-sm opacity-90">
                  Filtros avançados - colapsáveis
                </p>
              </div>
              
              <div className="bg-gray-300 text-gray-700 p-6 text-center rounded-2xl">
                <div className="w-1 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
                <h4 className="font-outfit text-lg font-bold mb-3">Nível 4 - Quaternário</h4>
                <p className="text-sm opacity-75">
                  Categorias tradicionais - menor destaque
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}