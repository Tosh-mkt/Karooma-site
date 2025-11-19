import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sparkles, ArrowRight, Leaf, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DilemmaQuiz } from "@/components/missoes/DilemmaQuiz";
import type { SelectMission } from "@shared/schema";

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

export default function Missoes() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDilemmaQuiz, setShowDilemmaQuiz] = useState(true);

  const { data: missions, isLoading } = useQuery<SelectMission[]>({
    queryKey: ["/api/missions"],
  });

  const filteredMissions = missions?.filter(mission => {
    const matchesCategory = selectedCategory === "all" || mission.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.understandingText?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const handleDilemmaSelect = (category: string) => {
    setSelectedCategory(category);
    setShowDilemmaQuiz(false);
    // Smooth scroll to missions grid
    setTimeout(() => {
      document.getElementById("missions-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

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
                Entre o caos e o carinho,
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                encontre sua leveza.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Soluções práticas e afetivas para os desafios do dia a dia. 
              Porque cuidar de tudo não é fácil, mas você não precisa fazer sozinha.
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
        <div className="container mx-auto px-4 py-4 text-center">
          <button
            onClick={() => setShowDilemmaQuiz(true)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline"
          >
            Mostrar "O que está pedindo leveza hoje?"
          </button>
        </div>
      )}

      {/* Missions Grid */}
      <section id="missions-grid" className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredMissions.length === 0 ? (
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
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setShowDilemmaQuiz(true);
              }}
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              Ver todas as missões
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredMissions.map((mission, index) => (
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
        )}
      </section>

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
