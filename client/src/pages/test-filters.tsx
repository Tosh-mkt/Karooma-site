import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, ChevronDown, Heart, Filter, X, Clock, Star, DollarSign, Baby, Home, Utensils, Smartphone } from "lucide-react";
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

export default function TestFilters() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [quickNeeds, setQuickNeeds] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState("");

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

  // Filtros emocionais/contextuais - HIERARQUIA PRINCIPAL
  const moodFilters = [
    { id: "urgent", label: "Socorro, preciso urgente!", emoji: "🚨", color: "bg-red-500 text-white shadow-lg", priority: "primary" },
    { id: "simplify", label: "Quero facilitar minha vida", emoji: "😌", color: "bg-green-500 text-white shadow-lg", priority: "primary" },
    { id: "gift", label: "Presentear sem erro", emoji: "🎁", color: "bg-purple-500 text-white shadow-lg", priority: "primary" },
    { id: "discover", label: "Descobrir algo novo", emoji: "💡", color: "bg-blue-500 text-white shadow-lg", priority: "primary" },
  ];

  // Grupos por idade - HIERARQUIA SECUNDÁRIA
  const ageGroups = [
    { id: "newborn", label: "Recém-nascidos (0-6m)", icon: "👶", priority: "secondary" },
    { id: "baby", label: "Bebês (6m-2 anos)", icon: "🍼", priority: "secondary" },
    { id: "toddler", label: "Crianças pequenas (2-5 anos)", icon: "🧸", priority: "secondary" },
    { id: "school", label: "Idade escolar (6-12 anos)", icon: "🎒", priority: "secondary" },
    { id: "teen", label: "Adolescentes (13+ anos)", icon: "📱", priority: "secondary" },
    { id: "parents", label: "Para os pais", icon: "☕", priority: "secondary" },
  ];

  // Contextos de uso - HIERARQUIA SECUNDÁRIA
  const contexts = [
    { id: "morning", label: "Manhãs corridas", icon: "⏰", priority: "secondary" },
    { id: "mealtime", label: "Hora das refeições", icon: "🍽️", priority: "secondary" },
    { id: "sleep", label: "Noites tranquilas", icon: "🌙", priority: "secondary" },
    { id: "travel", label: "Na correria com filhos", icon: "🚗", priority: "secondary" },
    { id: "organization", label: "Organização da casa", icon: "📦", priority: "secondary" },
    { id: "selfcare", label: "Cuidado próprio", icon: "💆‍♀️", priority: "secondary" },
  ];

  // Necessidades rápidas - HIERARQUIA TERCIÁRIA
  const quickNeedOptions = [
    { id: "prime", label: "Entrega rápida", icon: "📦", priority: "tertiary" },
    { id: "budget", label: "Cabe no bolso", icon: "💰", priority: "tertiary" },
    { id: "tested", label: "Testado por mães", icon: "✅", priority: "tertiary" },
    { id: "bestseller", label: "Mais vendido", icon: "🔥", priority: "tertiary" },
    { id: "innovative", label: "Inovador", icon: "⚡", priority: "tertiary" },
  ];

  // Categorias melhoradas - HIERARQUIA QUATERNÁRIA
  const categories = [
    { id: "all", label: "Todos", icon: "🛍️", priority: "quaternary", color: "bg-gray-100 text-gray-700" },
    { id: "sleep", label: "Sono & Relaxamento", icon: "😴", priority: "quaternary", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "meals", label: "Refeições Práticas", icon: "🍽️", priority: "quaternary", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { id: "travel", label: "Mobilidade Familiar", icon: "🚗", priority: "quaternary", color: "bg-green-50 text-green-700 border-green-200" },
    { id: "learning", label: "Aprender & Brincar", icon: "🎨", priority: "quaternary", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "selfcare", label: "Cuidado dos Pais", icon: "💆‍♀️", priority: "quaternary", color: "bg-pink-50 text-pink-700 border-pink-200" },
    { id: "organization", label: "Organização", icon: "📦", priority: "quaternary", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
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

  const activeFiltersCount = [selectedMood, selectedAgeGroup, selectedContext].filter(Boolean).length + 
                           quickNeeds.length + (selectedRating > 0 ? 1 : 0) + 
                           (selectedPriceRange[1] < 1000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedMood("");
    setSelectedAgeGroup("");
    setSelectedContext("");
    setQuickNeeds([]);
    setSelectedRating(0);
    setSelectedPriceRange([0, 1000]);
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const toggleQuickNeed = (needId: string) => {
    setQuickNeeds(prev => 
      prev.includes(needId) 
        ? prev.filter(id => id !== needId)
        : [...prev, needId]
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
              🧪 Teste de Filtros Inteligentes
            </h1>
            <p className="font-poppins text-xl text-gray-600">
              Experimentando filtros baseados em emoções, contextos e necessidades reais de famílias
            </p>
          </motion.div>

          {/* Search and Filter Toggle */}
          <motion.div 
            className="mb-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Que produto você precisa?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>

            {/* Filter Toggle & Active Count */}
            <div className="flex justify-center gap-4 mb-6">
              <GradientButton
                variant={showFilters ? "primary" : "glass"}
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Inteligentes
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </GradientButton>

              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearAllFilters} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}

              {/* Favorites Toggle */}
              {isAuthenticated ? (
                <GradientButton
                  variant={showFavorites ? "primary" : "glass"}
                  onClick={() => {
                    setShowFavorites(!showFavorites);
                    setSelectedCategory("all");
                  }}
                  size="sm"
                >
                  <Heart className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                  {showFavorites ? "Ver Todos" : "Favoritos"}
                </GradientButton>
              ) : (
                <GradientButton
                  variant="glass"
                  onClick={() => window.location.href = '/login'}
                  size="sm"
                  className="opacity-75"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritos (Login)
                </GradientButton>
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
                className="glassmorphism p-6 rounded-3xl mb-8 space-y-8"
              >
                {/* FILTROS PRINCIPAIS - HIERARQUIA VISUAL PRIMÁRIA */}
                <div className="border-l-4 border-indigo-500 pl-6 bg-gradient-to-r from-indigo-50/50 to-transparent p-6 -mx-6 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                    <h2 className="font-fredoka text-2xl text-gray-800">🎭 Como você está se sentindo hoje?</h2>
                  </div>
                  <p className="text-gray-600 mb-6 font-poppins">Escolha o que mais combina com seu momento atual:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {moodFilters.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(selectedMood === mood.id ? "" : mood.id)}
                        className={`
                          group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                          ${selectedMood === mood.id 
                            ? `${mood.color} transform scale-105 shadow-2xl ring-4 ring-white/50` 
                            : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <span className="text-3xl mr-4 group-hover:scale-110 transition-transform">{mood.emoji}</span>
                          <div>
                            <div className={`font-outfit font-semibold text-lg ${
                              selectedMood === mood.id ? 'text-white' : 'text-gray-800'
                            }`}>
                              {mood.label}
                            </div>
                            {selectedMood === mood.id && (
                              <div className="text-white/90 text-sm mt-1 font-poppins">
                                ✓ Selecionado
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedMood === mood.id && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FILTROS SECUNDÁRIOS - HIERARQUIA VISUAL SECUNDÁRIA */}
                <div className="border-l-4 border-purple-400 pl-6 bg-gradient-to-r from-purple-50/30 to-transparent p-4 -mx-6">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <h3 className="font-outfit text-xl text-gray-700">📅 Em que momento você precisa de ajuda?</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {contexts.map((context) => (
                      <button
                        key={context.id}
                        onClick={() => setSelectedContext(selectedContext === context.id ? "" : context.id)}
                        className={`
                          flex items-center justify-start p-4 rounded-xl text-left transition-all duration-200
                          ${selectedContext === context.id 
                            ? 'bg-purple-500 text-white shadow-lg transform scale-105' 
                            : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                          }
                        `}
                      >
                        <span className="mr-3 text-xl">{context.icon}</span>
                        <span className="text-sm font-medium">{context.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* GRUPO IDADE - HIERARQUIA VISUAL SECUNDÁRIA */}
                <div className="border-l-4 border-blue-400 pl-6 bg-gradient-to-r from-blue-50/30 to-transparent p-4 -mx-6">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <h3 className="font-outfit text-xl text-gray-700">👨‍👩‍👧‍👦 Para qual faixa etária?</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ageGroups.map((age) => (
                      <button
                        key={age.id}
                        onClick={() => setSelectedAgeGroup(selectedAgeGroup === age.id ? "" : age.id)}
                        className={`
                          flex items-center justify-start p-3 rounded-xl text-sm transition-all duration-200
                          ${selectedAgeGroup === age.id 
                            ? 'bg-blue-500 text-white shadow-lg' 
                            : 'bg-white/60 text-gray-600 hover:bg-white hover:text-gray-800 border border-gray-200'
                          }
                        `}
                      >
                        <span className="mr-2 text-lg">{age.icon}</span>
                        <span className="font-medium">{age.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* FILTROS AVANÇADOS - HIERARQUIA VISUAL TERCIÁRIA */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-2xl border border-gray-200">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></div>
                          <h4 className="font-outfit text-lg text-gray-600">⚡ Filtros Avançados</h4>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                      </div>
                    </summary>
                    
                    <div className="mt-6 space-y-6">
                      {/* Quick Needs */}
                      <div>
                        <h5 className="font-poppins text-sm font-semibold text-gray-700 mb-3">Necessidades Especiais:</h5>
                        <div className="flex flex-wrap gap-2">
                          {quickNeedOptions.map((need) => (
                            <button
                              key={need.id}
                              onClick={() => toggleQuickNeed(need.id)}
                              className={`
                                inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                ${quickNeeds.includes(need.id) 
                                  ? 'bg-gray-700 text-white shadow-md' 
                                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <span className="mr-1.5 text-xs">{need.icon}</span>
                              {need.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                      {/* Price Range - dentro do painel avançado */}
                      <div>
                        <h5 className="font-poppins text-sm font-semibold text-gray-700 mb-3">Faixa de Preço:</h5>
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

                      {/* Rating Filter - dentro do painel avançado */}
                      <div>
                        <h5 className="font-poppins text-sm font-semibold text-gray-700 mb-3">Avaliação Mínima:</h5>
                        <div className="flex gap-2">
                          {[0, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setSelectedRating(rating)}
                              className={`
                                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filters - Lifestyle Based */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <GradientButton
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "glass"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  className={category.color}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </GradientButton>
              ))}
            </div>
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
              <div className="glassmorphism p-8 rounded-3xl max-w-md mx-auto">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Tente ajustar os filtros ou termo de busca
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Limpar todos os filtros
                </Button>
              </div>
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredProducts.length > 8 && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <GradientButton variant="glass" size="lg">
                Carregar Mais Produtos
                <ChevronDown className="ml-2 w-5 h-5" />
              </GradientButton>
            </motion.div>
          )}

          {/* Results Summary */}
          <motion.div 
            className="text-center mt-8 p-4 glassmorphism rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600">
              <strong>{filteredProducts.length}</strong> produtos encontrados
              {activeFiltersCount > 0 && (
                <span> com <strong>{activeFiltersCount}</strong> filtros ativos</span>
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Como Te Auxiliamos section */}
      <section className="py-16 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🧠 Filtros Inteligentes em Teste
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-8">
              Esta página está testando filtros que entendem suas necessidades emocionais e contextuais. 
              Em vez de apenas "categoria", perguntamos "como você está se sentindo?" e "em que momento precisa de ajuda?"
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">🎭</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Filtros Emocionais</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Escolha produtos baseados no seu humor e necessidade do momento
                </p>
              </div>
              
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">📅</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Contexto Real</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Filtre por momentos específicos: manhãs corridas, noites tranquilas...
                </p>
              </div>
              
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">👨‍👩‍👧‍👦</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Fases da Família</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Produtos organizados por idade dos filhos e necessidades dos pais
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}