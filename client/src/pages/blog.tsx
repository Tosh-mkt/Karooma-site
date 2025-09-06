import { useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { BlogCard } from "@/components/content/blog-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: articles, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/blog"],
  });


  // Mapeamento das tags para categorias reais dos posts
  const tagGroups = [
    {
      title: "Produtividade Doméstica",
      tags: [
        { label: "Organização e Limpeza", category: "organizacao" },
        { label: "Organização", category: "Organização" },
        { label: "Organização Familiar", category: "Organização Familiar" },
        { label: "Produtividade", category: "Produtividade" }
      ]
    },
    {
      title: "Bem-Estar Familiar",
      tags: [
        { label: "Saúde e Alimentação", category: "saude-seguranca" },
        { label: "Alimentação", category: "Alimentação" },
        { label: "Sono e Relaxamento", category: "sono-relaxamento" },
        { label: "Bem-estar", category: "Bem-estar" },
        { label: "Maternidade", category: "Maternidade" }
      ]
    },
    {
      title: "Educação e Desenvolvimento",
      tags: [
        { label: "Educação Parental", category: "aprender-brincar" },
        { label: "Lazer e Conexão", category: "aprender-brincar" }
      ]
    },
    {
      title: "Casa e Decoração",
      tags: [
        { label: "Decorar e Brilhar", category: "decorar-brilhar" }
      ]
    },
    {
      title: "Viagem e Segurança",
      tags: [
        { label: "Sair e Viajar", category: "sair-viajar" },
        { label: "Segurança", category: "saude-seguranca" }
      ]
    }
  ];

  const toggleTag = (tagObj: { label: string; category: string }) => {
    setSelectedTags(prev => 
      prev.includes(tagObj.category) 
        ? prev.filter(t => t !== tagObj.category)
        : [...prev, tagObj.category]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || selectedTags.includes(article.category || '');
    
    return matchesSearch && matchesTags;
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
            <p className="font-poppins text-xl text-gray-600">Conversas e soluções para problemas do dia a dia</p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="mb-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar with Filter Button */}
            <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
              
              {/* Filter Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`rounded-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 hover:bg-white/90 transition-all duration-300 ${
                      selectedTags.length > 0 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0" : ""
                    }`}
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filtros
                    {selectedTags.length > 0 && (
                      <Badge className="ml-2 bg-white text-purple-600 min-w-[20px] h-5 flex items-center justify-center">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-6 bg-white/95 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-poppins font-semibold text-lg text-gray-800">
                        Filtros de Conteúdo
                      </h3>
                      {selectedTags.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearAllTags}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Limpar
                        </Button>
                      )}
                    </div>
                    
                    {tagGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="space-y-2">
                        <h4 className="font-poppins font-medium text-purple-700 text-sm">
                          {group.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {group.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant={selectedTags.includes(tag.category) ? "default" : "outline"}
                              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                                selectedTags.includes(tag.category)
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                  : "bg-white/50 hover:bg-white/80 text-gray-700"
                              }`}
                              onClick={() => toggleTag(tag)}
                            >
                              {tag.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <motion.div 
                className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {selectedTags.map((categoryTag, index) => {
                  // Encontrar o label da tag baseado na categoria
                  const tagObj = tagGroups.flatMap(g => g.tags).find(t => t.category === categoryTag);
                  return (
                    <Badge
                      key={index}
                      variant="default"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white pr-1 cursor-pointer hover:scale-105 transition-all duration-200"
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== categoryTag))}
                    >
                      {tagObj?.label || categoryTag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  );
                })}
              </motion.div>
            )}

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
