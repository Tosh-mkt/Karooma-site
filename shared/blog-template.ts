// Karooma Blog Content Standards & Templates
// Sistema completo de padrões para manter consistência editorial

export interface BlogPost {
  title: string;
  description: string;
  content: string;
  category: BlogCategory;
  heroImageUrl?: string;
  footerImageUrl?: string;
  tags?: string[];
  difficulty?: 'Fácil' | 'Intermediário' | 'Avançado';
  ageRange?: string[];
  readingTime?: number;
  urgency?: 'Solução Rápida' | 'Projeto Fim de Semana' | 'Planejamento';
  investment?: 'Sem Custo' | 'Baixo Investimento' | 'Vale o Investimento';
}

export type BlogCategory = 'Educação' | 'Segurança' | 'Bem-estar' | 'Organização' | 'Alimentação' | 'Desenvolvimento';

// === PADRÕES BASE KAROOMA ===
export const KAROOMA_BLOG_STANDARDS = {
  // Persona principal
  targetAudience: {
    primary: "Cláudia - 39 anos, mãe de 3 filhos (10, 6, 2 anos)",
    needs: "Soluções práticas para caos diário, busca simplicidade e autocuidado",
    painPoints: "Falta de tempo, sobrecarga, busca por equilíbrio",
    goals: "Facilitar rotina familiar, encontrar momentos para si mesma"
  },

  // Tom de voz obrigatório
  voiceTone: {
    person: "2ª pessoa (você)",
    style: "Conversacional, empático, prático",
    personality: "Amiga experiente que entende as dificuldades",
    mustInclude: [
      "Validação emocional antes da solução",
      "Linguagem inclusiva (nós, juntas, nossa experiência)", 
      "Reconhecimento das dificuldades reais",
      "Tom não-julgativo e acolhedor"
    ],
    phrases: {
      hooks: [
        "Você já passou por isso?",
        "Aquele momento em que...",
        "Se você é como eu..."
      ],
      transitions: [
        "Aqui está o que funcionou para mim",
        "A verdade é que...",
        "Descobri que..."
      ],
      validation: [
        "E está tudo bem sentir isso",
        "Você não está sozinha nisso",
        "Isso é mais comum do que parece"
      ]
    }
  },

  // Estrutura obrigatória (5 elementos)
  structure: {
    hook: {
      description: "Gancho emocional (2-3 linhas)",
      purpose: "Criar identificação imediata com o leitor",
      format: "Situação reconhecível + validação emocional"
    },
    problemIdentification: {
      description: "Identificação clara do problema (1 parágrafo)",
      purpose: "Mostrar compreensão da dificuldade",
      format: "Descrição empática + impacto real na vida"
    },
    practicalSolutions: {
      description: "Lista prática numerada (5-8 dicas)",
      purpose: "Fornecer soluções aplicáveis imediatamente",
      format: "Passos claros + exemplos concretos"
    },
    bonusSection: {
      description: "Box destacado com 'Dica Extra' ou 'Bônus'",
      purpose: "Valor adicional e diferenciação",
      format: "Informação exclusiva ou hack especial"
    },
    personalReflection: {
      description: "Reflexão pessoal ou caso real",
      purpose: "Humanizar o conteúdo e criar conexão",
      format: "História pessoal + aprendizado"
    },
    links: {
      description: "Links para aprofundamento",
      purpose: "SEO + autoridade + valor adicional",
      format: "2-3 links relevantes com contexto"
    },
    ctas: {
      description: "Call-to-actions estratégicos",
      sequence: ["newsletter", "produtos", "engajamento"],
      purpose: "Conversão + retenção + comunidade"
    }
  },

  // Conceito visual origami
  visualConcept: {
    heroImage: {
      concept: "Elementos dobrados de forma caótica (representando o problema)",
      style: "Origami Papercraft - papel cortado, dobrado e sobreposto",
      examples: "Criança chorando, casa bagunçada, mãe estressada"
    },
    footerImage: {
      concept: "Elementos organizados harmoniosamente (representando a solução)",
      style: "Origami Papercraft - papel cortado, dobrado e sobreposto", 
      examples: "Família feliz, ambiente organizado, harmonia"
    },
    transformation: "Caos → Harmonia através de dobraduras organizadas"
  },

  // Métricas de qualidade
  qualityMetrics: {
    readingTime: "8-12 minutos (1500-2500 palavras)",
    practicalTips: "Mínimo 5, máximo 8 dicas",
    personalTouch: "Obrigatório: pelo menos 1 reflexão pessoal",
    actionability: "100% das dicas devem ser implementáveis",
    empathy: "Validação emocional em cada seção"
  }
};

// === TEMPLATES POR CATEGORIA ===

export const CATEGORY_TEMPLATES = {
  'Educação': {
    focus: "Desenvolvimento infantil + atividades práticas",
    specificElements: {
      hook: "Desafios de ensinar em casa ou apoiar escola",
      solutions: "Atividades por idade + materiais caseiros + progressão",
      bonus: "Atividade especial ou recurso gratuito",
      ctas: "Materiais educativos + newsletter + comunidade"
    },
    commonTopics: [
      "Montessori em casa", "Alfabetização", "Matemática lúdica", 
      "Desenvolvimento motor", "Criatividade", "Leitura"
    ],
    ageRanges: ["0-2 anos", "3-6 anos", "7-10 anos", "11+ anos"],
    mustInclude: [
      "Atividades por faixa etária",
      "Materiais necessários",
      "Sinais de progresso",
      "Adaptações para diferentes temperamentos"
    ]
  },

  'Segurança': {
    focus: "Prevenção + primeiros socorros + preparação",
    specificElements: {
      hook: "Medos parentais sobre acidentes/emergências",
      solutions: "Medidas preventivas + protocolos de emergência + checklists",
      bonus: "Kit de emergência ou números importantes",
      ctas: "Produtos de segurança + newsletter + compartilhar"
    },
    commonTopics: [
      "Primeiros socorros", "Segurança doméstica", "Prevenção acidentes",
      "Emergências", "Segurança digital", "Bullying"
    ],
    urgency: "Alta - informações que podem salvar vidas",
    mustInclude: [
      "Protocolos claros passo-a-passo",
      "Sinais de alerta",
      "Quando buscar ajuda profissional",
      "Números de emergência",
      "Medidas preventivas"
    ]
  },

  'Bem-estar': {
    focus: "Autocuidado materno + saúde mental + equilíbrio",
    specificElements: {
      hook: "Sentimentos de culpa, exaustão ou sobrecarga",
      solutions: "Práticas de autocuidado + mindset + apoio emocional",
      bonus: "Exercício de mindfulness ou autocompaixão",
      ctas: "Recursos bem-estar + newsletter + comunidade"
    },
    commonTopics: [
      "Culpa materna", "Autocuidado", "Burnout", "Ansiedade",
      "Relacionamentos", "Autoestima", "Equilíbrio"
    ],
    tone: "Extra empático e validativo",
    mustInclude: [
      "Normalização dos sentimentos",
      "Práticas simples e rápidas",
      "Quando buscar ajuda profissional",
      "Rede de apoio",
      "Celebração de pequenas vitórias"
    ]
  },

  'Organização': {
    focus: "Sistemas + rotinas + ferramentas práticas",
    specificElements: {
      hook: "Caos doméstico e falta de tempo",
      solutions: "Sistemas organizacionais + rotinas + ferramentas",
      bonus: "Template ou checklist para download",
      ctas: "Produtos organizadores + newsletter + antes/depois"
    },
    commonTopics: [
      "Rotinas familiares", "Organização casa", "Gestão tempo",
      "Planejamento", "Sistemas", "Produtividade"
    ],
    visualElements: "Antes/depois, checklists, sistemas visuais",
    mustInclude: [
      "Sistemas replicáveis",
      "Manutenção das rotinas", 
      "Adaptação para diferentes famílias",
      "Ferramentas gratuitas",
      "Tempo necessário para implementar"
    ]
  },

  'Alimentação': {
    focus: "Nutrição infantil + praticidade + educação alimentar",
    specificElements: {
      hook: "Desafios alimentares com crianças",
      solutions: "Receitas práticas + estratégias + educação nutricional",
      bonus: "Receita especial ou dica de conservação",
      ctas: "Utensílios/ingredientes + newsletter + receitas"
    },
    commonTopics: [
      "Alimentação saudável", "Seletividade alimentar", "Lanches",
      "Refeições rápidas", "Educação nutricional", "Alergias"
    ],
    practicalElements: "Receitas, listas de compras, meal prep",
    mustInclude: [
      "Receitas testadas",
      "Tempo de preparo",
      "Substitutos para alergias",
      "Dicas de armazenamento",
      "Envolvimento das crianças"
    ]
  },

  'Desenvolvimento': {
    focus: "Marcos + estímulos + acompanhamento",
    specificElements: {
      hook: "Preocupações sobre desenvolvimento dos filhos",
      solutions: "Atividades estimulantes + marcos + sinais de alerta",
      bonus: "Atividade especial para estimular área específica",
      ctas: "Brinquedos educativos + newsletter + marcos"
    },
    commonTopics: [
      "Marcos desenvolvimento", "Estímulos", "Brincadeiras", 
      "Linguagem", "Motor", "Social", "Emocional"
    ],
    ageSpecific: "Sempre segmentar por idade",
    mustInclude: [
      "Marcos por idade",
      "Atividades estimulantes",
      "Sinais de alerta",
      "Quando buscar avaliação",
      "Respeitando o ritmo individual"
    ]
  }
};

// === SISTEMA DE TAGS SEMÂNTICAS ===
export const SEMANTIC_TAGS = {
  urgency: ['Solução Rápida', 'Projeto Fim de Semana', 'Planejamento'],
  investment: ['Sem Custo', 'Baixo Investimento', 'Vale o Investimento'],
  difficulty: ['Fácil', 'Intermediário', 'Avançado'],
  timeCommitment: ['5 min', '15 min', '30 min', '1 hora+'],
  ageRanges: ['0-2 anos', '3-6 anos', '7-10 anos', '11+ anos', 'Todas as idades'],
  season: ['Verão', 'Inverno', 'Volta às aulas', 'Férias', 'Feriados'],
  setting: ['Em Casa', 'Na Escola', 'No Carro', 'Ao Ar Livre', 'Viagem']
};

// === FUNÇÕES UTILITÁRIAS ===

export function getBlogTemplate(category: BlogCategory) {
  const baseStandards = KAROOMA_BLOG_STANDARDS;
  const categoryTemplate = CATEGORY_TEMPLATES[category];
  
  return {
    ...baseStandards,
    categorySpecific: categoryTemplate,
    suggestedTags: SEMANTIC_TAGS
  };
}

export function validateBlogPost(post: Partial<BlogPost>): string[] {
  const errors: string[] = [];
  
  // Validações obrigatórias
  if (!post.title) errors.push("Título obrigatório");
  if (!post.description) errors.push("Descrição obrigatória");
  if (!post.content) errors.push("Conteúdo obrigatório");
  if (!post.category) errors.push("Categoria obrigatória");
  
  // Validação de estrutura
  if (post.content) {
    const hasHook = post.content.includes("já passou por") || post.content.includes("Aquele momento");
    const hasList = /\d+\./.test(post.content); // Verifica listas numeradas
    const hasReflection = post.content.toLowerCase().includes("lembro") || 
                         post.content.toLowerCase().includes("descobri") ||
                         post.content.toLowerCase().includes("experiência");
    
    if (!hasHook) errors.push("Falta gancho emocional no início");
    if (!hasList) errors.push("Falta lista prática numerada");
    if (!hasReflection) errors.push("Falta reflexão pessoal");
  }
  
  return errors;
}

export function generateContentSuggestions(category: BlogCategory, topic: string) {
  const template = CATEGORY_TEMPLATES[category];
  
  return {
    hookSuggestions: [
      `Você já passou por ${topic.toLowerCase()}?`,
      `Aquele momento em que ${topic.toLowerCase()} se torna um desafio...`,
      `Se você é como eu e já enfrentou ${topic.toLowerCase()}...`
    ],
    structureSuggestions: template.mustInclude,
    tagSuggestions: Object.values(SEMANTIC_TAGS).flat(),
    ctaSuggestions: template.specificElements.ctas
  };
}