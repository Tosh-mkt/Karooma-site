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

  // Filtros emocionais/contextuais - baseados na nossa conversa
  const moodFilters = [
    { id: "urgent", label: "🚨 Socorro, preciso urgente!", emoji: "😰", color: "bg-red-100 text-red-700" },
    { id: "simplify", label: "😌 Quero facilitar minha vida", emoji: "😌", color: "bg-green-100 text-green-700" },
    { id: "gift", label: "🎁 Presentear sem erro", emoji: "🎁", color: "bg-purple-100 text-purple-700" },
    { id: "discover", label: "💡 Descobrir algo novo", emoji: "💡", color: "bg-yellow-100 text-yellow-700" },
  ];

  // Grupos por idade - mais intuitivos
  const ageGroups = [
    { id: "newborn", label: "Recém-nascidos (0-6m)", icon: "👶" },
    { id: "baby", label: "Bebês (6m-2 anos)", icon: "🍼" },
    { id: "toddler", label: "Crianças pequenas (2-5 anos)", icon: "🧸" },
    { id: "school", label: "Idade escolar (6-12 anos)", icon: "🎒" },
    { id: "teen", label: "Adolescentes (13+ anos)", icon: "📱" },
    { id: "parents", label: "Para os pais", icon: "☕" },
  ];

  // Contextos de uso - baseados em momentos do dia
  const contexts = [
    { id: "morning", label: "⏰ Manhãs corridas", icon: "🌅" },
    { id: "mealtime", label: "🍽️ Hora das refeições", icon: "🍽️" },
    { id: "sleep", label: "🌙 Noites tranquilas", icon: "🌙" },
    { id: "travel", label: "🚗 Na correria com filhos", icon: "🚗" },
    { id: "organization", label: "📦 Organização da casa", icon: "🏠" },
    { id: "selfcare", label: "💆‍♀️ Cuidado próprio", icon: "💆‍♀️" },
  ];

  // Necessidades rápidas
  const quickNeedOptions = [
    { id: "prime", label: "📦 Entrega rápida" },
    { id: "budget", label: "💰 Cabe no bolso" },
    { id: "tested", label: "✅ Testado por mães" },
    { id: "bestseller", label: "🔥 Mais vendido" },
    { id: "innovative", label: "⚡ Inovador" },
  ];

  // Categorias melhoradas - estilo de vida
  const categories = [
    { id: "all", label: "Todos", icon: "🛍️" },
    { id: "sleep", label: "Sono & Relaxamento", icon: "😴", color: "bg-blue-100" },
    { id: "meals", label: "Refeições Práticas", icon: "🍽️", color: "bg-orange-100" },
    { id: "travel", label: "Mobilidade Familiar", icon: "🚗", color: "bg-green-100" },
    { id: "learning", label: "Aprender & Brincar", icon: "🎨", color: "bg-purple-100" },
    { id: "selfcare", label: "Cuidado dos Pais", icon: "💆‍♀️", color: "bg-pink-100" },
    { id: "organization", label: "Organização", icon: "📦", color: "bg-yellow-100" },
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
                {/* Mood/Emotional Filters */}
                <div>
                  <h3 className="font-outfit text-lg gradient-text mb-4">🎭 Como você está se sentindo hoje?</h3>
                  <div className="flex flex-wrap gap-3">
                    {moodFilters.map((mood) => (
                      <Button
                        key={mood.id}
                        variant={selectedMood === mood.id ? "default" : "outline"}
                        onClick={() => setSelectedMood(selectedMood === mood.id ? "" : mood.id)}
                        className={`${mood.color} ${selectedMood === mood.id ? 'ring-2 ring-purple-500' : ''}`}
                      >
                        <span className="mr-2">{mood.emoji}</span>
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Context Filters */}
                <div>
                  <h3 className="font-outfit text-lg gradient-text mb-4">📅 Em que momento você precisa de ajuda?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {contexts.map((context) => (
                      <Button
                        key={context.id}
                        variant={selectedContext === context.id ? "default" : "outline"}
                        onClick={() => setSelectedContext(selectedContext === context.id ? "" : context.id)}
                        className="flex items-center justify-start p-4 h-auto"
                      >
                        <span className="mr-3 text-2xl">{context.icon}</span>
                        <span className="text-sm">{context.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Age Group */}
                <div>
                  <h3 className="font-outfit text-lg gradient-text mb-4">👨‍👩‍👧‍👦 Para qual idade?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ageGroups.map((age) => (
                      <Button
                        key={age.id}
                        variant={selectedAgeGroup === age.id ? "default" : "outline"}
                        onClick={() => setSelectedAgeGroup(selectedAgeGroup === age.id ? "" : age.id)}
                        className="flex items-center justify-start p-3 h-auto text-sm"
                      >
                        <span className="mr-2 text-lg">{age.icon}</span>
                        {age.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quick Needs */}
                <div>
                  <h3 className="font-outfit text-lg gradient-text mb-4">⚡ Necessidades especiais?</h3>
                  <div className="flex flex-wrap gap-3">
                    {quickNeedOptions.map((need) => (
                      <Button
                        key={need.id}
                        variant={quickNeeds.includes(need.id) ? "default" : "outline"}
                        onClick={() => toggleQuickNeed(need.id)}
                        size="sm"
                      >
                        {need.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-outfit text-lg gradient-text mb-4">💰 Faixa de preço</h3>
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
                      <span>R$ {selectedPriceRange[0]}</span>
                      <span>R$ {selectedPriceRange[1]}{selectedPriceRange[1] >= 1000 ? "+" : ""}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-outfit text-lg gradient-text mb-4">⭐ Avaliação mínima</h3>
                  <div className="flex gap-2">
                    {[0, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={selectedRating === rating ? "default" : "outline"}
                        onClick={() => setSelectedRating(rating)}
                        size="sm"
                      >
                        {rating === 0 ? "Todas" : `${rating}+ ⭐`}
                      </Button>
                    ))}
                  </div>
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