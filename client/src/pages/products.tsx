import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, ChevronDown, Heart, Filter, X, ChevronRight, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProductCard } from "@/components/content/product-card";
import { TaxonomyFilters } from "@/components/filters/TaxonomyFilters";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Filtros de taxonomia agora vêm do banco de dados via TaxonomyFilters component

// Filtros de idade
const ageFilters = [
  { value: "0-1", label: "0-1 ano" },
  { value: "1-3", label: "1-3 anos" },
  { value: "3-6", label: "3-6 anos" },
  { value: "6-10", label: "6-10 anos" },
  { value: "11-15", label: "11-15 anos" },
  { value: "15-20", label: "15-20 anos" },
  { value: "20+", label: "Acima de 20 anos" }
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<string[]>([]);
  const [selectedAgeFilters, setSelectedAgeFilters] = useState<Record<string, boolean>>({});
  const { isAuthenticated } = useAuth();

  // Invalidate cache on component mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  }, []);

  // Buscar todos os produtos (sem filtro de taxonomia na query)
  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0, // Always refetch
  });

  // Aplicar filtros de taxonomia no frontend
  const products = useMemo(() => {
    if (!allProducts) return [];
    if (selectedTaxonomies.length === 0) return allProducts;
    
    return allProducts.filter(product => {
      // Verifica se o produto corresponde a alguma das taxonomias selecionadas
      return selectedTaxonomies.some(taxonomy => {
        // Verifica category direta
        if (product.category === taxonomy) return true;
        
        // Verifica categoryTags se existir
        if (product.categoryTags && product.categoryTags.includes(taxonomy)) return true;
        
        // Verifica searchTags se existir
        if (product.searchTags && product.searchTags.includes(taxonomy)) return true;
        
        return false;
      });
    });
  }, [allProducts, selectedTaxonomies]);

  // Calculate dynamic price range based on actual products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 1000;
    const prices = products
      .map(p => p.currentPrice ? parseFloat(p.currentPrice.toString()) : 0)
      .filter(price => price > 0);
    return prices.length > 0 ? Math.max(...prices) : 1000;
  }, [products]);

  const [priceRange, setPriceRange] = useState<number[]>([]);

  // Initialize price range when products load
  useEffect(() => {
    if (maxPrice && priceRange.length === 0) {
      setPriceRange([maxPrice]);
    }
  }, [maxPrice, priceRange.length]);

  // Fetch user favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery<Product[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated && showFavorites,
  });


  // Função para lidar com mudanças nos filtros de taxonomia
  const handleTaxonomyChange = (taxonomies: string[]) => {
    setSelectedTaxonomies(taxonomies);
  };

  // Selecionar filtro de idade
  const toggleAgeFilter = (ageRange: string) => {
    setSelectedAgeFilters(prev => ({
      ...prev,
      [ageRange]: !prev[ageRange]
    }));
  };


  // Use favorites or all products based on toggle
  const sourceProducts = showFavorites ? favorites : products;
  
  // Produtos filtrados (taxonomias já aplicadas na query, filtrar apenas busca, preço e idade)
  const filteredProducts = useMemo(() => {
    return sourceProducts?.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.currentPrice && priceRange.length > 0 ? 
        parseFloat(product.currentPrice.toString()) <= priceRange[0] : true;
      
      // Verificar filtros de idade (placeholder - seria necessário ter campo de idade nos produtos)
      // Por enquanto, sempre aceita todos os produtos pois não há campo de idade implementado
      const matchesAgeFilters = true; // TODO: Implementar campo de idade nos produtos
      
      return matchesCategory && matchesSearch && matchesPrice && matchesAgeFilters;
    }) || [];
  }, [sourceProducts, selectedCategory, searchQuery, priceRange, selectedAgeFilters]);

  // Contar filtros ativos
  const activeFiltersCount = selectedTaxonomies.length + Object.values(selectedAgeFilters).filter(Boolean).length;

  // Reset todos os filtros
  const resetFilters = () => {
    setSelectedTaxonomies([]);
    setSelectedAgeFilters({});
    setSearchQuery("");
    setPriceRange([maxPrice]); // Reset to maximum price, not zero
  };

  const currentLoading = showFavorites ? favoritesLoading : isLoading;

  return (
    <div className="pt-20 flex">
      {/* Sidebar de Filtros */}
      <div className={`bg-white shadow-2xl border-r border-purple-100 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden flex-shrink-0 fixed left-0 top-20 h-[calc(100vh-80px)] z-40`}>
        <div className="h-full overflow-y-auto">
          {/* Header do Sidebar */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">PESQUISA</h2>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <Badge className="bg-white/20 text-white">
                  {activeFiltersCount} filtros ativos
                </Badge>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-white/80 hover:text-white underline"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>

          {/* Filtros Básicos */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-4">
              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço: até R$ {priceRange.length > 0 ? priceRange[0]?.toFixed(2) : maxPrice?.toFixed(2)}
                </label>
                <Slider
                  value={priceRange.length > 0 ? priceRange : [maxPrice]}
                  onValueChange={setPriceRange}
                  max={maxPrice}
                  step={1}
                  className="mt-2"
                  data-testid="slider-price-range"
                />
              </div>

              {/* Filtro por Idade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Por Idade
                </label>
                <div className="space-y-2">
                  {ageFilters.map((ageFilter) => (
                    <div key={ageFilter.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`age-${ageFilter.value}`}
                        checked={selectedAgeFilters[ageFilter.value] || false}
                        onChange={() => toggleAgeFilter(ageFilter.value)}
                        className="w-4 h-4 text-purple-600 rounded mr-3"
                      />
                      <label 
                        htmlFor={`age-${ageFilter.value}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {ageFilter.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de Taxonomia Hierárquicos */}
          <div className="p-4">
            <TaxonomyFilters
              selected={selectedTaxonomies}
              onChange={handleTaxonomyChange}
              defaultExpanded={['saude-e-seguranca', 'comer-e-preparar']}
              data-testid="taxonomy-filters-products"
            />
          </div>
        </div>
      </div>
      {/* Conteúdo Principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">

            {/* Header */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-fredoka text-5xl gradient-text mb-4">Facilitam a Vida</h1>
              <p className="font-poppins text-xl text-gray-600 font-normal mt-[2px] mb-[2px]">Nós acreditamos que menos é mais. 
              Nosso catálogo contém apenas o essencial para que você se concentre em resolver seus problemas e viver melhor, sem perder tempo com escolhas desnecessárias. 
              Buscamos sempre o melhor custo-benefício, validando cada recomendação com argumentos teóricos e práticos que comprovam a sua eficácia. 
              Você pode ler nossas avaliações para entender nossos pontos de vista. Estamos sempre expandindo nosso catálogo com novas soluções para facilitar a sua rotina.</p>
            </motion.div>

            {/* Search and Filters */}
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

              {/* Favorites Toggle */}
              <div className="flex justify-center mb-6">
                {isAuthenticated ? (
                  <GradientButton
                    variant={showFavorites ? "primary" : "glass"}
                    onClick={() => {
                      setShowFavorites(!showFavorites);
                      setSelectedCategory("all"); // Reset category filter when switching
                    }}
                    size="sm"
                    className="mx-2"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                    {showFavorites ? "Ver Todos os Produtos" : "Meus Favoritos"}
                  </GradientButton>
                ) : (
                  <GradientButton
                    variant="glass"
                    onClick={() => window.location.href = '/login'}
                    size="sm"
                    className="mx-2 opacity-75"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Meus Favoritos (Login Necessário)
                  </GradientButton>
                )}
              </div>

              {/* Botão de Filtros de Pesquisa */}
              {!sidebarOpen && (
                <motion.div 
                  className="flex justify-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <GradientButton
                      variant="primary"
                      size="lg"
                      onClick={() => setSidebarOpen(true)}
                      className="flex items-center gap-3 px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Filter className="w-5 h-5" />
                      <span className="font-semibold">Filtros de Pesquisa</span>
                      {activeFiltersCount > 0 && (
                        <Badge className="bg-white text-purple-600 font-bold text-sm px-2 py-1 ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </GradientButton>
                    
                    {/* Indicador visual de importância */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>
              )}

            </motion.div>

            {/* Products Grid - Adjusted for new card dimensions */}
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
                {showFavorites ? (
                  <>
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                      Nenhum favorito ainda
                    </h3>
                    <p className="text-gray-500">
                      Clique no coração dos produtos que você gosta para salvá-los aqui!
                    </p>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou termo de busca
                    </p>
                  </>
                )}
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
              Como Te Auxiliamos
            </motion.h2>
            
            <motion.div 
              className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-6">Cada produto que recomendamos passou pelo nosso teste rigoroso: funciona mesmo no dia a dia corrido de uma família? Selecionamos apenas itens que realmente simplificam, organizam ou facilitam algum aspecto da vida familiar. Não funciona ou é mal avaliado? Você não vai encontrar aqui.</p>
              
              <p className="font-inter text-sm text-gray-500 text-center italic">Como associado da Amazon, a Karooma ganha com compras qualificadas que auxiliam na manutenção da estrutura para continuidade e melhoria dos serviços.</p>
              
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}