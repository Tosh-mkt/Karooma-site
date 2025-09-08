import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, ChevronDown, Heart, Filter, X, ChevronRight, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProductCard } from "@/components/content/product-card";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Dados dos filtros hierárquicos baseados no mapa fornecido
const filterHierarchy = {
  "comer-preparar": {
    title: "Comer e Preparar",
    icon: "🍽️",
    color: "text-purple-600",
    subcategories: {
      "crianca": {
        title: "Criança",
        environments: []
      },
      "bebe": {
        title: "Bebê", 
        environments: []
      },
      "familia": {
        title: "Família",
        environments: []
      }
    }
  },
  "apresentar": {
    title: "Presentear",
    icon: "🎁", 
    color: "text-blue-600",
    subcategories: {
      "presente-para-ocasioes": {
        title: "Presente para Ocasiões",
        environments: []
      },
      "presente-por-idade": {
        title: "Presente por Idade",
        subcategories: {
          "bebe": {
            title: "Bebê",
            environments: []
          },
          "crianca": {
            title: "Criança", 
            environments: []
          },
          "familia": {
            title: "Família",
            environments: []
          }
        }
      }
    }
  },
  "saude-seguranca": {
    title: "Saúde e Segurança",
    icon: "🛡️",
    color: "text-red-600", 
    subcategories: {
      "primeiros-socorros": {
        title: "Primeiros Socorros",
        environments: ["Casa", "Cozinha", "Área de Serviço", "Quarto do Bebê", "Quarto da Criança"]
      }
    }
  },
  "decorar-brilhar": {
    title: "Decorar e Brilhar", 
    icon: "✨",
    color: "text-pink-600",
    subcategories: {},
    environments: ["Carro", "Casa", "Cozinha", "Área de Serviço", "Quarto do Bebê", "Quarto da Criança"]
  },
  "sono-relaxamento": {
    title: "Sono e Relaxamento",
    icon: "😴",
    color: "text-indigo-600",
    subcategories: {
      "bebe": {
        title: "Bebê",
        environments: []
      },
      "crianca": {
        title: "Criança",
        environments: []
      },
      "pais-cuidadores": {
        title: "Pais e Cuidadores", 
        environments: []
      }
    }
  },
  "aprender-brincar": {
    title: "Aprender e Brincar",
    icon: "🎨",
    color: "text-green-600",
    subcategories: {
      "bebe": {
        title: "Bebê",
        environments: []
      },
      "crianca": {
        title: "Criança", 
        environments: []
      },
      "familia": {
        title: "Família",
        environments: []
      }
    }
  },
  "sair-viajar": {
    title: "Sair e Viajar",
    icon: "✈️",
    color: "text-yellow-600",
    subcategories: {
      "bebe": {
        title: "Bebê",
        environments: []
      },
      "crianca": {
        title: "Criança",
        environments: []
      },
      "familia": {
        title: "Família", 
        environments: []
      },
      "primeiros-socorros": {
        title: "Primeiros Socorros",
        environments: []
      },
      "carro": {
        title: "Carro",
        environments: []
      }
    },
    environments: []
  },
  "organizacao": {
    title: "Organização",
    icon: "📦",
    color: "text-teal-600",
    subcategories: {
      "casa": {
        title: "Casa",
        environments: []
      },
      "cozinha": {
        title: "Cozinha",
        environments: []
      },
      "area-de-servico": {
        title: "Área de Serviço",
        environments: []
      },
      "quarto-do-bebe": {
        title: "Quarto do Bebê",
        environments: []
      },
      "quarto-da-crianca": {
        title: "Quarto da Criança",
        environments: []
      },
      "carro": {
        title: "Carro",
        environments: []
      }
    },
    environments: []
  }
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [priceRange, setPriceRange] = useState([1000]);
  const { isAuthenticated } = useAuth();

  // Invalidate cache on component mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  }, []);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0, // Always refetch
  });

  // Fetch user favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery<Product[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated && showFavorites,
  });

  // Toggle expansão das categorias
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Toggle expansão das subcategorias
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Selecionar filtro
  const toggleFilter = (categoryId: string, subcategoryId: string | null, environmentId: string | null) => {
    const filterId = `${categoryId}${subcategoryId ? `-${subcategoryId}` : ''}${environmentId ? `-${environmentId}` : ''}`;
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };


  // Use favorites or all products based on toggle
  const sourceProducts = showFavorites ? favorites : products;
  
  // Produtos filtrados com novo sistema de filtros
  const filteredProducts = useMemo(() => {
    return sourceProducts?.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.currentPrice ? 
        parseFloat(product.currentPrice.toString()) <= priceRange[0] : true;
      
      return matchesCategory && matchesSearch && matchesPrice;
    }) || [];
  }, [sourceProducts, selectedCategory, searchQuery, priceRange, selectedFilters]);

  // Contar filtros ativos
  const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

  // Reset todos os filtros
  const resetFilters = () => {
    setSelectedFilters({});
    setSearchQuery("");
    setPriceRange([0, 1000]);
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
                  Preço: até R$ {priceRange[0]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  step={10}
                  className="mt-2"
                  data-testid="slider-price-range"
                />
              </div>
            </div>
          </div>

          {/* Menu Hierárquico */}
          <div className="p-2">
            <div className="space-y-1">
              {Object.entries(filterHierarchy).map(([categoryId, category]) => (
                <div key={categoryId}>
                  {/* Categoria Principal */}
                  <div
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                    onClick={() => toggleCategory(categoryId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {Object.keys(category.subcategories).length > 0 ? (
                          expandedCategories[categoryId] ? 
                            <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <span className={`font-medium text-sm ${category.color}`}>
                        {category.title}
                      </span>
                    </div>
                    
                    {/* Checkbox para categoria */}
                    <input
                      type="checkbox"
                      checked={selectedFilters[categoryId] || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFilter(categoryId, null, null);
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                  </div>

                  {/* Subcategorias */}
                  {expandedCategories[categoryId] && Object.entries(category.subcategories).map(([subcategoryId, subcategory]) => (
                    <div key={subcategoryId} className="ml-4">
                      <div
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleSubcategory(`${categoryId}-${subcategoryId}`)}
                      >
                        <div className="flex items-center gap-2">
                          {(subcategory as any).subcategories ? (
                            expandedSubcategories[`${categoryId}-${subcategoryId}`] ? 
                              <ChevronDown className="w-3 h-3 text-gray-400" /> : 
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                          ) : (
                            <div className="w-3 h-3" />
                          )}
                          <span className="text-sm text-gray-700">{subcategory.title}</span>
                        </div>
                        
                        <input
                          type="checkbox"
                          checked={selectedFilters[`${categoryId}-${subcategoryId}`] || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleFilter(categoryId, subcategoryId, null);
                          }}
                          className="w-3 h-3 text-purple-600 rounded"
                        />
                      </div>

                      {/* Sub-subcategorias (ex: Presente por Idade -> Bebê, Criança, Família) */}
                      {expandedSubcategories[`${categoryId}-${subcategoryId}`] && (subcategory as any).subcategories && Object.entries((subcategory as any).subcategories).map(([subSubId, subSub]: [string, any]) => (
                        <div key={subSubId} className="ml-4">
                          <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3" />
                              <span className="text-xs text-gray-600">{subSub.title}</span>
                            </div>
                            
                            <input
                              type="checkbox"
                              checked={selectedFilters[`${categoryId}-${subcategoryId}-${subSubId}`] || false}
                              onChange={() => toggleFilter(categoryId, subcategoryId, subSubId)}
                              className="w-3 h-3 text-purple-600 rounded"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Ambientes da subcategoria */}
                      {expandedSubcategories[`${categoryId}-${subcategoryId}`] && subcategory.environments && subcategory.environments.map((env: string) => (
                        <div key={env} className="ml-6">
                          <div className="flex items-center justify-between p-1 rounded hover:bg-gray-50">
                            <span className="text-xs text-gray-500">{env}</span>
                            <input
                              type="checkbox"
                              checked={selectedFilters[`${categoryId}-${subcategoryId}-${env}`] || false}
                              onChange={() => toggleFilter(categoryId, subcategoryId, env)}
                              className="w-3 h-3 text-purple-600 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Ambientes diretos da categoria */}
                  {expandedCategories[categoryId] && 'environments' in category && category.environments && category.environments.map((env: string) => (
                    <div key={env} className="ml-6">
                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <span className="text-sm text-gray-600">{env}</span>
                        <input
                          type="checkbox"
                          checked={selectedFilters[`${categoryId}-${env}`] || false}
                          onChange={() => toggleFilter(categoryId, null, env)}
                          className="w-3 h-3 text-purple-600 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
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
              <p className="font-poppins text-xl text-gray-600 font-normal">Simplicidade e Foco.
              Acreditamos que menos é mais. Por isso, nosso catálogo contém apenas o essencial. Evitamos a sobrecarga de opções para que você possa focar no que realmente importa: resolver problemas e viver melhor com sua família, sem perder tempo com escolhas desnecessárias.

              Buscamos sempre o melhor custo-benefício, validando cada recomendação com argumentos teóricos e práticos que comprovam sua eficácia. Leia nossas avaliações de cada produto e entenda nossos pontos de vista sobre cada recomendação.

              Estamos constantemente expandindo nosso catálogo de recomendações, trazendo novas soluções para facilitar a sua rotina</p>
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
              <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-6">
                Cada produto que recomendamos passou pelo nosso teste rigoroso: funciona mesmo no dia a dia corrido de uma família? Selecionamos apenas itens que realmente simplificam, organizam ou facilitam algum aspecto da vida familiar. Não funciona ou é mal avaliado, não se encontra aqui.
              </p>
              
              <p className="font-inter text-sm text-gray-500 text-center italic">
                Como associado da Amazon, eu ganho com compras qualificadas.
              </p>
              
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}