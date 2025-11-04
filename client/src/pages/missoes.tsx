import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Target, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { SelectMission } from "@shared/schema";

const CATEGORIES = [
  { value: "all", label: "Todas", icon: "✨" },
  { value: "Organização", label: "Organização", icon: "📦" },
  { value: "Alimentação", label: "Alimentação", icon: "🍳" },
  { value: "Educação", label: "Educação", icon: "📚" },
  { value: "Bem-estar", label: "Bem-estar", icon: "💆" },
  { value: "Desenvolvimento", label: "Desenvolvimento", icon: "🌱" },
];

export default function Missoes() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 dark:from-orange-600/10 dark:via-pink-600/10 dark:to-purple-600/10" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-orange-200 dark:border-orange-800">
              <Target className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Missões Resolvidas
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Cuidar de tudo não é fácil.
              <br />
              Aqui, ajudamos você a cuidar sem se perder.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Soluções práticas para os desafios do dia a dia. Cada missão traz produtos cuidadosamente selecionados e dicas que realmente funcionam.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <Input
                placeholder="Buscar missões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                data-testid="input-search-missions"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.value
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-105"
              }`}
              data-testid={`button-category-${category.value}`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* Missions Grid */}
      <section className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Nenhuma missão encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Tente ajustar os filtros ou buscar por outro termo
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/missoes/${mission.slug}`}>
                  <div className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    {/* Hero Image */}
                    {mission.heroImageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={mission.heroImageUrl}
                          alt={mission.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {mission.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-yellow-500 text-white border-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Destaque
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <Badge className="mb-3" variant="secondary">
                        {mission.category}
                      </Badge>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {mission.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                        {mission.understandingText}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{mission.views || 0} visualizações</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
