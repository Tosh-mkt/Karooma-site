import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { VideoCard } from "@/components/content/video-card";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: videos, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/videos"],
  });

  const categories = [
    { id: "all", label: "Todos" },
    { id: "casa", label: "Casa & Organização" },
    { id: "autocuidado", label: "Autocuidado" },
    { id: "familia", label: "Família" },
    { id: "reflexoes", label: "Reflexões" },
    { id: "produtos", label: "Produtos" },
  ];

  const filteredVideos = videos?.filter(video => {
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-fredoka text-5xl gradient-text mb-4">
              Te Entendo
            </h1>
            <p className="font-poppins text-xl text-gray-600">
              Momentos reais do dia a dia, conversas verdadeiras e a vida como ela é
            </p>
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
                placeholder="Que momento você quer ver?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <GradientButton
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "glass"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                >
                  {category.label}
                </GradientButton>
              ))}
            </div>
          </motion.div>

          {/* Videos Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-3xl h-64"></div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredVideos.map((video, index) => (
                <motion.div key={video.id} variants={staggerItem}>
                  <VideoCard video={video} index={index} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                Nenhum vídeo encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termo de busca
              </p>
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredVideos.length > 9 && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <GradientButton variant="glass" size="lg">
                Carregar Mais Vídeos
                <Filter className="ml-2 w-5 h-5" />
              </GradientButton>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
