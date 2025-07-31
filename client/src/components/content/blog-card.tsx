import { motion } from "framer-motion";
import { User, Calendar, ArrowRight } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/gradient-button";
import { Content } from "@shared/schema";

interface BlogCardProps {
  article: Content;
  featured?: boolean;
  index?: number;
}

export function BlogCard({ article, featured = false, index = 0 }: BlogCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.ceil(diffDays / 7)} semana${diffDays >= 14 ? 's' : ''}`;
    return `há ${Math.ceil(diffDays / 30)} mês${diffDays >= 60 ? 'es' : ''}`;
  };

  if (featured) {
    return (
      <AnimatedCard delay={index * 0.1} className="overflow-hidden">
        <img
          src={article.imageUrl || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"}
          alt={article.title}
          className="w-full h-64 lg:h-80 object-cover"
        />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {article.category || "Artigo"}
            </Badge>
            <span className="text-gray-500 text-sm">15 min de leitura</span>
          </div>
          
          <h3 className="font-poppins font-bold text-3xl text-gray-800 mb-4">
            {article.title}
          </h3>
          
          <p className="text-gray-600 font-inter text-lg leading-relaxed mb-6 line-clamp-3">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="font-poppins font-semibold text-gray-800">Autor</p>
                <p className="text-gray-500 text-sm">
                  {article.createdAt ? formatDate(new Date(article.createdAt)) : "Recente"}
                </p>
              </div>
            </div>
            
            <GradientButton variant="glass" size="sm">
              Ler mais <ArrowRight className="ml-1 w-4 h-4" />
            </GradientButton>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard delay={index * 0.1} className="p-6">
      <img
        src={article.imageUrl || "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"}
        alt={article.title}
        className="w-full h-32 object-cover rounded-xl mb-4"
      />
      
      <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white mb-3">
        {article.category || "Artigo"}
      </Badge>
      
      <h4 className="font-poppins font-bold text-lg text-gray-800 mb-2 line-clamp-2">
        {article.title}
      </h4>
      
      <p className="text-gray-600 font-inter text-sm mb-3 line-clamp-3">
        {article.description}
      </p>
      
      <span className="text-gray-500 text-xs">
        {article.createdAt ? formatDate(new Date(article.createdAt)) : "Recente"}
      </span>
    </AnimatedCard>
  );
}
