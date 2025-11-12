import { CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MissionProgressBarProps {
  completedTasks: number;
  totalTasks: number;
}

export function MissionProgressBar({ completedTasks, totalTasks }: MissionProgressBarProps) {
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Seu progresso
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {completedTasks} de {totalTasks} concluídas
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-3 bg-gray-200 dark:bg-gray-700"
      />
      
      {completedTasks === totalTasks && totalTasks > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400 text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Missão concluída! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
