import React, { useState, useMemo } from "react";
import { Search, Filter, X, ChevronRight, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

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
    title: "Apresentar",
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
      "primeiros-socorros": {
        title: "Primeiros Socorros",
        environments: []
      },
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
    },
    environments: ["Carro", "Casa", "Cozinha", "Área de Serviço", "Quarto do Bebê", "Quarto da Criança"]
  },
  "organizacao": {
    title: "Organização",
    icon: "📦",
    color: "text-teal-600",
    subcategories: {},
    environments: ["Cozinha", "Área de Serviço", "Quarto do Bebê", "Quarto da Criança", "Carro"]
  }
};

export default function TestFiltersSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Buscar produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
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

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.currentPrice ? 
        parseFloat(product.currentPrice.toString()) >= priceRange[0] && 
        parseFloat(product.currentPrice.toString()) <= priceRange[1] : true;
      
      return matchesSearch && matchesPrice;
    });
  }, [products, searchQuery, priceRange, selectedFilters]);

  // Contar filtros ativos
  const activeFiltersCount = Object.values(selectedFilters).filter(Boolean).length;

  // Reset todos os filtros
  const resetFilters = () => {
    setSelectedFilters({});
    setSearchQuery("");
    setPriceRange([0, 1000]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex">
      {/* Sidebar de Filtros */}
      <div className={`bg-white shadow-2xl border-r border-purple-100 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden flex-shrink-0`}>
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
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar produtos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Digite o nome do produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-products"
                  />
                </div>
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
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
                  {expandedCategories[categoryId] && category.environments && category.environments.map((env: string) => (
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Menu className="w-4 h-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Menu de Filtros Lateral
                  </h1>
                  <p className="text-gray-600 text-sm">Baseado no mapa hierárquico oficial</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Produtos Encontrados ({filteredProducts.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Carregando produtos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-600">Tente ajustar seus filtros para ver mais resultados</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <div className="text-4xl">{product.title.charAt(0)}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-purple-600">
                          R$ {product.currentPrice ? parseFloat(product.currentPrice.toString()).toFixed(2) : '0.00'}
                        </div>
                        <div className="flex items-center text-yellow-500">
                          {product.rating ? '⭐'.repeat(Math.round(parseFloat(product.rating.toString()))) : '⭐'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}