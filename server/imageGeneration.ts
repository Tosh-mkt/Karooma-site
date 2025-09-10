// Mapeamento de categorias para prompts de geração de imagens
// Conceito: Caos → Harmonia (Papercraft Origami Style)
// Este arquivo fornece os prompts para geração automática de imagens de blog posts

interface CategoryImagePrompts {
  heroPrompt: string; // Caos/Problema
  footerPrompt: string; // Harmonia/Solução
}

const categoryImageMappings: Record<string, CategoryImagePrompts> = {
  // Produtividade e Organização
  "Produtividade Doméstica": {
    heroPrompt: "Papercraft origami style illustration showing chaotic home scene with overwhelmed mother surrounded by scattered papers, messy kitchen, crying children, unorganized calendar, pile of laundry, dishes everywhere, stress and chaos, folded paper art style with layered cutout elements, warm muted colors",
    footerPrompt: "Papercraft origami style illustration showing organized peaceful home with calm mother managing tasks efficiently, clean organized kitchen, happy children, color-coded calendar, folded laundry, tidy spaces, harmony and productivity, folded paper art style, soft calming colors"
  },
  
  "Métodos e Ferramentas": {
    heroPrompt: "Papercraft origami style illustration showing frustrated person struggling with outdated methods, broken tools, scattered notebooks, confusion, inefficient processes, time slipping away, chaotic workspace, folded paper art style with layered elements, muted frustrated colors",
    footerPrompt: "Papercraft origami style illustration showing empowered person using modern efficient tools, organized digital systems, streamlined processes, clear methodologies, success and achievement, organized workspace, folded paper art style, bright confident colors"
  },

  "Automação do Lar": {
    heroPrompt: "Papercraft origami style illustration showing exhausted family doing repetitive manual household tasks, piles of dishes, endless cleaning, time-consuming routines, overwhelm from manual work, chaos from inefficiency, folded paper art style, tired earth tones",
    footerPrompt: "Papercraft origami style illustration showing smart home with automated systems, self-cleaning devices, scheduled routines, family relaxing while technology handles chores, efficient automated home, folded paper art style, modern bright colors"
  },

  "Organização e Limpeza": {
    heroPrompt: "Papercraft origami style illustration showing cluttered messy home with items everywhere, overflowing closets, dirty surfaces, lost items, family stressed by disorganization, chaos and mess, folded paper art style with scattered elements, dusty muted colors",
    footerPrompt: "Papercraft origami style illustration showing perfectly organized clean home with labeled storage, tidy rooms, everything in place, family enjoying clean spaces, harmony through organization, folded paper art style, fresh bright colors"
  },

  // Finanças
  "Finanças Familiares": {
    heroPrompt: "Papercraft origami style illustration showing family stressed over money with bills scattered everywhere, empty piggy bank, worried expressions, calculator with scary numbers, financial chaos and anxiety, folded paper art style, worried red tones",
    footerPrompt: "Papercraft origami style illustration showing family celebrating financial stability with organized budget sheets, full savings jar, happy expressions, balanced accounts, financial peace and security, folded paper art style, prosperity green tones"
  },

  "Orçamento e Controle": {
    heroPrompt: "Papercraft origami style illustration showing person overwhelmed by uncontrolled spending, receipts flying everywhere, credit cards maxed out, shopping bags, no budget tracking, financial chaos, folded paper art style, chaotic red elements",
    footerPrompt: "Papercraft origami style illustration showing person confidently managing budget with organized expense tracking, savings goals achieved, controlled spending, financial planning charts, budgeting success, folded paper art style, controlled blue tones"
  },

  "Economia e Investimentos": {
    heroPrompt: "Papercraft origami style illustration showing confused person facing complex investment options, scary market charts, financial jargon, overwhelm from too many choices, investment paralysis, folded paper art style, uncertain gray tones",
    footerPrompt: "Papercraft origami style illustration showing confident investor with clear investment strategy, growing portfolio, understanding of markets, smart financial decisions, investment success, folded paper art style, growth green colors"
  },

  "Renda Extra": {
    heroPrompt: "Papercraft origami style illustration showing person struggling with single income, tight budget calculations, dreams of extra money, limited financial options, income stress and constraints, folded paper art style, constrained earth tones",
    footerPrompt: "Papercraft origami style illustration showing person celebrating multiple income streams, side hustles succeeding, extra money flowing in, financial freedom and opportunities, income abundance, folded paper art style, abundant golden colors"
  },

  "Gestão de Dívidas": {
    heroPrompt: "Papercraft origami style illustration showing person drowning in debt with bills piling up, collection notices, stressed expressions, overwhelming financial obligations, debt chaos and anxiety, folded paper art style, heavy dark tones",
    footerPrompt: "Papercraft origami style illustration showing person free from debt with paid-off bills, celebration of financial freedom, debt-free certificate, relief and joy, financial liberation, folded paper art style, liberating bright colors"
  },

  // Bem-estar e Família
  "Bem-Estar Familiar": {
    heroPrompt: "Papercraft origami style illustration showing exhausted family with stressed parents, crying children, health issues, lack of self-care time, family wellness chaos and burnout, folded paper art style, tired muted colors",
    footerPrompt: "Papercraft origami style illustration showing healthy happy family exercising together, parents practicing self-care, children playing healthily, wellness routines, family harmony and health, folded paper art style, vibrant healthy colors"
  },

  "Educação Parental": {
    heroPrompt: "Papercraft origami style illustration showing overwhelmed parents struggling with child behavior, educational challenges, conflicting advice, parenting confusion and stress, educational chaos, folded paper art style, confused mixed colors",
    footerPrompt: "Papercraft origami style illustration showing confident parents successfully guiding children, effective parenting strategies working, children learning and growing, educational success and family harmony, folded paper art style, wise calm colors"
  },

  "Saúde e Alimentação": {
    heroPrompt: "Papercraft origami style illustration showing family struggling with unhealthy eating habits, fast food scattered around, picky children, nutrition confusion, meal planning chaos, folded paper art style, unhealthy processed colors",
    footerPrompt: "Papercraft origami style illustration showing family enjoying healthy nutritious meals together, fresh ingredients, happy eating, successful meal planning, nutritional harmony and health, folded paper art style, fresh natural colors"
  },

  "Lazer e Conexão": {
    heroPrompt: "Papercraft origami style illustration showing disconnected family with everyone on devices, lack of quality time, missed connections, isolation despite being together, relationship chaos, folded paper art style, disconnected cold colors",
    footerPrompt: "Papercraft origami style illustration showing family bonding through activities, quality time together, meaningful connections, shared experiences, family harmony and love, folded paper art style, warm connected colors"
  },

  // Categorias específicas do sono e desenvolvimento
  "sono-relaxamento": {
    heroPrompt: "Papercraft origami style illustration showing chaotic bedtime scene with crying baby, exhausted parents, sleepless nights, messy nursery, multiple alarm clocks, sleep deprivation chaos, folded paper art style, tired dark tones",
    footerPrompt: "Papercraft origami style illustration showing peaceful bedtime with sleeping baby, calm parents, organized nursery, restful sleep routine, family sleep harmony and peace, folded paper art style, calm blue tones"
  },

  "desenvolvimento-infantil": {
    heroPrompt: "Papercraft origami style illustration showing concerned parents worried about child development, missed milestones, developmental delays, confusion about progress, child development chaos, folded paper art style, worried earth tones",
    footerPrompt: "Papercraft origami style illustration showing confident parents celebrating child achievements, developmental milestones reached, happy growing child, successful development support, folded paper art style, proud bright colors"
  }
};

// Função para gerar prompts baseados no título e categoria
export function generateImagePromptsForPost(category: string, title: string): CategoryImagePrompts {
  // Buscar mapeamento específico da categoria
  const categoryMapping = categoryImageMappings[category];
  
  if (categoryMapping) {
    return categoryMapping;
  }

  // Fallback para categorias não mapeadas - usar categoria genérica baseada no título
  return {
    heroPrompt: `Papercraft origami style illustration showing chaotic problematic scene related to "${title}", stressed family situation, overwhelm and difficulties, problems and challenges, folded paper art style with layered cutout elements, muted stressed colors`,
    footerPrompt: `Papercraft origami style illustration showing peaceful solution scene related to "${title}", happy family situation, harmony and success, solutions and achievements, folded paper art style with layered cutout elements, bright peaceful colors`
  };
}

// Esta função seria usada pelo frontend para obter os prompts de geração
// A geração real das imagens deve ser feita no frontend usando o generate_image_tool
export function getBlogPostImagePrompts(category: string, title: string): {
  heroPrompt: string;
  footerPrompt: string;
  heroSummary: string;
  footerSummary: string;
} {
  const prompts = generateImagePromptsForPost(category, title);
  
  return {
    heroPrompt: prompts.heroPrompt,
    footerPrompt: prompts.footerPrompt,
    heroSummary: `${category} chaos origami`,
    footerSummary: `${category} peace origami`
  };
}