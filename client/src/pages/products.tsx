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
              <h1 className="font-fredoka text-5xl gradient-text mb-4">Facilitam a Vida</h1>
              <p className="font-poppins text-xl text-gray-600 font-normal mt-[2px] mb-[2px]">
                Descubra produtos que resolvem problemas práticos, expressam seus sentimentos e inspiram transformação.
              </p>
            </motion.div>

            <motion.div 
              className="mb-8 space-y-6"
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

              {activeTab === "resolvem" && (
                <>
                  <div className="flex justify-center mb-6">
                    {isAuthenticated ? (
                      <GradientButton
                        variant="primary"
                        onClick={() => window.location.href = '/favoritos'}
                        size="sm"
                      >
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Meus Favoritos
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
                        
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-white/70 backdrop-blur-sm p-1 rounded-full">
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
                <TabsTrigger 
                  value="inspiram" 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  data-testid="tab-inspiram"
                >
                  Inspiram
                </TabsTrigger>
              </TabsList>

              <TabsContent value="resolvem" className="mt-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Produtos que Resolvem</h2>
                  <p className="text-gray-600">Soluções práticas testadas para o dia a dia da família</p>
                </div>

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
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Produtos que Expressam</h2>
                  <p className="text-gray-600">Roupas Montink que comunicam seus sentimentos e jornadas</p>
                </div>

                {apparelLoading ? (
                  <div className="flex flex-wrap justify-center gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse" style={{ width: '180px', height: '380px' }}>
                        <div className="bg-gray-200 rounded-2xl h-full w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredApparel.length > 0 ? (
                  <motion.div 
                    className="flex flex-wrap justify-center gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {filteredApparel.map((apparel, index) => (
                      <motion.div key={apparel.id} variants={staggerItem}>
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

              <TabsContent value="inspiram" className="mt-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Produtos que Inspiram</h2>
                  <p className="text-gray-600">E-books e apps para transformar sua vida</p>
                </div>

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
                    Estamos preparando conteúdos digitais incríveis para você
                  </p>
                </motion.div>
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
