import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Estilos para cada categoria principal
const categoryStyles: Record<string, { icon: string; color: string }> = {
  'comer-e-preparar': { icon: '🍽️', color: 'text-purple-600' },
  'saude-e-seguranca': { icon: '🛡️', color: 'text-red-600' },
  'dormir-e-descansar': { icon: '😴', color: 'text-blue-600' },
  'higiene-e-cuidados': { icon: '🧽', color: 'text-green-600' },
  'brincar-e-aprender': { icon: '🎨', color: 'text-yellow-600' },
  'organizar-e-guardar': { icon: '📦', color: 'text-indigo-600' },
  'vestir-e-proteger': { icon: '👕', color: 'text-pink-600' },
};

interface TaxonomyNode {
  slug: string;
  name: string;
  children: TaxonomyNode[];
  icon?: string;
  color?: string;
}

interface TaxonomyFiltersProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  defaultExpanded?: string[];
  className?: string;
}

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

export function TaxonomyFilters({ 
  selected, 
  onChange, 
  defaultExpanded = [], 
  className = "" 
}: TaxonomyFiltersProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultExpanded.map(slug => [slug, true]))
  );

  // Buscar taxonomias do banco (já hierárquicas)
  const { data: rawTaxonomies = [], isLoading: taxonomiesLoading } = useQuery<any[]>({
    queryKey: ["/api/taxonomies"],
  });
  
  // Processar taxonomias já hierárquicas
  const taxonomyHierarchy = useMemo(() => {
    return processTaxonomyData(rawTaxonomies);
  }, [rawTaxonomies]);

  // Toggle expansão das categorias
  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categorySlug]: !prev[categorySlug]
    }));
  };

  // Toggle seleção de filtro
  const toggleFilter = (taxonomySlug: string) => {
    const newSelected = selected.includes(taxonomySlug)
      ? selected.filter(slug => slug !== taxonomySlug)
      : [...selected, taxonomySlug];
    onChange(newSelected);
  };

  if (taxonomiesLoading) {
    return (
      <div className={`p-4 ${className}`} data-testid="taxonomy-filters-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Carregando filtros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`} data-testid="taxonomy-filters">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-purple-600" />
          <h3 className="font-medium text-gray-700">Filtrar por Categoria</h3>
        </div>
        {selected.length > 0 && (
          <div className="text-xs text-gray-500">
            {selected.length} {selected.length === 1 ? 'categoria selecionada' : 'categorias selecionadas'}
          </div>
        )}
      </div>

      {/* Menu Hierárquico */}
      <div className="space-y-1">
        {taxonomyHierarchy.map((category) => (
          <div key={category.slug} data-testid={`taxonomy-category-${category.slug}`}>
            {/* Categoria Principal */}
            <div
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
              onClick={() => toggleCategory(category.slug)}
              data-testid={`category-toggle-${category.slug}`}
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
                  <span className="text-base">{category.icon}</span>
                </div>
                <span className={`font-medium text-sm ${category.color}`}>
                  {category.name}
                </span>
              </div>
              <input
                type="checkbox"
                checked={selected.includes(category.slug)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleFilter(category.slug);
                }}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                data-testid={`checkbox-${category.slug}`}
              />
            </div>

            {/* Subcategorias */}
            {expandedCategories[category.slug] && category.children && (
              <div className="ml-6 space-y-1 mt-1">
                {category.children.map((child) => (
                  <div
                    key={child.slug}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleFilter(child.slug)}
                    data-testid={`subcategory-${child.slug}`}
                  >
                    <span className="text-sm text-gray-700">
                      {child.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={selected.includes(child.slug)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFilter(child.slug);
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      data-testid={`checkbox-${child.slug}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {taxonomyHierarchy.length === 0 && (
        <div className="text-center py-4" data-testid="taxonomy-filters-empty">
          <p className="text-gray-500 text-sm">Nenhuma categoria disponível</p>
        </div>
      )}
    </div>
  );
}