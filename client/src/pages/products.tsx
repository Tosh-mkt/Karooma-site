import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Heart, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProductCard } from "@/components/content/product-card";
import { ApparelCard } from "@/components/missoes/ApparelCard";
import { TaxonomyFilters } from "@/components/filters/TaxonomyFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Product, FeaturedApparel } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import resolvemImage from "@assets/stock_images/organized_home_essen_94fa9c13.jpg";
import expressamImage from "@assets/stock_images/stylish_comfortable__4ebd40a0.jpg";

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
  const [activeTab, setActiveTab] = useState("resolvem");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<string[]>([]);
  const [selectedAgeFilters, setSelectedAgeFilters] = useState<Record<string, boolean>>({});
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  }, []);

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0,
  });

  const { data: allApparel, isLoading: apparelLoading } = useQuery<FeaturedApparel[]>({
    queryKey: ["/api/apparel"],
    staleTime: 0,
  });

  const products = useMemo(() => {
    if (!allProducts) return [];
    if (selectedTaxonomies.length === 0) return allProducts;
    
    return allProducts.filter(product => {
      return selectedTaxonomies.some(taxonomy => {
        if (product.category === taxonomy) return true;
        if (product.categoryTags && product.categoryTags.includes(taxonomy)) return true;
        if (product.searchTags && product.searchTags.includes(taxonomy)) return true;
        return false;
      });
    });
  }, [allProducts, selectedTaxonomies]);

  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 1000;
    const prices = products
      .map(p => p.currentPrice ? parseFloat(p.currentPrice.toString()) : 0)
      .filter(price => price > 0);
    return prices.length > 0 ? Math.max(...prices) : 1000;
  }, [products]);

  const [priceRange, setPriceRange] = useState<number[]>([]);

  useEffect(() => {
    if (maxPrice && priceRange.length === 0) {
      setPriceRange([maxPrice]);
    }
  }, [maxPrice, priceRange.length]);

  const { data: favorites, isLoading: favoritesLoading, error: favoritesError } = useQuery<Product[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated && showFavorites,
    retry: false,
  });

  useEffect(() => {
    if (showFavorites && (!isAuthenticated || favoritesError)) {
      setShowFavorites(false);
    }
  }, [showFavorites, isAuthenticated, favoritesError]);

  const handleTaxonomyChange = (taxonomies: string[]) => {
    setSelectedTaxonomies(taxonomies);
  };

  const toggleAgeFilter = (ageRange: string) => {
    setSelectedAgeFilters(prev => ({
      ...prev,
      [ageRange]: !prev[ageRange]
    }));
  };

  const sourceProducts = (showFavorites && isAuthenticated && favorites) ? favorites : products;
  
  const filteredProducts = useMemo(() => {
    return sourceProducts?.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.currentPrice && priceRange.length > 0 ? 
        parseFloat(product.currentPrice.toString()) <= priceRange[0] : true;
      const matchesAgeFilters = true;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesAgeFilters;
    }) || [];
  }, [sourceProducts, selectedCategory, searchQuery, priceRange, selectedAgeFilters]);

  const filteredApparel = useMemo(() => {
    return allApparel?.filter(apparel => {
      const matchesSearch = !searchQuery || 
        apparel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apparel.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    }) || [];
  }, [allApparel, searchQuery]);

  const activeFiltersCount = selectedTaxonomies.length + Object.values(selectedAgeFilters).filter(Boolean).length;

  const resetFilters = () => {
    setSelectedTaxonomies([]);
    setSelectedAgeFilters({});
    setSearchQuery("");
    setPriceRange([maxPrice]);
  };

  const currentLoading = showFavorites ? favoritesLoading : 
    (activeTab === "resolvem" ? productsLoading : apparelLoading);

  return (
    <div className="pt-20 flex">
      {/* Sidebar de Filtros */}
      <div className={`bg-white shadow-2xl border-r border-purple-100 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden flex-shrink-0 fixed left-0 top-20 h-[calc(100vh-80px)] z-40`}>
        <div className="h-full overflow-y-auto">
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

          {activeTab === "resolvem" && (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="space-y-4">
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

              <div className="p-4">
                <TaxonomyFilters
                  selected={selectedTaxonomies}
                  onChange={handleTaxonomyChange}
                  defaultExpanded={['saude-e-seguranca', 'comer-e-preparar']}
                  data-testid="taxonomy-filters-products"
                />
              </div>
            </>
          )}
        </div>
      </div>
      {/* Conteúdo Principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">

            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-fredoka text-5xl gradient-text mb-4">Produtos que entendem você</h1>
              <p className="font-poppins text-xl text-gray-600 font-normal mt-[2px] mb-[2px]">
                Descubra produtos que resolvem problemas práticos, expressam seus sentimentos e inspiram transformação.
              </p>
            </motion.div>

            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'resolvem' ? 'ring-4 ring-purple-500 ring-offset-2' : ''
                }`}
                onClick={() => setActiveTab('resolvem')}
                data-testid="category-card-resolvem"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="relative h-40">
                    <img 
                      src={resolvemImage} 
                      alt="Produtos que resolvem" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">Resolvem</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm">Produtos selecionados para ajudar no seu dia a dia</p>
                  </div>
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'expressam' ? 'ring-4 ring-purple-500 ring-offset-2' : ''
                }`}
                onClick={() => setActiveTab('expressam')}
                data-testid="category-card-expressam"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="relative h-40">
                    <img 
                      src={expressamImage} 
                      alt="Produtos que expressam" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">Expressam</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm">Roupas que comunicam sentimentos e jornadas</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-8 bg-white/70 backdrop-blur-sm p-1 rounded-full">
                <TabsTrigger 
                  value="resolvem" 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  data-testid="tab-resolvem"
                >
                  Resolvem
                </TabsTrigger>
                <TabsTrigger 
                  value="expressam" 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  data-testid="tab-expressam"
                >
                  Expressam
                </TabsTrigger>
              </TabsList>

              <TabsContent value="resolvem" className="mt-6">
                <div className="sticky top-20 z-30 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-6 mb-6">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    {isAuthenticated ? (
                      <GradientButton
                        variant="primary"
                        onClick={() => window.location.href = '/favoritos'}
                        size="sm"
                        data-testid="button-favorites"
                      >
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Meus Favoritos
                      </GradientButton>
                    ) : (
                      <GradientButton
                        variant="glass"
                        onClick={() => window.location.href = '/login'}
                        size="sm"
                        className="opacity-75"
                        data-testid="button-favorites-login"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Meus Favoritos (Login Necessário)
                      </GradientButton>
                    )}

                    {!sidebarOpen && (
                      <div className="relative">
                        <GradientButton
                          variant="primary"
                          size="sm"
                          onClick={() => setSidebarOpen(true)}
                          className="flex items-center gap-2"
                          data-testid="button-filters"
                        >
                          <Filter className="w-4 h-4" />
                          <span className="font-semibold">Filtros de Pesquisa</span>
                          {activeFiltersCount > 0 && (
                            <Badge className="bg-white text-purple-600 font-bold text-xs px-1.5 py-0.5 ml-1">
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </GradientButton>
                        {activeFiltersCount === 0 && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {currentLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse w-full">
                        <div className="bg-gray-200 rounded-3xl h-[450px] w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {filteredProducts.map((product, index) => (
                      <motion.div key={product.id} variants={staggerItem} className="w-full flex justify-center">
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
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500">
                      Tente ajustar os filtros ou termo de busca
                    </p>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="expressam" className="mt-6">
                <div className="sticky top-20 z-30 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-6 mb-6">
                  <div className="flex justify-center">
                    <div className="bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-md">
                      <p className="text-sm text-gray-700 font-medium">
                        Produtos curados com carinho pela equipe Karooma
                      </p>
                    </div>
                  </div>
                </div>

                {apparelLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse w-full">
                        <div className="bg-gray-200 rounded-2xl h-[380px] w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredApparel.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {filteredApparel.map((apparel, index) => (
                      <motion.div key={apparel.id} variants={staggerItem} className="w-full flex justify-center">
                        <ApparelCard apparel={apparel} index={index} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                      Em breve
                    </h3>
                    <p className="text-gray-500">
                      Estamos curando os melhores produtos para você expressar sua jornada
                    </p>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

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
              <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-6">
                Cada produto que recomendamos passou pelo nosso teste rigoroso: funciona mesmo no dia a dia corrido de uma família? 
                Selecionamos apenas itens que realmente simplificam, organizam ou facilitam algum aspecto da vida familiar. 
                Não funciona ou é mal avaliado? Você não vai encontrar aqui.
              </p>
              
              <p className="font-inter text-sm text-gray-500 text-center italic">
                Como associado da Amazon, a Karooma ganha com compras qualificadas que auxiliam na manutenção da estrutura para continuidade e melhoria dos serviços.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
