import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface MissionHeroProps {
  title: string;
  description?: string | null;
  understandingText?: string | null;
  heroImageUrl?: string | null;
  category?: string;
  onAudioToggle?: () => void;
  isAudioPlaying?: boolean;
}

export function MissionHero({ 
  title, 
  description, 
  understandingText,
  heroImageUrl, 
  category,
  onAudioToggle,
  isAudioPlaying = false
}: MissionHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-100 via-emerald-100 to-green-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-900/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/missoes">
            <a className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar para Missões</span>
            </a>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {category && (
              <div className="inline-block mb-4 px-4 py-2 bg-green-500/20 dark:bg-green-500/30 rounded-full">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {category}
                </span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            
            {(description || understandingText) && (
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {description || understandingText}
              </p>
            )}

            {/* Audio Button */}
            {onAudioToggle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={onAudioToggle}
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 hover:border-green-400 dark:hover:border-green-500 transition-all shadow-lg"
                  data-testid="button-audio-toggle"
                >
                  {isAudioPlaying ? (
                    <>
                      <VolumeX className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">Parar Narração</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">Ouvir Missão</span>
                    </>
                  )}
                </Button>
              </motion.div>
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
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImageUrl}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
