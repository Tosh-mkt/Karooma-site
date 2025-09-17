import React, { useState, useMemo } from "react";
import { Search, Filter, X, ChevronRight, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import type { Product, Taxonomy } from "@shared/schema";

// Mapeamento de ícones e cores para categorias principais
const categoryStyles: Record<string, { icon: string; color: string }> = {
  "comer-e-preparar": { icon: "🍽️", color: "text-purple-600" },
  "saude-e-seguranca": { icon: "🛡️", color: "text-red-600" },
  "decorar-e-brilhar": { icon: "✨", color: "text-pink-600" },
  "sono-e-relaxamento": { icon: "😴", color: "text-indigo-600" },
  "aprender-e-brincar": { icon: "🎨", color: "text-green-600" },
  "sair-e-viajar": { icon: "✈️", color: "text-yellow-600" },
  "organizacao": { icon: "📦", color: "text-teal-600" }
};

type TaxonomyNode = {
  slug: string;
  name: string;
  children?: TaxonomyNode[];
  icon?: string;
  color?: string;
};

// Função para processar taxonomias já hierárquicas da API
const processTaxonomyData = (taxonomies: any[]): TaxonomyNode[] => {
  // A API já retorna dados hierárquicos com children
  return taxonomies.map(category => {
    const style = categoryStyles[category.slug] || { icon: "📦", color: "text-gray-600" };
    
    return {
      slug: category.slug,
      name: category.name,
      children: category.children?.map((child: any) => ({
        slug: child.slug,
        name: child.name,
        children: [] // Expandir se houver nível 3
      })) || [],
      icon: style.icon,
      color: style.color
    };
  });
};

export default function TestFiltersSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Buscar taxonomias do banco (já hierárquicas)
  const { data: rawTaxonomies = [], isLoading: taxonomiesLoading, error: taxonomiesError } = useQuery<any[]>({
    queryKey: ["/api/taxonomies"],
  });
  
  // Debug taxonomies loading
  console.log("🔍 Taxonomies Debug:", {
    rawTaxonomies,
    taxonomiesLoading,
    taxonomiesError,
    count: rawTaxonomies.length,
    sample: rawTaxonomies[0]
  });
  
  // Processar taxonomias já hierárquicas
  const taxonomyHierarchy = useMemo(() => {
    const hierarchy = processTaxonomyData(rawTaxonomies);
    console.log("🏗️ Taxonomy Hierarchy Processed:", hierarchy);
    return hierarchy;
  }, [rawTaxonomies]);

  // Buscar produtos
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Toggle expansão das categorias
  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categorySlug]: !prev[categorySlug]
    }));
  };

  // Selecionar filtro
  const toggleFilter = (taxonomySlug: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [taxonomySlug]: !prev[taxonomySlug]
    }));
  };

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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

  // Loading state
  if (taxonomiesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando filtros...</p>
        </div>
      </div>
    );
  }

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
              {taxonomyHierarchy.map((category) => (
                <div key={category.slug}>
                  {/* Categoria Principal */}
                  <div
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                    onClick={() => toggleCategory(category.slug)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {category.children && category.children.length > 0 ? (
                          expandedCategories[category.slug] ? 
                            <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <span className={`font-medium text-sm ${category.color}`}>
                        {category.name}
                      </span>
                    </div>
                    
                    {/* Checkbox para categoria */}
                    <input
                      type="checkbox"
                      checked={selectedFilters[category.slug] || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFilter(category.slug);
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                      data-testid={`checkbox-${category.slug}`}
                    />
                  </div>

                  {/* Subcategorias */}
                  {expandedCategories[category.slug] && category.children?.map((subcategory) => (
                    <div key={subcategory.slug} className="ml-4">
                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3" />
                          <span className="text-sm text-gray-700">{subcategory.name}</span>
                        </div>
                        
                        <input
                          type="checkbox"
                          checked={selectedFilters[subcategory.slug] || false}
                          onChange={() => toggleFilter(subcategory.slug)}
                          className="w-3 h-3 text-purple-600 rounded"
                          data-testid={`checkbox-${subcategory.slug}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Debug Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div>📊 {taxonomyHierarchy.length} categorias principais</div>
              <div>🏷️ {rawTaxonomies.filter(t => t.level === 2).length} subcategorias</div>
              <div>🛒 {filteredProducts.length} produtos encontrados</div>
              <div>🎯 {activeFiltersCount} filtros ativos</div>
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
                    onClick={() => setSidebarOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-purple-200"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Produtos Filtrados
                  </h1>
                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} produtos encontrados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
                data-testid={`product-card-${product.id}`}
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                      data-testid={`product-image-${product.id}`}
                    />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" data-testid={`product-title-${product.id}`}>
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3" data-testid={`product-description-${product.id}`}>
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-600" data-testid={`product-price-${product.id}`}>
                    R$ {product.currentPrice ? Number(product.currentPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A'}
                  </span>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600" data-testid={`button-view-${product.id}`}>
                    Ver Produto
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}