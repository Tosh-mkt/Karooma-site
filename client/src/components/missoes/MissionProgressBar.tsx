import { CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MissionProgressBarProps {
  completedTasks: number;
  totalTasks: number;
}

export function MissionProgressBar({ completedTasks, totalTasks }: MissionProgressBarProps) {
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
            Seu progresso
          </span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {completedTasks} de {totalTasks}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 bg-gray-200 dark:bg-gray-700"
      />
    </div>
  );
}
