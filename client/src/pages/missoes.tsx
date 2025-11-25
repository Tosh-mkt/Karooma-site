import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Sparkles, ArrowRight, Leaf, Search, Target, ChevronRight, ArrowLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DilemmaQuiz } from "@/components/missoes/DilemmaQuiz";
import type { SelectMission, SelectDiagnostic } from "@shared/schema";

const CATEGORIES = [
  { value: "all", label: "Todas", icon: "✨" },
  { value: "Rotina Matinal", label: "Rotina Matinal", icon: "☕" },
  { value: "Casa em Ordem", label: "Casa em Ordem", icon: "🏠" },
  { value: "Cozinha Inteligente", label: "Cozinha Inteligente", icon: "🍳" },
  { value: "Educação e Brincadeiras", label: "Educação e Brincadeiras", icon: "📚" },
  { value: "Tempo para Mim", label: "Tempo para Mim", icon: "💆" },
  { value: "Presentes e Afetos", label: "Presentes e Afetos", icon: "💝" },
  { value: "Passeios e Saídas", label: "Passeios e Saídas", icon: "🚗" },
  { value: "Saúde e Emergências", label: "Saúde e Emergências", icon: "🏥" },
  { value: "Manutenção e Melhorias do Lar", label: "Manutenção do Lar", icon: "🔧" },
];

const DIAGNOSTIC_AREA_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  cargaMental: { label: "Carga Mental", icon: "🧠", color: "from-purple-500 to-pink-500" },
  tempoDaCasa: { label: "Tempo da Casa", icon: "🏠", color: "from-blue-500 to-cyan-500" },
  tempoDeQualidade: { label: "Tempo de Qualidade", icon: "💕", color: "from-rose-500 to-orange-500" },
  alimentacao: { label: "Alimentação", icon: "🍽️", color: "from-green-500 to-emerald-500" },
  gestaoDaCasa: { label: "Gestão da Casa", icon: "📋", color: "from-amber-500 to-yellow-500" },
  logisticaInfantil: { label: "Logística Infantil", icon: "👶", color: "from-indigo-500 to-violet-500" },
};

type ViewMode = "recommendations" | "all-categories" | "category" | "diagnostic-area";

export default function Missoes() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const diagnosticIdFromUrl = params.get("diagnosticId");

  const [viewMode, setViewMode] = useState<ViewMode>("recommendations");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDiagnosticArea, setSelectedDiagnosticArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDilemmaQuiz, setShowDilemmaQuiz] = useState(false);

  const { data: session } = useQuery<{ user?: { id?: string; email?: string; name?: string } }>({
    queryKey: ['/api/session'],
  });

  const { data: diagnostic, isLoading: diagnosticLoading } = useQuery<SelectDiagnostic>({
    queryKey: ['/api/diagnostics', diagnosticIdFromUrl || 'latest', session?.user?.id],
    queryFn: async () => {
      if (diagnosticIdFromUrl) {
        const res = await fetch(`/api/diagnostics/${diagnosticIdFromUrl}`);
        if (!res.ok) throw new Error('Diagnostic not found');
        return res.json();
      }
      if (session?.user?.id) {
        const res = await fetch(`/api/diagnostics/latest?userId=${session.user.id}`);
        if (!res.ok) throw new Error('No diagnostic found');
        return res.json();
      }
      throw new Error('No diagnostic available');
    },
    enabled: !!(diagnosticIdFromUrl || session?.user?.id),
    retry: false,
  });

  const { data: missions, isLoading: missionsLoading } = useQuery<SelectMission[]>({
    queryKey: ["/api/missions"],
  });

  const hasDiagnostic = !!diagnostic;

  const CRITICAL_THRESHOLD = 3.5;
  
  const criticalAreas = diagnostic ? 
    Object.entries({
      cargaMental: parseFloat(diagnostic.cargaMental || "5"),
      tempoDaCasa: parseFloat(diagnostic.tempoDaCasa || "5"),
      tempoDeQualidade: parseFloat(diagnostic.tempoDeQualidade || "5"),
      alimentacao: parseFloat(diagnostic.alimentacao || "5"),
      gestaoDaCasa: parseFloat(diagnostic.gestaoDaCasa || "5"),
      logisticaInfantil: parseFloat(diagnostic.logisticaInfantil || "5"),
    })
    .filter(([_, score]) => score < CRITICAL_THRESHOLD)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([area, score]) => ({ area, score }))
    : [];

  const getMissionsForArea = (areaKey: string) => {
    return missions?.filter(m => 
      m.diagnosticAreas?.includes(areaKey) && m.isPublished
    ) || [];
  };

  const filteredMissions = missions?.filter(mission => {
    if (!mission.isPublished) return false;
    const matchesCategory = selectedCategory === "all" || mission.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.understandingText?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  useEffect(() => {
    if (!hasDiagnostic && !diagnosticLoading) {
      setViewMode("all-categories");
      setShowDilemmaQuiz(true);
    }
  }, [hasDiagnostic, diagnosticLoading]);

  const handleDilemmaSelect = (category: string) => {
    setSelectedCategory(category);
    setViewMode("category");
    setShowDilemmaQuiz(false);
    setTimeout(() => {
      document.getElementById("missions-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedDiagnosticArea(null);
    setViewMode("category");
    setTimeout(() => {
      document.getElementById("missions-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDiagnosticAreaSelect = (areaKey: string) => {
    setSelectedDiagnosticArea(areaKey);
    setViewMode("diagnostic-area");
    setTimeout(() => {
      document.getElementById("missions-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBackToRecommendations = () => {
    setViewMode("recommendations");
    setSelectedCategory("all");
    setSelectedDiagnosticArea(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewAllCategories = () => {
    setViewMode("all-categories");
    setSelectedCategory("all");
    setSelectedDiagnosticArea(null);
  };

  const isLoading = missionsLoading || diagnosticLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 dark:from-orange-600/10 dark:via-pink-600/10 dark:to-purple-600/10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-orange-200 dark:border-orange-800 shadow-lg"
            >
              <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Círculo da Vida Leve
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                {hasDiagnostic ? `${diagnostic.userName || 'Olá'}, ` : 'Entre o caos e o carinho,'}
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                {hasDiagnostic ? 'suas missões te esperam.' : 'encontre sua leveza.'}
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              {hasDiagnostic 
                ? 'Com base no seu diagnóstico, selecionamos missões especiais para as áreas que mais precisam de leveza.'
                : 'Soluções práticas e afetivas para os desafios do dia a dia. Porque cuidar de tudo não é fácil, mas você não precisa fazer sozinha.'}
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-md mx-auto relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar missões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-12 rounded-full shadow-lg"
                data-testid="input-search-missions"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Breadcrumb */}
      {viewMode !== "recommendations" && hasDiagnostic && (
        <div className="container mx-auto px-4 py-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBackToRecommendations}
            className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
            data-testid="button-back-recommendations"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às Recomendações do Diagnóstico</span>
          </motion.button>
        </div>
      )}

      {/* View Mode: Recommendations (based on diagnostic) */}
      {viewMode === "recommendations" && hasDiagnostic && (
        <section className="container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {criticalAreas.length > 0 ? 'Para Você' : 'Parabéns! 🎉'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {criticalAreas.length > 0 
                      ? 'Missões selecionadas com base no seu diagnóstico'
                      : 'Todas as áreas da sua rotina estão equilibradas!'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleViewAllCategories}
                className="hidden sm:flex items-center gap-2"
                data-testid="button-view-all-categories"
              >
                Ver Todas as Categorias
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* All Good Message */}
            {criticalAreas.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 text-center mb-8 border border-green-200 dark:border-green-800"
              >
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Você está mandando muito bem!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Seu diagnóstico mostra que todas as áreas da sua vida estão em equilíbrio. 
                  Continue assim! Explore nossas missões para manter essa leveza.
                </p>
                <Button
                  onClick={handleViewAllCategories}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Explorar Todas as Missões
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Critical Areas Cards */}
            {criticalAreas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {criticalAreas.map(({ area, score }, index) => {
                const areaInfo = DIAGNOSTIC_AREA_LABELS[area];
                const areaMissions = getMissionsForArea(area);
                const urgencyLevel = score <= 2 ? "Prioridade Alta" : score <= 3 ? "Atenção" : "Melhoria";
                const urgencyColor = score <= 2 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                                     score <= 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : 
                                     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

                return (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-r ${areaInfo.color} p-3 rounded-xl text-2xl`}>
                        {areaInfo.icon}
                      </div>
                      <Badge className={urgencyColor}>
                        {urgencyLevel}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {areaInfo.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Score: {score.toFixed(1)}/5 • {areaMissions.length} missões disponíveis
                    </p>

                    {areaMissions.length > 0 ? (
                      <div className="space-y-2">
                        {areaMissions.slice(0, 2).map(mission => (
                          <Link key={mission.id} href={`/missoes/${mission.slug}`}>
                            <div className="group flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer">
                              <Star className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 line-clamp-1">
                                {mission.title}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        ))}
                        {areaMissions.length > 2 && (
                          <button
                            onClick={() => handleDiagnosticAreaSelect(area)}
                            className="w-full text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium py-2"
                          >
                            Ver mais {areaMissions.length - 2} missões →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-500 italic mb-2">
                          Estamos preparando missões para esta área!
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewAllCategories}
                          className="text-xs"
                        >
                          Ver outras missões
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            )}

            {/* Mobile: View All Categories Button */}
            <div className="sm:hidden text-center">
              <Button
                variant="outline"
                onClick={handleViewAllCategories}
                className="w-full"
                data-testid="button-view-all-categories-mobile"
              >
                Ver Todas as Categorias
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* All Recommended Missions Grid */}
          <div id="missions-grid">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Todas as Missões Recomendadas
            </h3>
            <MissionsGrid 
              missions={missions?.filter(m => 
                m.isPublished && 
                criticalAreas.some(ca => m.diagnosticAreas?.includes(ca.area))
              ) || []} 
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </div>
        </section>
      )}

      {/* View Mode: All Categories */}
      {viewMode === "all-categories" && (
        <section className="container mx-auto px-4 pb-8">
          {/* Dilema Quiz Section */}
          <AnimatePresence>
            {showDilemmaQuiz && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DilemmaQuiz onSelect={handleDilemmaSelect} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Dilema Quiz Button */}
          {!showDilemmaQuiz && (
            <div className="text-center py-4">
              <button
                onClick={() => setShowDilemmaQuiz(true)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline"
              >
                Mostrar "O que está pedindo leveza hoje?"
              </button>
            </div>
          )}

          {/* Categories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Explorar por Categoria
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {CATEGORIES.filter(c => c.value !== "all").map((category, index) => (
                <motion.button
                  key={category.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCategorySelect(category.value)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all text-center"
                  data-testid={`button-category-${category.value}`}
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {category.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* All Missions Grid */}
          <div id="missions-grid">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Todas as Missões
            </h3>
            <MissionsGrid 
              missions={missions?.filter(m => m.isPublished) || []} 
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </div>

          {/* CTA: Do Diagnostic */}
          {!hasDiagnostic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              <div className="relative">
                <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Quer missões personalizadas?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Faça nosso diagnóstico rápido e descubra quais áreas da sua vida precisam de mais leveza. 
                  Em menos de 3 minutos, você terá recomendações sob medida!
                </p>
                <Link href="/diagnostico">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    data-testid="button-do-diagnostic"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Fazer Diagnóstico
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </section>
      )}

      {/* View Mode: Diagnostic Area */}
      {viewMode === "diagnostic-area" && selectedDiagnosticArea && (
        <section className="container mx-auto px-4 pb-8">
          {(() => {
            const areaInfo = DIAGNOSTIC_AREA_LABELS[selectedDiagnosticArea];
            const areaMissions = getMissionsForArea(selectedDiagnosticArea);
            const areaScore = diagnostic ? parseFloat((diagnostic as any)[selectedDiagnosticArea] || "5") : null;
            
            return (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`bg-gradient-to-r ${areaInfo?.color || 'from-gray-500 to-gray-600'} p-3 rounded-xl text-2xl`}>
                      {areaInfo?.icon || "📋"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {areaInfo?.label || selectedDiagnosticArea}
                      </h2>
                      {areaScore !== null && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Seu score: {areaScore.toFixed(1)}/5 • {areaMissions.length} missões disponíveis
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                <div id="missions-grid">
                  <MissionsGrid 
                    missions={areaMissions} 
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                  />
                </div>

                {/* Other Diagnostic Areas */}
                {criticalAreas.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Outras Áreas do Diagnóstico
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {criticalAreas
                        .filter(ca => ca.area !== selectedDiagnosticArea)
                        .map(({ area, score }) => {
                          const info = DIAGNOSTIC_AREA_LABELS[area];
                          return (
                            <button
                              key={area}
                              onClick={() => handleDiagnosticAreaSelect(area)}
                              className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${info.color} bg-opacity-10 rounded-full border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all`}
                            >
                              <span>{info.icon}</span>
                              <span>{info.label}</span>
                              <span className="text-xs text-gray-500">({score.toFixed(1)})</span>
                            </button>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </>
            );
          })()}
        </section>
      )}

      {/* View Mode: Single Category */}
      {viewMode === "category" && (
        <section className="container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">
                {CATEGORIES.find(c => c.value === selectedCategory)?.icon || "✨"}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredMissions.length} missões nesta categoria
            </p>
          </motion.div>

          <div id="missions-grid">
            <MissionsGrid 
              missions={filteredMissions} 
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </div>

          {/* Other Categories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Outras Categorias
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c.value !== "all" && c.value !== selectedCategory).map(category => (
                <button
                  key={category.value}
                  onClick={() => handleCategorySelect(category.value)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 dark:from-orange-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative">
            <Leaf className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Você faz parte do Círculo da Leveza
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Cada missão é um passo para uma vida mais leve. Compartilhe com outras mães que também merecem respirar.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function MissionsGrid({ 
  missions, 
  isLoading, 
  searchQuery 
}: { 
  missions: SelectMission[]; 
  isLoading: boolean;
  searchQuery: string;
}) {
  const filtered = missions.filter(mission => {
    if (!searchQuery) return true;
    return mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           mission.understandingText?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Leaf className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Nenhuma missão encontrada
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mb-4">
          Tente ajustar os filtros ou buscar por outro termo
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {filtered.map((mission, index) => (
        <motion.div
          key={mission.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link href={`/missoes/${mission.slug}`}>
            <div className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700">
              {/* Hero Image */}
              {mission.heroImageUrl && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={mission.heroImageUrl}
                    alt={mission.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {mission.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white border-0">
                      {mission.category}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {!mission.heroImageUrl && (
                  <Badge className="mb-3" variant="secondary">
                    {mission.category}
                  </Badge>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                  {mission.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {mission.understandingText}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {mission.views || 0} mães já viram
                  </span>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                    <span>Começar leve</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
