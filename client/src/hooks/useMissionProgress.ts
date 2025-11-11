import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mission-progress';

export function useMissionProgress(slug: string, totalTasks: number) {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      setCompletedTaskIds(data[slug] || []);
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  }, [slug]);
  
  const toggleTask = (taskId: string) => {
    setCompletedTaskIds(prev => {
      const newCompleted = prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId];
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        data[slug] = newCompleted;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save progress', e);
      }
      
      return newCompleted;
    });
  };
  
  const progress = totalTasks > 0 ? (completedTaskIds.length / totalTasks) * 100 : 0;
  
  return { 
    completedTaskIds, 
    toggleTask, 
    progress, 
    completedCount: completedTaskIds.length 
  };
}
