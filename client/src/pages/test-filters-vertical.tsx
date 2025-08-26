import React, { useState, useMemo } from "react";
import { Search, Filter, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

// Dados dos filtros hierárquicos
const primaryCategories = [
  {
    id: "comer-preparar",
    title: "Comer e Preparar",
    icon: "🍽️",
    description: "Alimentação e preparo de refeições",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "limpar-organizar", 
    title: "Limpar e Organizar",
    icon: "🧹",
    description: "Limpeza e organização da casa",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "brincar-aprender",
    title: "Brincar e Aprender", 
    icon: "🎨",
    description: "Diversão e desenvolvimento",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "cuidar-proteger",
    title: "Cuidar e Proteger",
    icon: "🛡️", 
    description: "Cuidados e proteção",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "dormir-descansar",
    title: "Dormir e Descansar",
    icon: "😴",
    description: "Sono e relaxamento",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: "passear-viajar",
    title: "Passear e Viajar", 
    icon: "✈️",
    description: "Mobilidade e viagens",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "vestir-trocar",
    title: "Vestir e Trocar",
    icon: "👕",
    description: "Roupas e acessórios", 
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "tecnologia-conectar",
    title: "Tecnologia e Conectar",
    icon: "📱",
    description: "Tecnologia e comunicação",
    color: "from-teal-500 to-blue-500"
  }
];

const audienceOptions = {
  "comer-preparar": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" }
  ],
  "limpar-organizar": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" }
  ],
  "brincar-aprender": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "adolescente", label: "Adolescente", icon: "🧑‍🎓", color: "bg-blue-100 text-blue-800" }
  ],
  "cuidar-proteger": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" }
  ],
  "dormir-descansar": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" }
  ],
  "passear-viajar": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" }
  ],
  "vestir-trocar": [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-yellow-100 text-yellow-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "adolescente", label: "Adolescente", icon: "🧑‍🎓", color: "bg-blue-100 text-blue-800" }
  ],
  "tecnologia-conectar": [
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "adolescente", label: "Adolescente", icon: "🧑‍🎓", color: "bg-blue-100 text-blue-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" }
  ]
};

const environmentOptions = {
  "comer-preparar": {
    "bebe": [
      { id: "casa", label: "Casa", icon: "🏠", color: "bg-green-100 text-green-700" },
      { id: "cozinha", label: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-700" }
    ],
    "crianca": [
      { id: "casa", label: "Casa", icon: "🏠", color: "bg-green-100 text-green-700" },
      { id: "escola", label: "Escola", icon: "🏫", color: "bg-blue-100 text-blue-700" },
      { id: "cozinha", label: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-700" }
    ],
    "familia": [
      { id: "casa", label: "Casa", icon: "🏠", color: "bg-green-100 text-green-700" },
      { id: "cozinha", label: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-700" },
      { id: "restaurante", label: "Restaurante", icon: "🍽️", color: "bg-red-100 text-red-700" }
    ]
  },
  "limpar-organizar": {
    "bebe": [
      { id: "quarto", label: "Quarto", icon: "🛏️", color: "bg-purple-100 text-purple-700" },
      { id: "casa", label: "Casa", icon: "🏠", color: "bg-green-100 text-green-700" }
    ],
    "crianca": [
      { id: "quarto", label: "Quarto", icon: "🛏️", color: "bg-purple-100 text-purple-700" },
      { id: "casa", label: "Casa", icon: "🏠", color: "bg-green-100 text-green-700" },
      { id: "escola", label: "Escola", icon: "🏫", color: "bg-blue-100 text-blue-700" }
    ],
    "familia": [
      { id: "casa", label: "Casa", icon: "🏠", color: "bg-green-100 text-green-700" },
      { id: "garagem", label: "Garagem", icon: "🚗", color: "bg-gray-100 text-gray-700" }
    ]
  }
};

const occasionOptions = {
  "comer-preparar": [
    { id: "cafe-manha", label: "Café da Manhã", icon: "☀️", color: "bg-yellow-100 text-yellow-700" },
    { id: "almoco", label: "Almoço", icon: "🌞", color: "bg-orange-100 text-orange-700" },
    { id: "jantar", label: "Jantar", icon: "🌙", color: "bg-blue-100 text-blue-700" },
    { id: "lanche", label: "Lanche", icon: "🍎", color: "bg-green-100 text-green-700" }
  ],
  "limpar-organizar": [
    { id: "diario", label: "Limpeza Diária", icon: "📅", color: "bg-blue-100 text-blue-700" },
    { id: "semanal", label: "Limpeza Semanal", icon: "🗓️", color: "bg-purple-100 text-purple-700" },
    { id: "organizacao", label: "Organização", icon: "📦", color: "bg-green-100 text-green-700" }
  ]
};

export default function TestFiltersVertical() {
  const [selectedPrimary, setSelectedPrimary] = useState<string>("");
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(true);

  // Buscar produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Reset hierarquia quando muda categoria principal
  const handlePrimarySelect = (categoryId: string) => {
    setSelectedPrimary(categoryId);
    setSelectedAudience("");
    setSelectedEnvironment("");
    setSelectedOccasion("");
  };

  // Reset níveis inferiores quando muda público
  const handleAudienceSelect = (audienceId: string) => {
    setSelectedAudience(audienceId);
    setSelectedEnvironment("");
    setSelectedOccasion("");
  };

  // Reset último nível quando muda ambiente
  const handleEnvironmentSelect = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    setSelectedOccasion("");
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
  }, [products, searchQuery, priceRange]);

  // Contar filtros ativos
  const activeFiltersCount = [selectedPrimary, selectedAudience, selectedEnvironment, selectedOccasion]
    .filter(Boolean).length;

  // Reset todos os filtros
  const resetFilters = () => {
    setSelectedPrimary("");
    setSelectedAudience("");
    setSelectedEnvironment("");
    setSelectedOccasion("");
    setSearchQuery("");
    setPriceRange([0, 1000]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Filtros Hierárquicos Verticais
              </h1>
              <p className="text-gray-600 mt-1">Estrutura em cascata com empilhamento vertical</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="relative text-lg px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                size="lg"
              >
                <Filter className="w-5 h-5 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white font-bold text-sm px-2 py-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="px-4 py-3"
                  size="lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
            {/* Etapa 1: Categorias Principais (Horizontal) */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Escolha a Categoria Principal</h3>
                  <p className="text-gray-600">Selecione a área de interesse principal</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {primaryCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handlePrimarySelect(category.id)}
                    className={`p-4 rounded-xl transition-all duration-300 border-2 text-left group hover:scale-105 ${
                      selectedPrimary === category.id
                        ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h4 className={`font-bold text-base mb-1 ${
                      selectedPrimary === category.id ? 'text-white' : 'text-gray-800'
                    }`}>
                      {category.title}
                    </h4>
                    <p className={`text-sm ${
                      selectedPrimary === category.id ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Etapa 2: Público-Alvo (aparece abaixo da categoria selecionada) */}
            {selectedPrimary && audienceOptions[selectedPrimary as keyof typeof audienceOptions] && (
              <div className="mb-8 animate-in slide-in-from-top-4 duration-500 ml-8 border-l-4 border-purple-300 pl-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Para quem é este produto?</h3>
                    <p className="text-gray-600">
                      Baseado em <span className="font-semibold text-purple-600">
                        {primaryCategories.find(c => c.id === selectedPrimary)?.title}
                      </span>, estas são as opções disponíveis
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {audienceOptions[selectedPrimary as keyof typeof audienceOptions].map((audience) => (
                    <button
                      key={audience.id}
                      onClick={() => handleAudienceSelect(audience.id)}
                      className={`px-6 py-3 rounded-full transition-all duration-300 border-2 flex items-center gap-2 hover:scale-105 ${
                        selectedAudience === audience.id
                          ? 'bg-green-600 text-white border-green-600 shadow-lg'
                          : `${audience.color} border-transparent hover:shadow-md`
                      }`}
                    >
                      <span className="text-lg">{audience.icon}</span>
                      <span className="font-medium">{audience.label}</span>
                      {selectedAudience === audience.id && (
                        <ChevronRight className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 3: Ambiente (aparece abaixo do público selecionado) */}
            {selectedAudience && environmentOptions[selectedPrimary as keyof typeof environmentOptions]?.[selectedAudience as keyof typeof environmentOptions[keyof typeof environmentOptions]] && (
              <div className="mb-8 animate-in slide-in-from-top-4 duration-500 ml-16 border-l-4 border-orange-300 pl-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Em que ambiente será usado?</h3>
                    <p className="text-gray-600">Selecione onde o produto será utilizado</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {environmentOptions[selectedPrimary as keyof typeof environmentOptions]?.[selectedAudience as keyof typeof environmentOptions[keyof typeof environmentOptions]]?.map((environment) => (
                    <button
                      key={environment.id}
                      onClick={() => handleEnvironmentSelect(environment.id)}
                      className={`p-4 rounded-xl transition-all duration-300 border-2 text-left hover:scale-105 ${
                        selectedEnvironment === environment.id
                          ? 'bg-orange-600 text-white border-orange-600 shadow-lg'
                          : `${environment.color} border-transparent hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{environment.icon}</span>
                        <span className="font-medium">{environment.label}</span>
                        {selectedEnvironment === environment.id && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 4: Ocasião (aparece abaixo do ambiente selecionado) */}
            {selectedEnvironment && occasionOptions[selectedPrimary as keyof typeof occasionOptions] && (
              <div className="mb-8 animate-in slide-in-from-top-4 duration-500 ml-24 border-l-4 border-blue-300 pl-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Para qual ocasião?</h3>
                    <p className="text-gray-600">Quando ou como será usado</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {occasionOptions[selectedPrimary as keyof typeof occasionOptions].map((occasion) => (
                    <button
                      key={occasion.id}
                      onClick={() => setSelectedOccasion(occasion.id)}
                      className={`px-6 py-3 rounded-full transition-all duration-300 border-2 flex items-center gap-2 hover:scale-105 ${
                        selectedOccasion === occasion.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : `${occasion.color} border-transparent hover:shadow-md`
                      }`}
                    >
                      <span className="text-lg">{occasion.icon}</span>
                      <span className="font-medium">{occasion.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros Adicionais */}
            <div className="pt-8 mt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Filtros Adicionais</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Busca por texto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar produtos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Digite o nome do produto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                      data-testid="input-search-products"
                    />
                  </div>
                </div>

                {/* Faixa de preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faixa de Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
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
          </div>
        )}

        {/* Resultados */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Produtos Encontrados ({filteredProducts.length})
            </h2>
            
            {/* Resumo dos filtros aplicados */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPrimary && (
                  <Badge className="bg-purple-100 text-purple-800">
                    {primaryCategories.find(c => c.id === selectedPrimary)?.title}
                  </Badge>
                )}
                {selectedAudience && (
                  <Badge className="bg-green-100 text-green-800">
                    {audienceOptions[selectedPrimary as keyof typeof audienceOptions]?.find(a => a.id === selectedAudience)?.label}
                  </Badge>
                )}
                {selectedEnvironment && (
                  <Badge className="bg-orange-100 text-orange-800">
                    {environmentOptions[selectedPrimary as keyof typeof environmentOptions]?.[selectedAudience as keyof typeof environmentOptions[keyof typeof environmentOptions]]?.find(e => e.id === selectedEnvironment)?.label}
                  </Badge>
                )}
                {selectedOccasion && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {occasionOptions[selectedPrimary as keyof typeof occasionOptions]?.find(o => o.id === selectedOccasion)?.label}
                  </Badge>
                )}
              </div>
            )}
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
  );
}