import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

interface Task {
  task: string;
  subtext: string;
}

interface MissionTaskChecklistProps {
  missionId: string;
  tasks: Task[];
  onProgressChange?: (completed: number, total: number) => void;
}

export function MissionTaskChecklist({ missionId, tasks, onProgressChange }: MissionTaskChecklistProps) {
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
      if (onProgressChange) {
        onProgressChange(completedTasks.size, tasks.length);
      }
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
    }
  }, [completedTasks, STORAGE_KEY, tasks.length, onProgressChange]);

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

  return (
    <div className="space-y-4" data-section="checklist">
      {tasks.map((taskItem, index) => {
        const isCompleted = completedTasks.has(index);
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all ${
              isCompleted
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-amber-50/30 dark:bg-amber-900/10 hover:border-purple-300'
            }`}
          >
            <Checkbox
              id={`task-${index}`}
              checked={isCompleted}
              onCheckedChange={() => toggleTask(index)}
              className="mt-1 h-5 w-5"
              data-testid={`checkbox-task-${index}`}
            />
            <div className="flex-1">
              <label
                htmlFor={`task-${index}`}
                className={`block cursor-pointer text-base font-medium mb-1 ${
                  isCompleted
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                }`}
                data-testid={`label-task-${index}`}
              >
                {taskItem.task}
              </label>
              {taskItem.subtext && (
                <p className={`text-sm ${
                  isCompleted
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {taskItem.subtext}
                </p>
              )}
            </div>
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
  );
}
