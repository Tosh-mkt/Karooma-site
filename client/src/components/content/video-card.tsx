import { motion } from "framer-motion";
import { Play, Eye, Calendar } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { Content } from "@shared/schema";

interface VideoCardProps {
  video: Content;
  index?: number;
}

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}k`;
    return views.toString();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.ceil(diffDays / 7)} semana${diffDays >= 14 ? 's' : ''}`;
    return `há ${Math.ceil(diffDays / 30)} mês${diffDays >= 60 ? 'es' : ''}`;
  };

  return (
    <AnimatedCard delay={index * 0.1} className="group overflow-hidden">
      <div className="relative">
        <img
          src={video.heroImageUrl || video.imageUrl || "https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"}
          alt={video.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            console.error("Erro ao carregar imagem do video card:", video.id);
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450";
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          whileHover={{ opacity: 1 }}
        >
          <motion.button 
            className="bg-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play className="w-6 h-6 ml-1" />
          </motion.button>
        </motion.div>
        <span className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          10:45
        </span>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
            {video.category || "Video"}
          </Badge>
        </div>
        
        <h3 className="font-poppins font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        <p className="text-gray-600 font-inter text-sm mb-4 line-clamp-3">
          {video.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-pink-500 font-semibold">
            <Eye className="w-4 h-4" />
            {formatViews(video.views || 0)} visualizações
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            {video.createdAt ? formatDate(new Date(video.createdAt)) : "Recente"}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
