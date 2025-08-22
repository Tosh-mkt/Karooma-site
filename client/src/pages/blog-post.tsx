import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Clock, User, Share2, Heart, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Content } from "@shared/schema";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:id");
  const postId = params?.id;

  const { data: post, isLoading } = useQuery<Content>({
    queryKey: [`/api/content/${postId}`],
    enabled: !!postId,
  });

  const { data: relatedPosts } = useQuery<Content[]>({
    queryKey: ["/api/content/blog"],
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full max-w-2xl mx-auto rounded-lg shadow-md my-6" />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4 font-poppins">$1</h2>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-xl font-semibold text-gray-700 mt-6 mb-3 font-poppins">$1</h3>')
      .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
      .replace(/^(.+)/, '<p class="text-gray-600 leading-relaxed mb-4">$1')
      .replace(/(.+)$/, '$1</p>');
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Post não encontrado</h1>
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPostsFiltered = relatedPosts?.filter(p => p.id !== post.id).slice(0, 3) || [];

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header com navegação */}
      <div className="sticky top-20 bg-white/80 backdrop-blur-md border-b border-white/20 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Categoria e Meta Info */}
          <div className="flex items-center gap-4 mb-6">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
              {post.category || "Artigo"}
            </Badge>
            <div className="flex items-center text-gray-500 text-sm gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>15 min de leitura</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views || 0} visualizações</span>
              </div>
            </div>
          </div>

          {/* Título */}
          <h1 className="font-fredoka text-4xl lg:text-5xl gradient-text mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Descrição */}
          <p className="text-xl text-gray-600 font-inter leading-relaxed mb-8">
            {post.description}
          </p>

          {/* Autor e Data */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="font-poppins font-semibold text-gray-800">Equipe Karooma</p>
                <p className="text-gray-500 text-sm">
                  {post.createdAt ? formatDate(new Date(post.createdAt)) : "Recente"}
                </p>
              </div>
            </div>

            {/* Ações Sociais */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-white/50">
                <Heart className="w-4 h-4 mr-2" />
                Curtir
              </Button>
              <Button variant="outline" size="sm" className="bg-white/50">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Imagem Hero (prioridade) ou Imagem Principal (fallback) */}
        {(post.heroImageUrl || post.imageUrl) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <img
              src={post.heroImageUrl || post.imageUrl || ""}
              alt={post.title}
              className="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-2xl"
              onError={(e) => {
                console.error("Erro ao carregar imagem hero:", e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>
        )}

        {/* Conteúdo Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <div 
            className="font-inter text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(post.content || "") 
            }}
          />
        </motion.div>

        {/* Imagem Footer */}
        {post.footerImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <img
              src={post.footerImageUrl || ""}
              alt="Imagem de fechamento do post"
              className="w-full h-64 lg:h-80 object-cover rounded-2xl shadow-2xl"
              onError={(e) => {
                console.error("Erro ao carregar imagem footer:", e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="glassmorphism border-0 mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="font-poppins font-bold text-2xl text-gray-800 mb-4">
                Gostou do conteúdo?
              </h3>
              <p className="text-gray-600 mb-6">
                Compartilhe suas experiências nos comentários e ajude outras mães a encontrarem suas soluções!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Deixar Comentário
                </Button>
                <Button variant="outline" className="bg-white/50">
                  <Heart className="w-4 h-4 mr-2" />
                  Salvar Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Posts Relacionados */}
        {relatedPostsFiltered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className="font-poppins font-bold text-2xl text-gray-800 mb-8">
              Continue Lendo
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPostsFiltered.map((relatedPost, index) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                  <Card className="glassmorphism border-0 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-0">
                      <img
                        src={relatedPost.heroImageUrl || relatedPost.imageUrl || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover rounded-t-xl"
                        onError={(e) => {
                          console.error("Erro ao carregar imagem do post relacionado:", relatedPost.id);
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200";
                        }}
                      />
                      <div className="p-4">
                        <Badge className="bg-blue-100 text-blue-700 text-xs mb-2">
                          {relatedPost.category}
                        </Badge>
                        <h4 className="font-poppins font-semibold text-gray-800 mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedPost.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </article>
    </div>
  );
}