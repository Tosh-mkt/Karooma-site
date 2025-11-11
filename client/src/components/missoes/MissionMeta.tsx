import { Clock, Zap, Home } from "lucide-react";
import { motion } from "framer-motion";

interface MissionMetaProps {
  category?: string;
}

export function MissionMeta({ category }: MissionMetaProps) {
  const metaItems = [
    {
      icon: Clock,
      label: "Tempo estimado",
      value: "10-15 min",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Zap,
      label: "Energia",
      value: "Baixa",
      color: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: Home,
      label: "Categoria",
      value: category || "Organização",
      color: "text-green-600 dark:text-green-400"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-6 justify-center md:justify-start p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-green-200 dark:border-green-800"
    >
      {metaItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
