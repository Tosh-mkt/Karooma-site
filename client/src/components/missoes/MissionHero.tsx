import { motion } from "framer-motion";
import { ArrowLeft, ZoomIn } from "lucide-react";
import { Link } from "wouter";
import MissionFavoriteButton from "./MissionFavoriteButton";
import { useState } from "react";
import { ImageZoomModal } from "./ImageZoomModal";

interface MissionHeroProps {
  title: string;
  description?: string | null;
  understandingText?: string | null;
  heroImageUrl?: string | null;
  category?: string;
  missionId?: string;
}

export function MissionHero({ 
  title, 
  description, 
  understandingText,
  heroImageUrl, 
  category,
  missionId
}: MissionHeroProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
    <div className="relative overflow-hidden bg-[#F5F3EE] dark:bg-gray-800">
      {/* Background Pattern - subtle cream tones */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200 dark:bg-gray-700 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 dark:bg-gray-700 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/missoes" className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar para Missões</span>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Category Badge + Favorite Button (aligned) */}
            <div className="flex items-center justify-between mb-4">
              {category && (
                <div className="inline-block px-4 py-2 bg-green-500/20 dark:bg-green-500/30 rounded-full">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {category}
                  </span>
                </div>
              )}
              {missionId && (
                <MissionFavoriteButton 
                  missionId={missionId} 
                  showText 
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg" 
                />
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            
            {(description || understandingText) && (
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {description || understandingText}
              </p>
            )}

          </motion.div>

          {/* Hero Image */}
          {heroImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div 
                className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                onClick={() => setIsImageOpen(true)}
              >
                <img
                  src={heroImageUrl}
                  alt={title}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ZoomIn className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>

    {/* Modal de Zoom com suporte a pinch-to-zoom */}
    {heroImageUrl && (
      <ImageZoomModal
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        imageUrl={heroImageUrl}
        alt={title}
      />
    )}
    </>
  );
}
