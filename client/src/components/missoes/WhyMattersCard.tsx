import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface WhyMattersCardProps {
  text?: string | null;
}

export function WhyMattersCard({ text }: WhyMattersCardProps) {
  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-rose-900/20 p-8 border border-rose-200 dark:border-rose-800"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-300/20 dark:bg-rose-600/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-rose-500/20 dark:bg-rose-500/30">
            <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dica Bônus
          </h2>
        </div>
        
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          {text}
        </p>
      </div>
    </motion.div>
  );
}
