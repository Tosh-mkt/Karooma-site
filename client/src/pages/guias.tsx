import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, BookHeart, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { SelectGuidePost } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";

const CATEGORIES = [
  { value: "Rotina Matinal", emoji: "🌅", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "Casa em Ordem", emoji: "🏠", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "Cozinha Inteligente", emoji: "🍳", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Educação e Brincadeiras", emoji: "🎨", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "Tempo para Mim", emoji: "✨", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "Presentes e Afetos", emoji: "🎁", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "Passeios e Saídas", emoji: "🚗", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "Saúde e Emergências", emoji: "💊", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "Manutenção e Melhorias do Lar", emoji: "🔧", color: "bg-slate-100 text-slate-800 border-slate-200" },
];

function GuideCard({ post }: { post: SelectGuidePost }) {
  const category = CATEGORIES.find(c => c.value === post.category);
  
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link href={`/blog-guia/${post.slug}`}>
        <div 
          className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer h-full flex flex-col"
          data-testid={`card-guide-${post.slug}`}
        >
          {/* Imagem de Capa 16:9 */}
          {post.heroImageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={post.heroImageUrl} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Badge className={`${category?.color || 'bg-gray-100 text-gray-800'} font-medium`}>
                {category?.emoji} {post.category}
              </Badge>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {post.readingTime} min
              </div>
            </div>
            
            <h3 className="font-fredoka text-xl text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            {post.metaDescription && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                {post.metaDescription}
              </p>
            )}
            
            {!post.heroImageUrl && post.quote && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 italic line-clamp-2">
                  "{post.quote}"
                </p>
              </div>
            )}
            
            <div className="flex items-center text-pink-600 font-medium text-sm mt-auto">
              Ler guia completo
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Guias() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery<SelectGuidePost[]>({
    queryKey: ["/api/guide-posts"],
  });

  const publishedPosts = posts?.filter(p => p.isPublished) || [];

  const filteredPosts = publishedPosts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.metaDescription && post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-white">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookHeart className="w-10 h-10 text-pink-500" />
              <h1 className="font-fredoka text-5xl gradient-text">
                Guias Práticos
              </h1>
            </div>
            <p className="font-poppins text-xl text-gray-600 max-w-2xl mx-auto">
              Conteúdos que entendem sua rotina e oferecem soluções reais para o seu dia a dia
            </p>
          </motion.div>

          <motion.div 
            className="mb-10 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative max-w-lg mx-auto">
              <Input
                type="text"
                placeholder="Buscar guias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30"
                data-testid="input-search-guides"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>

            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                data-testid="button-filter-all"
              >
                Todos
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all text-left ${
                    selectedCategory === cat.value 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  data-testid={`button-filter-${cat.value.toLowerCase()}`}
                >
                  {cat.emoji} {cat.value}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-full mb-3" />
                  <div className="h-20 bg-gray-200 rounded w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-fredoka text-2xl text-gray-400 mb-2">
                Nenhum guia encontrado
              </h3>
              <p className="text-gray-500">
                {searchQuery || selectedCategory 
                  ? "Tente ajustar sua busca ou filtro" 
                  : "Novos guias serão publicados em breve!"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {featuredPosts.length > 0 && (
                <div>
                  <h2 className="font-fredoka text-2xl text-gray-800 mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
                    Destaques
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPosts.map(post => (
                      <GuideCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {regularPosts.length > 0 && (
                <div>
                  {featuredPosts.length > 0 && (
                    <h2 className="font-fredoka text-2xl text-gray-800 mb-6">
                      Todos os Guias
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map(post => (
                      <GuideCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
