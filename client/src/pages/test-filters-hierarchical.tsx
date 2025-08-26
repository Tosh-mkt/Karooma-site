import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
// import { GradientButton } from "@/components/common/GradientButton";
// import { ProductGrid } from "@/components/products/ProductGrid";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function TestFiltersHierarchical() {
  // Estados do filtro hierárquico
  const [selectedPrimaryTag, setSelectedPrimaryTag] = useState("");
  const [selectedTargetAudience, setSelectedTargetAudience] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // MAPEAMENTO HIERÁRQUICO BASEADO NO MAPA MENTAL
  const categoryHierarchy = {
    "comer-preparar": {
      label: "Comer e Preparar",
      emoji: "🍽️",
      color: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg",
      description: "Alimentação e preparo de refeições",
      allowedAudience: ["bebe", "crianca", "familia"],
      allowedEnvironments: ["casa", "cozinha"],
      allowedOccasions: ["dia-dia", "emergencia"]
    },
    "presentear": {
      label: "Presentear",
      emoji: "🎁",
      color: "bg-purple-500 hover:bg-purple-600 text-white shadow-lg",
      description: "Presentes para ocasiões especiais",
      allowedAudience: ["bebe", "crianca", "familia"],
      allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
      allowedOccasions: ["presente-ocasioes", "presente-idade"]
    },
    "sono-relaxamento": {
      label: "Sono e Relaxamento",
      emoji: "😴",
      color: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
      description: "Produtos para dormir e relaxar",
      allowedAudience: ["bebe", "crianca", "pais-cuidadores"],
      allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
      allowedOccasions: ["dia-dia", "viagem"]
    },
    "aprender-brincar": {
      label: "Aprender e Brincar",
      emoji: "🎨",
      color: "bg-green-500 hover:bg-green-600 text-white shadow-lg",
      description: "Educação e diversão",
      allowedAudience: ["bebe", "crianca", "familia"],
      allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
      allowedOccasions: ["dia-dia", "presente-idade"]
    },
    "sair-viajar": {
      label: "Sair e Viajar",
      emoji: "🚗",
      color: "bg-teal-500 hover:bg-teal-600 text-white shadow-lg",
      description: "Mobilidade e viagens",
      allowedAudience: ["bebe", "crianca", "familia"],
      allowedEnvironments: ["carro", "casa"],
      allowedOccasions: ["viagem", "emergencia", "dia-dia"]
    },
    "organizacao": {
      label: "Organização",
      emoji: "📦",
      color: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg",
      description: "Organizar casa e espaços",
      allowedAudience: ["bebe", "crianca", "familia", "pais-cuidadores"],
      allowedEnvironments: ["casa", "cozinha", "area-servico", "quarto-bebe", "quarto-crianca", "carro"],
      allowedOccasions: ["dia-dia"]
    },
    "saude-seguranca": {
      label: "Saúde e Segurança",
      emoji: "🏥",
      color: "bg-red-500 hover:bg-red-600 text-white shadow-lg",
      description: "Cuidados médicos e segurança",
      allowedAudience: ["bebe", "crianca", "familia", "pais-cuidadores"],
      allowedEnvironments: ["casa", "cozinha", "area-servico", "quarto-bebe", "quarto-crianca", "carro"],
      allowedOccasions: ["emergencia", "dia-dia", "primeiros-socorros"]
    },
    "decorar-brilhar": {
      label: "Decorar e Brilhar",
      emoji: "✨",
      color: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg",
      description: "Decoração e estética",
      allowedAudience: ["familia", "pais-cuidadores"],
      allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
      allowedOccasions: ["dia-dia", "presente-ocasioes"]
    }
  };

  // Converter para array para o map
  const primaryTags = Object.entries(categoryHierarchy).map(([id, data]) => ({
    id,
    ...data
  }));

  // TODAS AS OPÇÕES POSSÍVEIS (para referência)
  const allTargetAudience = [
    { id: "bebe", label: "Bebê", icon: "👶", color: "bg-blue-100 text-blue-800" },
    { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
    { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" },
    { id: "pais-cuidadores", label: "Pais e Cuidadores", icon: "👥", color: "bg-orange-100 text-orange-800" },
  ];

  const allEnvironments = [
    { id: "casa", label: "Casa", icon: "🏠", color: "bg-yellow-100 text-yellow-800" },
    { id: "cozinha", label: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-800" },
    { id: "area-servico", label: "Área de Serviço", icon: "🧺", color: "bg-blue-100 text-blue-800" },
    { id: "quarto-bebe", label: "Quarto do Bebê", icon: "🛏️", color: "bg-pink-100 text-pink-800" },
    { id: "quarto-crianca", label: "Quarto da Criança", icon: "🎪", color: "bg-green-100 text-green-800" },
    { id: "carro", label: "Carro", icon: "🚗", color: "bg-gray-100 text-gray-800" },
  ];

  const allSpecialOccasions = [
    { id: "presente-ocasioes", label: "Presente para Ocasiões", icon: "🎉", color: "bg-purple-100 text-purple-800" },
    { id: "presente-idade", label: "Presente por Idade", icon: "🎂", color: "bg-yellow-100 text-yellow-800" },
    { id: "emergencia", label: "Emergência", icon: "🚨", color: "bg-red-100 text-red-800" },
    { id: "dia-dia", label: "Uso Diário", icon: "📅", color: "bg-gray-100 text-gray-800" },
    { id: "viagem", label: "Viagem", icon: "✈️", color: "bg-blue-100 text-blue-800" },
  ];

  // Funções para obter opções disponíveis baseadas na hierarquia
  const getAvailableAudience = () => {
    if (!selectedPrimaryTag) return [];
    const allowed = categoryHierarchy[selectedPrimaryTag]?.allowedAudience || [];
    return allTargetAudience.filter(item => allowed.includes(item.id));
  };

  const getAvailableEnvironments = () => {
    if (!selectedPrimaryTag) return [];
    const allowed = categoryHierarchy[selectedPrimaryTag]?.allowedEnvironments || [];
    return allEnvironments.filter(item => allowed.includes(item.id));
  };

  const getAvailableOccasions = () => {
    if (!selectedPrimaryTag) return [];
    const allowed = categoryHierarchy[selectedPrimaryTag]?.allowedOccasions || [];
    return allSpecialOccasions.filter(item => allowed.includes(item.id));
  };

  // Função para resetar subcategorias quando mudar tag primário
  const handlePrimaryTagChange = (tagId: string) => {
    const newTag = selectedPrimaryTag === tagId ? "" : tagId;
    setSelectedPrimaryTag(newTag);
    // Limpar subcategorias quando mudar tag primário
    setSelectedTargetAudience([]);
    setSelectedEnvironments([]);
    setSelectedOccasions([]);
  };

  const toggleTargetAudience = (audienceId: string) => {
    setSelectedTargetAudience(prev => 
      prev.includes(audienceId) 
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  const toggleEnvironment = (envId: string) => {
    setSelectedEnvironments(prev => 
      prev.includes(envId) 
        ? prev.filter(id => id !== envId)
        : [...prev, envId]
    );
  };

  const toggleOccasion = (occasionId: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasionId) 
        ? prev.filter(id => id !== occasionId)
        : [...prev, occasionId]
    );
  };

  // Obter opções filtradas dinamicamente
  const availableAudience = getAvailableAudience();
  const availableEnvironments = getAvailableEnvironments();
  const availableOccasions = getAvailableOccasions();

  const activeFiltersCount = [selectedPrimaryTag].filter(Boolean).length + 
                           selectedTargetAudience.length + selectedEnvironments.length + selectedOccasions.length +
                           (selectedRating > 0 ? 1 : 0) + (selectedPriceRange[1] < 1000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedPrimaryTag("");
    setSelectedTargetAudience([]);
    setSelectedEnvironments([]);
    setSelectedOccasions([]);
    setSelectedRating(0);
    setSelectedPriceRange([0, 1000]);
    setSelectedCategory("all");
    setSearchQuery("");
  };

  // Filtrar produtos
  const filteredProducts = products?.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const currentPrice = product.currentPrice ? parseFloat(product.currentPrice.toString()) : 0;
    const matchesPrice = currentPrice >= selectedPriceRange[0] && currentPrice <= selectedPriceRange[1];
    
    const productRating = product.rating ? parseFloat(product.rating.toString()) : 0;
    const matchesRating = selectedRating === 0 || productRating >= selectedRating;
    
    return matchesCategory && matchesSearch && matchesPrice && matchesRating;
  }) || [];

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-fredoka text-5xl gradient-text mb-4">
              🎯 Filtros em Cascata
            </h1>
            <p className="font-poppins text-xl text-gray-600">
              Navegação hierárquica: cada seleção revela as próximas opções
            </p>
            
            {/* Indicador de Progresso */}
            <div className="mt-8 flex items-center justify-center space-x-2 md:space-x-4 flex-wrap gap-2">
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedPrimaryTag ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600'
              }`}>
                <span className="mr-2">1️⃣</span>
                Categoria {selectedPrimaryTag && '✓'}
              </div>
              <div className="w-6 h-0.5 bg-gray-300 hidden md:block"></div>
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedTargetAudience.length > 0 ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600'
              }`}>
                <span className="mr-2">2️⃣</span>
                Público {selectedTargetAudience.length > 0 && '✓'}
              </div>
              <div className="w-6 h-0.5 bg-gray-300 hidden md:block"></div>
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedEnvironments.length > 0 ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600'
              }`}>
                <span className="mr-2">3️⃣</span>
                Ambiente {selectedEnvironments.length > 0 && '✓'}
              </div>
              <div className="w-6 h-0.5 bg-gray-300 hidden md:block"></div>
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedOccasions.length > 0 ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600'
              }`}>
                <span className="mr-2">4️⃣</span>
                Ocasião {selectedOccasions.length > 0 && '✓'}
              </div>
            </div>
          </motion.div>

          {/* Controles */}
          <motion.div 
            className="mb-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl bg-white shadow-lg border-2 border-white/50 focus:border-purple-400 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
            </div>

            {/* Toggle e Clear */}
            <div className="flex flex-wrap justify-center gap-4">
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
                <Button variant="outline" onClick={clearAllFilters} size="lg" className="text-lg px-6 py-3">
                  <X className="w-5 h-5 mr-2" />
                  Limpar Todos
                </Button>
              )}
            </div>
          </motion.div>

          {/* Painéis de Filtro Hierárquico */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 space-y-6"
              >
                {/* ETAPA 1: CATEGORIA PRINCIPAL */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-indigo-600 font-bold text-xl">1</span>
                      </div>
                      <div>
                        <h2 className="font-fredoka text-3xl text-white font-bold">
                          ✨ Escolha a categoria principal
                        </h2>
                        <p className="text-white/80">Primeiro, selecione o tipo de produto que você procura</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {primaryTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handlePrimaryTagChange(tag.id)}
                          className={`
                            relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105
                            ${
                              selectedPrimaryTag === tag.id
                                ? "bg-white text-gray-800 shadow-2xl scale-105 ring-4 ring-white/50"
                                : "bg-white/20 text-white hover:bg-white/30 border-2 border-white/30"
                            }
                          `}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3">{tag.emoji}</div>
                            <div className="font-bold text-lg mb-2">{tag.label}</div>
                            <div className="text-sm opacity-80">{tag.description}</div>
                            {selectedPrimaryTag === tag.id && (
                              <div className="mt-4 flex items-center justify-center">
                                <span className="text-xs text-gray-600 mr-2">Próxima etapa</span>
                                <span className="text-purple-600 animate-bounce text-lg">↓</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ETAPA 2: PÚBLICO-ALVO - Aparece apenas após selecionar categoria */}
                {selectedPrimaryTag && availableAudience.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold text-xl">2</span>
                        </div>
                        <div>
                          <h3 className="font-fredoka text-2xl text-gray-800">
                            👥 Para quem é este produto?
                          </h3>
                          <p className="text-gray-600">
                            Baseado em <span className="font-bold text-purple-600">{categoryHierarchy[selectedPrimaryTag]?.label}</span>, estas são as opções disponíveis
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {availableAudience.map((audience) => (
                          <button
                            key={audience.id}
                            onClick={() => toggleTargetAudience(audience.id)}
                            className={`
                              flex items-center px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105
                              ${selectedTargetAudience.includes(audience.id) 
                                ? `${audience.color} shadow-xl ring-4 ring-purple-300 scale-105` 
                                : `${audience.color} hover:shadow-lg border-2 border-gray-200 hover:border-purple-300`
                              }
                            `}
                          >
                            <span className="mr-3 text-2xl">{audience.icon}</span>
                            <span>{audience.label}</span>
                            {selectedTargetAudience.includes(audience.id) && (
                              <span className="ml-3 text-lg">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedTargetAudience.length > 0 && (
                        <div className="mt-6 text-center">
                          <span className="text-gray-500 mr-2">Próxima etapa</span>
                          <span className="text-purple-600 animate-bounce text-lg">↓</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 3: AMBIENTE - Aparece apenas após selecionar público */}
                {selectedTargetAudience.length > 0 && availableEnvironments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-blue-200 overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold text-xl">3</span>
                        </div>
                        <div>
                          <h3 className="font-fredoka text-2xl text-gray-800">
                            🏠 Em que ambiente será usado?
                          </h3>
                          <p className="text-gray-600">Selecione onde o produto será utilizado</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {availableEnvironments.map((env) => (
                          <button
                            key={env.id}
                            onClick={() => toggleEnvironment(env.id)}
                            className={`
                              flex flex-col items-center p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105
                              ${selectedEnvironments.includes(env.id) 
                                ? `${env.color} shadow-xl ring-4 ring-blue-300 scale-105` 
                                : `${env.color} hover:shadow-lg border-2 border-gray-200 hover:border-blue-300`
                              }
                            `}
                          >
                            <span className="text-3xl mb-2">{env.icon}</span>
                            <span className="font-medium text-sm">{env.label}</span>
                            {selectedEnvironments.includes(env.id) && (
                              <span className="mt-2 text-lg">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedEnvironments.length > 0 && availableOccasions.length > 0 && (
                        <div className="mt-6 text-center">
                          <span className="text-gray-500 mr-2">Etapa final (opcional)</span>
                          <span className="text-blue-600 animate-bounce text-lg">↓</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 4: OCASIÃO - Etapa final opcional */}
                {selectedEnvironments.length > 0 && availableOccasions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-xl overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-green-600 font-bold text-xl">4</span>
                        </div>
                        <div>
                          <h3 className="font-fredoka text-2xl text-white font-bold">
                            🎉 Para qual ocasião?
                          </h3>
                          <p className="text-white/90">Opcional: refine ainda mais sua busca</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {availableOccasions.map((occasion) => (
                          <button
                            key={occasion.id}
                            onClick={() => toggleOccasion(occasion.id)}
                            className={`
                              flex items-center px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105
                              ${selectedOccasions.includes(occasion.id) 
                                ? 'bg-white text-green-700 shadow-xl ring-4 ring-white/50 scale-105' 
                                : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
                              }
                            `}
                          >
                            <span className="mr-3 text-2xl">{occasion.icon}</span>
                            <span>{occasion.label}</span>
                            {selectedOccasions.includes(occasion.id) && (
                              <span className="ml-3 text-lg">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedOccasions.length > 0 && (
                        <div className="mt-6 text-center">
                          <span className="text-white/90 text-lg font-medium">🎯 Filtro hierárquico completo!</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* FILTROS EXTRAS */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="bg-gray-50 rounded-3xl shadow-xl p-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white font-bold text-xl">+</span>
                    </div>
                    <h3 className="font-fredoka text-2xl text-gray-800 font-bold">Filtros Adicionais</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Price Range */}
                    <div>
                      <h4 className="font-outfit text-xl text-gray-800 mb-4">💰 Faixa de Preço</h4>
                      <Slider
                        value={selectedPriceRange}
                        onValueChange={setSelectedPriceRange}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>R$ {selectedPriceRange[0]}</span>
                        <span>R$ {selectedPriceRange[1]}</span>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <h4 className="font-outfit text-xl text-gray-800 mb-4">⭐ Avaliação Mínima</h4>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setSelectedRating(rating)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              selectedRating === rating
                                ? 'bg-yellow-400 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {rating === 0 ? 'Todas' : `${rating}+`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resumo dos Filtros Ativos */}
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
            >
              <h3 className="font-outfit text-xl text-blue-800 font-bold mb-4">
                📋 Filtros Ativos ({activeFiltersCount})
              </h3>
              <div className="space-y-2">
                {selectedPrimaryTag && (
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">🏷️</span>
                    <span className="font-medium">Categoria:</span>
                    <span className="ml-2 font-bold">{categoryHierarchy[selectedPrimaryTag]?.label}</span>
                  </div>
                )}
                {selectedTargetAudience.length > 0 && (
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">👥</span>
                    <span className="font-medium">Público:</span>
                    <span className="ml-2">{selectedTargetAudience.map(id => allTargetAudience.find(t => t.id === id)?.label).join(", ")}</span>
                  </div>
                )}
                {selectedEnvironments.length > 0 && (
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">🏠</span>
                    <span className="font-medium">Ambientes:</span>
                    <span className="ml-2">{selectedEnvironments.map(id => allEnvironments.find(e => e.id === id)?.label).join(", ")}</span>
                  </div>
                )}
                {selectedOccasions.length > 0 && (
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">🎉</span>
                    <span className="font-medium">Ocasiões:</span>
                    <span className="ml-2">{selectedOccasions.map(id => allSpecialOccasions.find(o => o.id === id)?.label).join(", ")}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Resultados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-fredoka text-3xl text-gray-800">
                🛍️ Produtos Encontrados ({filteredProducts.length})
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}