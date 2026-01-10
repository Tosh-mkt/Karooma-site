import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, FileText, BookHeart, Clock, ArrowRight, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { useQuery } from "@tanstack/react-query";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface UnifiedArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryEmoji?: string;
  type: "artigo" | "guia";
  heroImageUrl?: string;
  readingTime?: number;
  views: number;
  createdAt: string;
}

const CATEGORIES = [
  { value: "all", label: "Todos", emoji: "📚" },
  { value: "Rotina Matinal", label: "Rotina", emoji: "🌅" },
  { value: "Casa em Ordem", label: "Casa", emoji: "🏠" },
  { value: "Cozinha Inteligente", label: "Cozinha", emoji: "🍳" },
  { value: "Educação e Brincadeiras", label: "Educação", emoji: "🎨" },
  { value: "Tempo para Mim", label: "Bem-estar", emoji: "✨" },
  { value: "Passeios e Saídas", label: "Passeios", emoji: "🚗" },
  { value: "Saúde e Emergências", label: "Saúde", emoji: "💊" },
];

const TYPES = [
  { value: "all", label: "Todos", icon: FileText },
  { value: "artigo", label: "Artigos", icon: FileText },
  { value: "guia", label: "Guias", icon: BookHeart },
];

function ArticleCard({ article }: { article: UnifiedArticle }) {
  const category = CATEGORIES.find(c => c.value === article.category);
  const linkPath = article.type === "guia" ? `/blog-guia/${article.slug}` : `/blog/${article.id}`;
  
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link href={linkPath}>
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer h-full flex flex-col">
          {article.heroImageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <LazyImage
                src={article.heroImageUrl} 
                alt={article.title}
                aspectRatio="video"
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant={article.type === "guia" ? "default" : "secondary"}
                className={article.type === "guia" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}
              >
                {article.type === "guia" ? <BookHeart className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                {article.type === "guia" ? "Guia" : "Artigo"}
              </Badge>
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category.emoji} {category.label}
                </Badge>
              )}
            </div>
            
            <h3 className="font-fredoka text-lg text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            {article.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                {article.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
              <div className="flex items-center gap-3">
                {article.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readingTime} min
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-pink-600 group-hover:translate-x-1 transition-transform">
                Ler <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Artigos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const { data: articlesData, isLoading } = useQuery<{ success: boolean; articles: UnifiedArticle[] }>({
    queryKey: ["/api/artigos"],
  });

  const articles = articlesData?.articles || [];
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesType = selectedType === "all" || article.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const hasActiveFilters = selectedCategory !== "all" || selectedType !== "all" || searchTerm.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-fredoka text-4xl md:text-5xl text-gray-900 mb-4">
            Artigos & Guias
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conteúdo prático e empático para simplificar sua rotina de mãe
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar artigos e guias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {TYPES.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className={selectedType === type.value ? "bg-pink-600 hover:bg-pink-700" : ""}
              >
                <type.icon className="w-4 h-4 mr-1" />
                {type.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === cat.value 
                    ? "bg-purple-600 text-white" 
                    : "hover:bg-purple-50"
                }`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.emoji} {cat.label}
              </Badge>
            ))}
          </div>

          {hasActiveFilters && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                }}
                className="text-gray-500"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar filtros
              </Button>
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              Nenhum conteúdo encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termos de busca
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12 text-gray-500"
        >
          {filteredArticles.length > 0 && (
            <p>{filteredArticles.length} {filteredArticles.length === 1 ? "resultado" : "resultados"}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
