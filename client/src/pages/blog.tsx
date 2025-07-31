import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { BlogCard } from "@/components/content/blog-card";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/blog"],
  });

  const categories = [
    { id: "all", label: "Todos" },
    { id: "tendencias", label: "Tendências" },
    { id: "produtividade", label: "Produtividade" },
    { id: "analytics", label: "Analytics" },
    { id: "estrategia", label: "Estratégia" },
  ];

  const filteredArticles = articles?.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }) || [];

  const featuredArticle = filteredArticles.find(article => article.featured) || filteredArticles[0];
  const sidebarArticles = filteredArticles.filter(article => article.id !== featuredArticle?.id).slice(0, 3);

  return (
    <div className="pt-20">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-fredoka text-5xl gradient-text mb-4">
              Blog & Artigos
            </h1>
            <p className="font-poppins text-xl text-gray-600">
              Insights e tendências do mundo digital
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
                placeholder="Buscar artigos..."
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

          {/* Articles Layout */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 animate-pulse">
                <div className="bg-gray-200 rounded-3xl h-96"></div>
              </div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-48"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Article */}
              {featuredArticle && (
                <div className="lg:col-span-2">
                  <BlogCard article={featuredArticle} featured={true} />
                </div>
              )}

              {/* Sidebar Articles */}
              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {sidebarArticles.map((article, index) => (
                  <motion.div key={article.id} variants={staggerItem}>
                    <BlogCard article={article} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termo de busca
              </p>
            </motion.div>
          )}

          {/* All Articles Grid */}
          {filteredArticles.length > 4 && (
            <motion.div 
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-poppins text-3xl text-center mb-8 gradient-text">
                Mais Artigos
              </h3>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {filteredArticles.slice(4).map((article, index) => (
                  <motion.div key={article.id} variants={staggerItem}>
                    <BlogCard article={article} index={index + 4} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
