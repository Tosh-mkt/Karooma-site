import { Clock, Zap, Home, Coffee, Heart, BookOpen, Utensils, Baby, Sparkles, Car, Gift, Wrench, Hospital } from "lucide-react";

interface MissionMetadataBadgesProps {
  estimatedMinutes?: number;
  energyLevel?: string;
  category: string;
}

const getCategoryConfig = (category: string) => {
  const configs: Record<string, { icon: typeof Home; bgColor: string; iconColor: string; borderColor: string }> = {
    "Rotina Matinal": { icon: Coffee, bgColor: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-600 dark:text-amber-400", borderColor: "border-amber-100 dark:border-amber-800" },
    "Casa em Ordem": { icon: Home, bgColor: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-600 dark:text-blue-400", borderColor: "border-blue-100 dark:border-blue-800" },
    "Cozinha Inteligente": { icon: Utensils, bgColor: "bg-green-50 dark:bg-green-900/20", iconColor: "text-green-600 dark:text-green-400", borderColor: "border-green-100 dark:border-green-800" },
    "Educação e Brincadeiras": { icon: BookOpen, bgColor: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-600 dark:text-purple-400", borderColor: "border-purple-100 dark:border-purple-800" },
    "Tempo para Mim": { icon: Heart, bgColor: "bg-rose-50 dark:bg-rose-900/20", iconColor: "text-rose-600 dark:text-rose-400", borderColor: "border-rose-100 dark:border-rose-800" },
    "Presentes e Afetos": { icon: Gift, bgColor: "bg-pink-50 dark:bg-pink-900/20", iconColor: "text-pink-600 dark:text-pink-400", borderColor: "border-pink-100 dark:border-pink-800" },
    "Passeios e Saídas": { icon: Car, bgColor: "bg-indigo-50 dark:bg-indigo-900/20", iconColor: "text-indigo-600 dark:text-indigo-400", borderColor: "border-indigo-100 dark:border-indigo-800" },
    "Saúde e Emergências": { icon: Hospital, bgColor: "bg-red-50 dark:bg-red-900/20", iconColor: "text-red-600 dark:text-red-400", borderColor: "border-red-100 dark:border-red-800" },
    "Manutenção e Melhorias do Lar": { icon: Wrench, bgColor: "bg-slate-50 dark:bg-slate-900/20", iconColor: "text-slate-600 dark:text-slate-400", borderColor: "border-slate-100 dark:border-slate-800" },
  };
  return configs[category] || { icon: Sparkles, bgColor: "bg-gray-50 dark:bg-gray-900/20", iconColor: "text-gray-600 dark:text-gray-400", borderColor: "border-gray-100 dark:border-gray-800" };
};

const getEnergyLabel = (energyLevel?: string) => {
  if (!energyLevel) return null;
  
  const energyMap: Record<string, string> = {
    "baixa": "Baixa",
    "média": "Média",
    "alta": "Alta"
  };
  
  return energyMap[energyLevel] || energyLevel;
};

export function MissionMetadataBadges({ 
  estimatedMinutes, 
  energyLevel, 
  category 
}: MissionMetadataBadgesProps) {
  const categoryConfig = getCategoryConfig(category);
  const CategoryIcon = categoryConfig.icon;
  const energyLabel = getEnergyLabel(energyLevel);
  
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Tempo estimado - sempre mostrar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-green-800 flex items-center justify-center">
          <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">Tempo estimado</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {estimatedMinutes || 0} minutos
          </p>
        </div>
      </div>
      
      {/* Energia - sempre mostrar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-orange-800 flex items-center justify-center">
          <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">Energia</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{energyLabel || "Não definida"}</p>
        </div>
      </div>
      
      {/* Categoria - cores dinâmicas por categoria */}
      <div className={`flex items-center gap-2 px-3 py-2 ${categoryConfig.bgColor} rounded-full border ${categoryConfig.borderColor}`}>
        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
          <CategoryIcon className={`w-4 h-4 ${categoryConfig.iconColor}`} />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">Categoria</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{category}</p>
        </div>
      </div>
    </div>
  );
}
