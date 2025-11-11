import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { MISSION_TASKS } from "@/data/missionMockData";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskProgressProps {
  slug: string;
}

export function TaskProgress({ slug }: TaskProgressProps) {
  const tasks = MISSION_TASKS[slug] || [];
  const { completedTaskIds, toggleTask, progress, completedCount } = useMissionProgress(slug, tasks.length);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Checklist da Missão
          </h2>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {completedCount} de {tasks.length} completas
          </span>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-3 bg-green-100 dark:bg-green-900/30" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {progress === 100 ? "🎉 Missão completa! Você é incrível!" : "Continue assim, você está no caminho certo!"}
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const isCompleted = completedTaskIds.includes(task.id);
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div
                onClick={() => toggleTask(task.id)}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                    : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700"
                }`}
                data-testid={`task-${task.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      isCompleted 
                        ? "text-gray-500 dark:text-gray-400 line-through" 
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {task.title}
                    </h3>
                    <p className={`text-sm ${
                      isCompleted 
                        ? "text-gray-400 dark:text-gray-500" 
                        : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {task.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
