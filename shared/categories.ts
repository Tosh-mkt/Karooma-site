// Estrutura compartilhada de categorias para produtos e newsletter
// Fonte única da verdade para manter sincronização

export interface CategoryInfo {
  label: string;
  emoji: string;
  color: string;
  description: string;
  allowedAudience?: string[];
  allowedEnvironments?: string[];
  allowedOccasions?: string[];
}

export interface AudienceInfo {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface EnvironmentInfo {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface OccasionInfo {
  id: string;
  label: string;
  icon: string;
  color: string;
}

// Categorias principais
export const PRODUCT_CATEGORIES: Record<string, CategoryInfo> = {
  "comer-preparar": {
    label: "Comer e Preparar",
    emoji: "🍽️",
    color: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg",
    description: "Alimentação e preparo de refeições",
    allowedAudience: ["bebe", "crianca", "familia"],
    allowedEnvironments: ["casa", "cozinha"],
    allowedOccasions: ["dia-dia", "emergencia"]
  },
  "presentear": {
    label: "Presentear",
    emoji: "🎁",
    color: "bg-purple-500 hover:bg-purple-600 text-white shadow-lg",
    description: "Presentes para ocasiões especiais",
    allowedAudience: ["bebe", "crianca", "familia"],
    allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
    allowedOccasions: ["presente-ocasioes", "presente-idade"]
  },
  "sono-relaxamento": {
    label: "Sono e Relaxamento",
    emoji: "😴",
    color: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
    description: "Produtos para dormir e relaxar",
    allowedAudience: ["bebe", "crianca", "pais-cuidadores"],
    allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
    allowedOccasions: ["dia-dia", "viagem"]
  },
  "aprender-brincar": {
    label: "Aprender e Brincar",
    emoji: "🎨",
    color: "bg-green-500 hover:bg-green-600 text-white shadow-lg",
    description: "Educação e diversão",
    allowedAudience: ["bebe", "crianca", "familia"],
    allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
    allowedOccasions: ["dia-dia", "presente-idade"]
  },
  "sair-viajar": {
    label: "Sair e Viajar",
    emoji: "🚗",
    color: "bg-teal-500 hover:bg-teal-600 text-white shadow-lg",
    description: "Mobilidade e viagens",
    allowedAudience: ["bebe", "crianca", "familia"],
    allowedEnvironments: ["carro", "casa"],
    allowedOccasions: ["viagem", "emergencia", "dia-dia"]
  },
  "organizacao": {
    label: "Organização",
    emoji: "📦",
    color: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg",
    description: "Organizar casa e espaços",
    allowedAudience: ["bebe", "crianca", "familia", "pais-cuidadores"],
    allowedEnvironments: ["casa", "cozinha", "area-servico", "quarto-bebe", "quarto-crianca", "carro"],
    allowedOccasions: ["dia-dia"]
  },
  "saude-seguranca": {
    label: "Saúde e Segurança",
    emoji: "🏥",
    color: "bg-red-500 hover:bg-red-600 text-white shadow-lg",
    description: "Cuidados médicos e segurança",
    allowedAudience: ["bebe", "crianca", "familia", "pais-cuidadores"],
    allowedEnvironments: ["casa", "cozinha", "area-servico", "quarto-bebe", "quarto-crianca", "carro"],
    allowedOccasions: ["emergencia", "dia-dia", "primeiros-socorros"]
  },
  "decorar-brilhar": {
    label: "Decorar e Brilhar",
    emoji: "✨",
    color: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg",
    description: "Decoração e estética",
    allowedAudience: ["familia", "pais-cuidadores"],
    allowedEnvironments: ["casa", "quarto-bebe", "quarto-crianca"],
    allowedOccasions: ["dia-dia", "presente-ocasioes"]
  }
};

// Públicos-alvo
export const TARGET_AUDIENCE: AudienceInfo[] = [
  { id: "bebe", label: "Bebê", icon: "👶", color: "bg-blue-100 text-blue-800" },
  { id: "crianca", label: "Criança", icon: "🧒", color: "bg-green-100 text-green-800" },
  { id: "familia", label: "Família", icon: "👨‍👩‍👧‍👦", color: "bg-purple-100 text-purple-800" },
  { id: "pais-cuidadores", label: "Pais e Cuidadores", icon: "👥", color: "bg-orange-100 text-orange-800" },
];

// Ambientes
export const ENVIRONMENTS: EnvironmentInfo[] = [
  { id: "casa", label: "Casa", icon: "🏠", color: "bg-yellow-100 text-yellow-800" },
  { id: "cozinha", label: "Cozinha", icon: "🍳", color: "bg-orange-100 text-orange-800" },
  { id: "area-servico", label: "Área de Serviço", icon: "🧺", color: "bg-blue-100 text-blue-800" },
  { id: "quarto-bebe", label: "Quarto do Bebê", icon: "🛏️", color: "bg-pink-100 text-pink-800" },
  { id: "quarto-crianca", label: "Quarto da Criança", icon: "🎪", color: "bg-green-100 text-green-800" },
  { id: "carro", label: "Carro", icon: "🚗", color: "bg-gray-100 text-gray-800" },
];

// Ocasiões especiais
export const SPECIAL_OCCASIONS: OccasionInfo[] = [
  { id: "presente-ocasioes", label: "Presente para Ocasiões", icon: "🎉", color: "bg-purple-100 text-purple-800" },
  { id: "presente-idade", label: "Presente por Idade", icon: "🎂", color: "bg-yellow-100 text-yellow-800" },
  { id: "emergencia", label: "Emergência", icon: "🚨", color: "bg-red-100 text-red-800" },
  { id: "dia-dia", label: "Uso Diário", icon: "📅", color: "bg-gray-100 text-gray-800" },
  { id: "viagem", label: "Viagem", icon: "✈️", color: "bg-blue-100 text-blue-800" },
  { id: "primeiros-socorros", label: "Primeiros Socorros", icon: "🩹", color: "bg-red-100 text-red-800" },
];

// Utilitários
export const getCategoryInfo = (categoryId: string): CategoryInfo | undefined => {
  return PRODUCT_CATEGORIES[categoryId];
};

export const getAudienceInfo = (audienceId: string): AudienceInfo | undefined => {
  return TARGET_AUDIENCE.find(item => item.id === audienceId);
};

export const getEnvironmentInfo = (environmentId: string): EnvironmentInfo | undefined => {
  return ENVIRONMENTS.find(item => item.id === environmentId);
};

export const getOccasionInfo = (occasionId: string): OccasionInfo | undefined => {
  return SPECIAL_OCCASIONS.find(item => item.id === occasionId);
};

export const getCategoriesArray = () => {
  return Object.entries(PRODUCT_CATEGORIES).map(([id, data]) => ({
    id,
    ...data
  }));
};

export const getAvailableAudienceForCategory = (categoryId: string): AudienceInfo[] => {
  const category = PRODUCT_CATEGORIES[categoryId];
  if (!category?.allowedAudience) return [];
  return TARGET_AUDIENCE.filter(item => category.allowedAudience!.includes(item.id));
};

export const getAvailableEnvironmentsForCategory = (categoryId: string): EnvironmentInfo[] => {
  const category = PRODUCT_CATEGORIES[categoryId];
  if (!category?.allowedEnvironments) return [];
  return ENVIRONMENTS.filter(item => category.allowedEnvironments!.includes(item.id));
};

export const getAvailableOccasionsForCategory = (categoryId: string): OccasionInfo[] => {
  const category = PRODUCT_CATEGORIES[categoryId];
  if (!category?.allowedOccasions) return [];
  return SPECIAL_OCCASIONS.filter(item => category.allowedOccasions!.includes(item.id));
};