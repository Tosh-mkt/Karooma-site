import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

interface Props {
  currentStep: number;
  totalSteps: number;
  onComplete?: () => void;
}

export function EmotionalProgress({ currentStep, totalSteps, onComplete }: Props) {
  const progress = (currentStep / totalSteps) * 100;
  const isComplete = currentStep === totalSteps;

  return (
    <div className="sticky top-20 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Sua jornada de leveza
            </span>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {currentStep} de {totalSteps}
            </span>
          </div>
          
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">+ leveza conquistada hoje 🌿</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
