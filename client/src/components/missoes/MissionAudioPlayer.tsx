import { Music } from "lucide-react";
import { motion } from "framer-motion";

interface MissionAudioPlayerProps {
  audioUrl: string;
  title?: string;
}

export function MissionAudioPlayer({ audioUrl, title }: MissionAudioPlayerProps) {
  const resolvedUrl = audioUrl.startsWith('/') 
    ? new URL(audioUrl, window.location.origin).toString()
    : audioUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 dark:bg-green-500/30 rounded-lg">
            <Music className="w-5 h-5 text-green-700 dark:text-green-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Resumo em Áudio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ouça esta missão enquanto faz outras coisas
            </p>
          </div>
        </div>
        
        <audio 
          controls 
          className="w-full"
          data-testid="audio-player"
          preload="metadata"
          src={resolvedUrl}
        >
          Seu navegador não suporta reprodução de áudio.
        </audio>
      </div>
    </motion.div>
  );
}
