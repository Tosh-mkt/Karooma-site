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
    <div className="flex flex-wrap gap-4 items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-green-200 dark:border-green-800">
      {/* Tempo estimado */}
      {estimatedMinutes && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tempo estimado</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {estimatedMinutes} minutos
            </p>
          </div>
        </div>
      )}
      
      {/* Energia */}
      {energyLabel && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Energia</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{energyLabel}</p>
          </div>
        </div>
      )}
      
      {/* Categoria */}
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
          <CategoryIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categoria</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{category}</p>
        </div>
      </div>
    </div>
  );
}
