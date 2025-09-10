// Configuração de cores dos temas dos flipbooks baseado na identidade visual Karooma

export interface FlipbookTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
    background: string;
    text: string;
    accent: string;
    lightTone: string;
    darkTone: string;
  };
}

export const FLIPBOOK_THEMES: Record<string, FlipbookTheme> = {
  'produtividade': {
    id: 'produtividade',
    name: 'Produtividade Doméstica',
    colors: {
      primary: '#8B6BB7',     // Roxo principal da imagem
      secondary: '#A687C4',   // Roxo mais claro
      gradient: 'from-purple-500 to-purple-400',
      background: '#ffffff',
      text: '#4C1D95',        // Roxo escuro para texto
      accent: '#F3F0FF',      // Roxo muito claro
      lightTone: '#E9E3FF',   // Tom claro para backgrounds
      darkTone: '#6B46C1',    // Tom escuro para acentos
    }
  },
  'financas': {
    id: 'financas', 
    name: 'Finanças Familiares',
    colors: {
      primary: '#D99298',     // Rosa/coral principal da imagem
      secondary: '#E5A9AE',   // Rosa mais claro
      gradient: 'from-rose-400 to-pink-400',
      background: '#ffffff',
      text: '#9F1239',        // Rosa escuro para texto
      accent: '#FFF1F2',      // Rosa muito claro
      lightTone: '#FCE7F3',   // Tom claro para backgrounds
      darkTone: '#BE185D',    // Tom escuro para acentos
    }
  },
  'bem-estar': {
    id: 'bem-estar',
    name: 'Bem Estar Familiar', 
    colors: {
      primary: '#8FBC8F',     // Verde principal da imagem
      secondary: '#A8CBA8',   // Verde mais claro
      gradient: 'from-green-400 to-emerald-400',
      background: '#ffffff',
      text: '#14532D',        // Verde escuro para texto
      accent: '#F0FDF4',      // Verde muito claro
      lightTone: '#DCFCE7',   // Tom claro para backgrounds
      darkTone: '#15803D',    // Tom escuro para acentos
    }
  },
  'tecnologia': {
    id: 'tecnologia',
    name: 'Tecnologia e Educação',
    colors: {
      primary: '#5B9BD5',     // Azul principal da imagem
      secondary: '#7AAEE0',   // Azul mais claro
      gradient: 'from-blue-400 to-sky-400',
      background: '#ffffff',
      text: '#1E3A8A',        // Azul escuro para texto
      accent: '#EFF6FF',      // Azul muito claro
      lightTone: '#DBEAFE',   // Tom claro para backgrounds
      darkTone: '#1D4ED8',    // Tom escuro para acentos
    }
  },
  'seguranca': {
    id: 'seguranca',
    name: 'Segurança',
    colors: {
      primary: '#C4B454',     // Amarelo/dourado principal da imagem
      secondary: '#D4C56A',   // Amarelo mais claro
      gradient: 'from-yellow-400 to-amber-400',
      background: '#ffffff',
      text: '#92400E',        // Amarelo escuro para texto
      accent: '#FFFBEB',      // Amarelo muito claro
      lightTone: '#FEF3C7',   // Tom claro para backgrounds
      darkTone: '#D97706',    // Tom escuro para acentos
    }
  },
  'organizacao': {
    id: 'organizacao',
    name: 'Organização da Casa',
    colors: {
      primary: '#8b5cf6',     // Mantém o roxo atual (purple-500)
      secondary: '#ec4899',   // Mantém o rosa atual (pink-500)
      gradient: 'from-purple-600 to-pink-600',
      background: '#ffffff',
      text: '#1f2937',        // gray-800
      accent: '#f3f4f6',      // gray-100
      lightTone: '#F3E8FF',   // Roxo muito claro
      darkTone: '#7C3AED',    // Roxo escuro
    }
  }
};

// Função para obter tema por ID
export function getFlipbookTheme(themeId: string): FlipbookTheme {
  return FLIPBOOK_THEMES[themeId] || FLIPBOOK_THEMES.organizacao; // fallback para organização
}

// Lista de todos os temas disponíveis
export function getAllFlipbookThemes(): FlipbookTheme[] {
  return Object.values(FLIPBOOK_THEMES);
}

// Mapear tema para classes CSS do Tailwind
export function getThemeClasses(themeId: string) {
  const theme = getFlipbookTheme(themeId);
  
  return {
    // Classes para gradientes
    gradientBg: `bg-gradient-to-br ${theme.colors.gradient}`,
    gradientText: `bg-gradient-to-r ${theme.colors.gradient} bg-clip-text text-transparent`,
    
    // Classes para cores sólidas (convertendo hex para Tailwind quando possível)
    primaryBg: getColorClass(theme.colors.primary, 'bg'),
    primaryText: getColorClass(theme.colors.primary, 'text'),
    secondaryBg: getColorClass(theme.colors.secondary, 'bg'),
    accentBg: getColorClass(theme.colors.accent, 'bg'),
    
    // Classes específicas por tema
    themeSpecific: getThemeSpecificClasses(themeId)
  };
}

// Converter cores hex para classes Tailwind quando possível
function getColorClass(hexColor: string, type: 'bg' | 'text' | 'border'): string {
  // Mapeamento básico de cores conhecidas
  const colorMap: Record<string, string> = {
    '#8b5cf6': `${type}-purple-500`,
    '#ec4899': `${type}-pink-500`,
    '#ffffff': `${type}-white`,
    '#1f2937': `${type}-gray-800`,
    '#f3f4f6': `${type}-gray-100`,
  };
  
  return colorMap[hexColor.toLowerCase()] || `${type}-[${hexColor}]`;
}

// Classes específicas por tema
function getThemeSpecificClasses(themeId: string): string {
  const classMap: Record<string, string> = {
    'produtividade': 'theme-produtividade',
    'financas': 'theme-financas', 
    'bem-estar': 'theme-bem-estar',
    'tecnologia': 'theme-tecnologia',
    'seguranca': 'theme-seguranca',
    'organizacao': 'theme-organizacao'
  };
  
  return classMap[themeId] || 'theme-default';
}