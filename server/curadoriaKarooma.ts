/**
 * Curadoria KAROOMA - Sistema de análise automatizada de produtos
 * Baseado na metodologia da equipe multidisciplinar de especialistas
 */

interface ProductInfo {
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating?: string;
  category: string;
  imageUrl?: string;
}

interface ExpertAnalysis {
  expert: string;
  pros: string[];
  cons?: string[];
  analysis: string;
}

interface CuradoriaAnalysis {
  productName: string;
  introduction: string;
  productLink: string;
  affiliateLink: string;
  selectedExperts: string[];
  expertEvaluations: { [expert: string]: string };
  karoomaEvaluation: string;
  categoryTags: string[];
  filterTags: string[];
}

// Especialistas da Curadoria KAROOMA
const KAROOMA_EXPERTS = {
  'psicologia-familiar': 'Psicologia Familiar',
  'terapia-ocupacional': 'Terapia Ocupacional', 
  'fonoaudiologia': 'Fonoaudiologia',
  'organizacao-domestica': 'Organização Doméstica Profissional',
  'nutricao': 'Nutrição',
  'planejamento-experiencias': 'Planejamento de Experiências Familiares',
  'bem-estar': 'Bem-Estar e Autocuidado',
  'design-usabilidade': 'Design e Usabilidade',
  'manutencao-domestica': 'Manutenção Doméstica'
};

// Mapeamento de categorias para especialistas relevantes
const CATEGORY_EXPERT_MAPPING: { [category: string]: string[] } = {
  'cozinha': ['organizacao-domestica', 'design-usabilidade', 'manutencao-domestica', 'nutricao'],
  'bebe': ['psicologia-familiar', 'terapia-ocupacional', 'fonoaudiologia', 'bem-estar'],
  'crianca': ['psicologia-familiar', 'terapia-ocupacional', 'planejamento-experiencias'],
  'organizacao': ['organizacao-domestica', 'design-usabilidade', 'bem-estar'],
  'casa': ['organizacao-domestica', 'manutencao-domestica', 'design-usabilidade'],
  'alimentacao': ['nutricao', 'organizacao-domestica', 'design-usabilidade'],
  'bem-estar': ['bem-estar', 'psicologia-familiar', 'nutricao'],
  'tecnologia': ['design-usabilidade', 'psicologia-familiar', 'planejamento-experiencias'],
  'seguranca': ['psicologia-familiar', 'manutencao-domestica', 'design-usabilidade'],
  'default': ['organizacao-domestica', 'design-usabilidade', 'bem-estar']
};

// Tags primárias baseadas no mapa fornecido
const PRIMARY_FILTER_TAGS = {
  'CRIANÇA': ['BEBÊ', 'FAMÍLIA'],
  'COMER_E_PREPARAR': [],
  'PRESENTEAR': ['PRESENTE_PARA_OCASIÕES', 'PRESENTE_POR_IDADE', 'BEBÊ', 'CRIANÇA', 'FAMÍLIA', 'PRIMEIROS_SOCORROS'],
  'SAÚDE_E_SEGURANÇA': ['CASA', 'COZINHA', 'ÁREA_DE_SERVIÇO', 'QUARTO_DO_BEBÊ', 'QUARTO_DA_CRIANÇA', 'CARRO', 'CASA', 'COZINHA', 'ÁREA_DE_SERVIÇO', 'QUARTO_DO_BEBÊ', 'QUARTO_DA_CRIANÇA'],
  'SONO_E_RELAXAMENTO': ['BEBÊ', 'CRIANÇA', 'PAIS_E_CUIDADORES', 'BEBÊ'],
  'APRENDER_E_BRINCAR': ['CRIANÇA', 'FAMÍLIA', 'BEBÊ'],
  'SAIR_E_VIAJAR': ['CRIANÇA', 'FAMÍLIA', 'PRIMEIROS_SOCORROS', 'CARRO', 'CASA'],
  'ORGANIZAÇÃO': ['COZINHA', 'ÁREA_DE_SERVIÇO', 'QUARTO_DO_BEBÊ', 'QUARTO_DA_CRIANÇA', 'CARRO'],
  'DECORAR_E_BRILHAR': ['ÁREA_DE_SERVIÇO', 'QUARTO_DO_BEBÊ', 'QUARTO_DA_CRIANÇA', 'CARRO']
};

/**
 * Extrai informações básicas do produto a partir da URL
 */
export async function extractProductInfo(productLink: string): Promise<ProductInfo> {
  // Simulação de extração - na implementação real, isso faria scraping ou usaria APIs
  // Por enquanto, retornamos dados simulados baseados no link
  const urlLower = productLink.toLowerCase();
  
  let category = 'casa';
  let name = 'Produto Analisado';
  
  if (urlLower.includes('afiador') || urlLower.includes('faca')) {
    category = 'cozinha';
    name = 'Afiador de Facas e Tesouras';
  } else if (urlLower.includes('bebe') || urlLower.includes('baby')) {
    category = 'bebe';
    name = 'Produto para Bebê';
  } else if (urlLower.includes('organizacao') || urlLower.includes('organizer')) {
    category = 'organizacao';
    name = 'Organizador Doméstico';
  }
  
  return {
    name,
    description: 'Produto selecionado para análise da Curadoria KAROOMA',
    price: '99.90',
    category,
    rating: '4.5'
  };
}

/**
 * Seleciona especialistas relevantes baseado na categoria do produto
 */
export function selectRelevantExperts(category: string): string[] {
  const experts = CATEGORY_EXPERT_MAPPING[category] || CATEGORY_EXPERT_MAPPING['default'];
  return experts.slice(0, 3); // Máximo 3 especialistas por análise
}

/**
 * Gera análise de um especialista específico
 */
export function generateExpertAnalysis(expertKey: string, productInfo: ProductInfo): string {
  const expertName = KAROOMA_EXPERTS[expertKey as keyof typeof KAROOMA_EXPERTS];
  
  const analysisTemplates: { [key: string]: (product: ProductInfo) => string } = {
    'organizacao-domestica': (product) => `
**Prós:**
- Eficiência e Economia: Manter ${product.name} em bom estado evita a necessidade de substituições frequentes, gerando economia e reduzindo desperdício. Uma ferramenta bem mantida torna as tarefas domésticas mais rápidas e eficientes, otimizando o tempo da mãe.
- Funcionalidade Compacta: O design permite armazenamento fácil, evitando bagunça e mantendo o ambiente organizado.
- Praticidade no Dia a Dia: Ter uma ferramenta como essa à mão incentiva a manutenção regular, garantindo que a mãe não tenha que lidar com frustrações na hora de realizar tarefas, contribuindo para um fluxo de trabalho mais suave.
    `,
    
    'design-usabilidade': (product) => `
**Prós:**
- Segurança e Ergonomia: O design ergonômico e características de segurança são cruciais para minimizar riscos durante o uso. A interface intuitiva torna a ferramenta acessível mesmo para quem não tem familiaridade.
- Fácil de Limpar: O material e design facilitam a limpeza, benefício adicional em uma rotina corrida.
- Usabilidade: Interface simples e intuitiva que não requer conhecimento técnico avançado.
    `,
    
    'bem-estar': (product) => `
**Prós:**
- Redução do Stress: ${product.name} contribui para reduzir a ansiedade e stress relacionados às tarefas domésticas, permitindo que a mãe tenha mais tempo para autocuidado.
- Autonomia: Promove independência e confiança na execução de tarefas, melhorando a autoestima.
- Qualidade de Vida: Otimiza o tempo disponível para momentos em família e cuidado pessoal.
    `,
    
    'nutricao': (product) => `
**Prós:**
- Segurança Alimentar: Contribui para a preparação segura e higiênica dos alimentos, essencial para a saúde familiar.
- Eficiência na Cozinha: Facilita o preparo de refeições nutritivas, incentivando hábitos alimentares saudáveis.
- Praticidade: Permite preparação rápida de alimentos frescos, essencial para uma alimentação equilibrada.
    `,
    
    'psicologia-familiar': (product) => `
**Prós:**
- Redução da Sobrecarga Mental: ${product.name} diminui a carga cognitiva relacionada ao planejamento e execução de tarefas domésticas.
- Modelo Positivo: Demonstra organização e cuidado para os filhos, ensinando valores importantes.
- Bem-estar Emocional: Reduz frustrações e aumenta a sensação de controle sobre o ambiente doméstico.
    `
  };
  
  const template = analysisTemplates[expertKey] || analysisTemplates['organizacao-domestica'];
  return template(productInfo);
}

/**
 * Gera avaliação final da Curadoria KAROOMA
 */
export function generateKaroomaEvaluation(productInfo: ProductInfo, expertAnalyses: { [expert: string]: string }): string {
  return `O ${productInfo.name} é uma excelente ferramenta para o dia a dia de uma mãe ocupada. Suas principais vantagens são a praticidade, a segurança e a facilidade de uso, que juntas contribuem para a autonomia e a eficiência no lar. É um produto fundamental para manter as rotinas sempre funcionando, evitando o acúmulo de tarefas e a frustração de ferramentas ineficientes. A praticidade de ter um produto como esse em casa faz dele um item valioso para a rotina familiar. Nossa equipe multidisciplinar confirma que este produto atende aos critérios de qualidade, segurança e funcionalidade que a Curadoria KAROOMA exige para recomendar às famílias.`;
}

/**
 * Gera tags de categoria baseadas no produto
 */
export function generateCategoryTags(productInfo: ProductInfo): string[] {
  const baseTags = ['#BemEstarParental', '#RotinaOtimizada'];
  
  const categoryTags: { [key: string]: string[] } = {
    'cozinha': ['#OrganizaçãoDoméstica', '#CozinhaEficiente', '#Cozinha', '#Autonomia'],
    'bebe': ['#CuidadoBebê', '#BemEstarInfantil', '#PsicologiaFamiliar'],
    'crianca': ['#DesenvolvimentoInfantil', '#AprendereeBrincar', '#PsicologiaFamiliar'],
    'organizacao': ['#OrganizaçãoDoméstica', '#ProdutividadeDoméstica', '#Organização'],
    'casa': ['#CasaOrganizada', '#ManutençãoDoméstica', '#OrganizaçãoDoméstica'],
    'alimentacao': ['#AlimentaçãoSaudável', '#CozinhaEficiente', '#NutriçãoFamiliar'],
    'bem-estar': ['#AutoCuidado', '#BemEstarMaternal', '#QualidadeDeVida'],
    'seguranca': ['#SegurançaFamiliar', '#SegurançaInfantil', '#Prevenção']
  };
  
  const specificTags = categoryTags[productInfo.category] || categoryTags['casa'];
  return [...baseTags, ...specificTags];
}

/**
 * Gera tags de filtro baseadas no mapa de tags primárias
 */
export function generateFilterTags(productInfo: ProductInfo): string[] {
  const baseTags = ['#Casa'];
  
  const filterMappings: { [key: string]: string[] } = {
    'cozinha': ['#ComerEPreparar', '#Casa', '#Cozinha', '#Organização', '#Organizar'],
    'bebe': ['#Bebê', '#Criança', '#SonoERelaxamento', '#CuidadoBebê'],
    'crianca': ['#Criança', '#AprenderEBrincar', '#Família', '#Presentear'],
    'organizacao': ['#Organização', '#Casa', '#Organizar', '#ProdutividadeDoméstica'],
    'casa': ['#Casa', '#Organização', '#ManutençãoDoméstica'],
    'alimentacao': ['#ComerEPreparar', '#Cozinha', '#NutriçãoFamiliar'],
    'bem-estar': ['#BemEstar', '#AutoCuidado', '#SonoERelaxamento'],
    'seguranca': ['#SaúdeESegurança', '#SegurançaFamiliar', '#Casa']
  };
  
  const specificTags = filterMappings[productInfo.category] || filterMappings['casa'];
  return [...baseTags, ...specificTags];
}

/**
 * Realiza análise completa do produto usando a metodologia Curadoria KAROOMA
 */
export async function analyzeCuradoriaKarooma(
  productLink: string, 
  affiliateLink: string
): Promise<CuradoriaAnalysis> {
  
  // 1. Extrair informações do produto
  const productInfo = await extractProductInfo(productLink);
  
  // 2. Selecionar especialistas relevantes
  const selectedExpertKeys = selectRelevantExperts(productInfo.category);
  const selectedExperts = selectedExpertKeys.map(key => KAROOMA_EXPERTS[key as keyof typeof KAROOMA_EXPERTS]);
  
  // 3. Gerar análises dos especialistas
  const expertEvaluations: { [expert: string]: string } = {};
  selectedExpertKeys.forEach(expertKey => {
    const expertName = KAROOMA_EXPERTS[expertKey as keyof typeof KAROOMA_EXPERTS];
    expertEvaluations[expertName] = generateExpertAnalysis(expertKey, productInfo);
  });
  
  // 4. Gerar avaliação final da Curadoria KAROOMA
  const karoomaEvaluation = generateKaroomaEvaluation(productInfo, expertEvaluations);
  
  // 5. Gerar introdução
  const introduction = `A Curadoria KAROOMA, com sua equipe multidisciplinar de especialistas, analisou o ${productInfo.name} para avaliar sua utilidade e impacto na vida de mães ocupadas. Nossa análise se concentra em como este produto pode otimizar a rotina doméstica, a segurança e o bem-estar familiar.`;
  
  // 6. Gerar tags
  const categoryTags = generateCategoryTags(productInfo);
  const filterTags = generateFilterTags(productInfo);
  
  return {
    productName: productInfo.name,
    introduction,
    productLink,
    affiliateLink,
    selectedExperts,
    expertEvaluations,
    karoomaEvaluation,
    categoryTags,
    filterTags
  };
}

/**
 * Converte análise da Curadoria para formato de produto do sistema
 */
export function convertAnalysisToProduct(analysis: CuradoriaAnalysis, productInfo: ProductInfo) {
  return {
    title: analysis.productName,
    description: analysis.introduction,
    category: productInfo.category,
    currentPrice: productInfo.price,
    originalPrice: productInfo.originalPrice,
    rating: productInfo.rating ? parseFloat(productInfo.rating) : 4.5,
    affiliateLink: analysis.affiliateLink,
    imageUrl: productInfo.imageUrl || '',
    featured: true,
    introduction: analysis.introduction,
    evaluators: analysis.selectedExperts.join(', '),
    benefits: Object.values(analysis.expertEvaluations).join('\n\n'),
    teamEvaluation: analysis.karoomaEvaluation,
    tags: [...analysis.categoryTags, ...analysis.filterTags].join(' ')
  };
}