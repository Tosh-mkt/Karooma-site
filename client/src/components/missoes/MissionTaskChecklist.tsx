import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface MissionTaskChecklistProps {
  missionId: string;
  tasks: string[];
}

export function MissionTaskChecklist({ missionId, tasks }: MissionTaskChecklistProps) {
  const STORAGE_KEY = `mission-checklist-${missionId}`;
  
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return new Set(data);
      }
    } catch (error) {
      console.error("Erro ao carregar checklist:", error);
    }
    return new Set();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedTasks)));
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
    }
  }, [completedTasks, STORAGE_KEY]);

  const toggleTask = (index: number) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const progress = tasks.length > 0 ? (completedTasks.size / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6" data-section="checklist">
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const isCompleted = completedTasks.has(index);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                isCompleted
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <Checkbox
                id={`task-${index}`}
                checked={isCompleted}
                onCheckedChange={() => toggleTask(index)}
                className="mt-1 h-5 w-5"
                data-testid={`checkbox-task-${index}`}
              />
              <label
                htmlFor={`task-${index}`}
                className={`flex-1 cursor-pointer text-base ${
                  isCompleted
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                data-testid={`label-task-${index}`}
              >
                {task}
              </label>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-2" data-section="progress">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Progresso
          </span>
          <span className="font-bold text-purple-600 dark:text-purple-400">
            {completedTasks.size} de {tasks.length} tarefas concluídas
          </span>
        </div>
        <Progress value={progress} className="h-3" data-testid="progress-bar" />
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Missão completa! 🎉</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
