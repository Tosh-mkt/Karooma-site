import { Clock, Zap, Home, Coffee, Heart, BookOpen, Utensils, Baby, Sparkles } from "lucide-react";

interface MissionMetadataBadgesProps {
  estimatedMinutes?: number;
  energyLevel?: string;
  category: string;
}

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes("casa") || categoryLower.includes("organização")) {
    return Home;
  }
  if (categoryLower.includes("alimentação") || categoryLower.includes("comer")) {
    return Utensils;
  }
  if (categoryLower.includes("educação") || categoryLower.includes("aprendizado")) {
    return BookOpen;
  }
  if (categoryLower.includes("autocuidado") || categoryLower.includes("bem-estar")) {
    return Heart;
  }
  if (categoryLower.includes("lazer") || categoryLower.includes("diversão")) {
    return Coffee;
  }
  if (categoryLower.includes("infantil") || categoryLower.includes("criança")) {
    return Baby;
  }
  
  return Sparkles;
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
  const CategoryIcon = getCategoryIcon(category);
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
      
      {/* Categoria - sempre mostrar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
        <div className="w-8 h-8 rounded-full bg-white dark:bg-green-800 flex items-center justify-center">
          <CategoryIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">Categoria</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{category}</p>
        </div>
      </div>
    </div>
  );
}
