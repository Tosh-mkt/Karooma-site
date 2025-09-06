// Blog Content Validator - Karooma
// Sistema de validação automática para manter padrões de qualidade

import { 
  BlogPost, 
  BlogCategory, 
  KAROOMA_BLOG_STANDARDS, 
  CATEGORY_TEMPLATES,
  validateBlogPost,
  getBlogTemplate 
} from "@shared/blog-template";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export class BlogValidator {
  
  /**
   * Validação completa de um post do blog
   */
  validatePost(post: Partial<BlogPost>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Validações obrigatórias
    const basicErrors = validateBlogPost(post);
    errors.push(...basicErrors);
    score -= basicErrors.length * 15;

    // Validação de estrutura Karooma
    if (post.content) {
      const structureResult = this.validateStructure(post.content);
      errors.push(...structureResult.errors);
      warnings.push(...structureResult.warnings);
      suggestions.push(...structureResult.suggestions);
      score -= structureResult.errors.length * 10;
      score -= structureResult.warnings.length * 5;
    }

    // Validação de tom de voz
    if (post.content) {
      const toneResult = this.validateTone(post.content);
      warnings.push(...toneResult.warnings);
      suggestions.push(...toneResult.suggestions);
      score -= toneResult.warnings.length * 3;
    }

    // Validação específica da categoria
    if (post.category && post.content) {
      const categoryResult = this.validateCategory(post.content, post.category);
      warnings.push(...categoryResult.warnings);
      suggestions.push(...categoryResult.suggestions);
      score -= categoryResult.warnings.length * 5;
    }

    // Validação de imagens origami
    const imageResult = this.validateImages(post);
    warnings.push(...imageResult.warnings);
    suggestions.push(...imageResult.suggestions);
    score -= imageResult.warnings.length * 5;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score: Math.max(0, score)
    };
  }

  /**
   * Valida estrutura obrigatória do Karooma (5 elementos)
   */
  private validateStructure(content: string): Omit<ValidationResult, 'isValid' | 'score'> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1. Gancho emocional
    const hasHook = this.hasEmotionalHook(content);
    if (!hasHook) {
      errors.push("Falta gancho emocional no início");
      suggestions.push("Comece com: 'Você já passou por isso?' ou 'Aquele momento em que...'");
    }

    // 2. Lista prática numerada
    const practicalLists = content.match(/\d+\.\s+/g) || [];
    if (practicalLists.length < 5) {
      warnings.push(`Lista prática tem ${practicalLists.length} itens (recomendado: 5-8)`);
      suggestions.push("Adicione mais dicas práticas numeradas");
    }
    if (practicalLists.length > 8) {
      warnings.push("Lista muito longa - considere dividir em seções");
    }

    // 3. Dica extra/bônus
    const hasBonus = /dica extra|bônus|dica especial/i.test(content);
    if (!hasBonus) {
      warnings.push("Considere adicionar uma 'Dica Extra' em destaque");
    }

    // 4. Reflexão pessoal
    const hasReflection = this.hasPersonalReflection(content);
    if (!hasReflection) {
      errors.push("Falta reflexão pessoal ou caso real");
      suggestions.push("Adicione experiência pessoal com: 'Lembro quando...' ou 'Descobri que...'");
    }

    // 5. Call-to-actions
    const hasNewsletter = /newsletter|assine/i.test(content);
    const hasCommunity = /comentário|compartilhe|salvar/i.test(content);
    
    if (!hasNewsletter) {
      warnings.push("Considere mencionar a newsletter");
    }
    if (!hasCommunity) {
      warnings.push("Adicione CTA para engajamento (comentários/compartilhar)");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Valida tom de voz Karooma
   */
  private validateTone(content: string): Omit<ValidationResult, 'isValid' | 'score'> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Verifica uso de 2ª pessoa
    const firstPersonCount = (content.match(/\beu\b/gi) || []).length;
    const secondPersonCount = (content.match(/\bvocê\b/gi) || []).length;
    
    if (firstPersonCount > secondPersonCount) {
      warnings.push("Use mais 2ª pessoa (você) do que 1ª pessoa (eu)");
      suggestions.push("Substitua 'eu faço' por 'você pode fazer'");
    }

    // Verifica validação emocional
    const hasValidation = /está tudo bem|você não está sozinha|isso é normal|compreendo/i.test(content);
    if (!hasValidation) {
      suggestions.push("Adicione validação emocional: 'Está tudo bem sentir isso'");
    }

    // Verifica linguagem inclusiva
    const hasInclusive = /nós|juntas|nossa experiência/i.test(content);
    if (!hasInclusive) {
      suggestions.push("Use linguagem inclusiva: 'nós', 'juntas', 'nossa experiência'");
    }

    // Verifica tom julgativo
    const judgmentalWords = /deveria|tem que|obrigatório|sempre|nunca/gi;
    const judgmentalCount = (content.match(judgmentalWords) || []).length;
    if (judgmentalCount > 3) {
      warnings.push("Evite linguagem muito prescritiva - prefira sugestões");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Valida elementos específicos da categoria
   */
  private validateCategory(content: string, category: BlogCategory): Omit<ValidationResult, 'isValid' | 'score'> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const template = CATEGORY_TEMPLATES[category];

    if (!template) return { errors, warnings, suggestions };

    // Validações específicas por categoria
    switch (category) {
      case 'Segurança':
        if (!content.includes('emergência') && !content.includes('192')) {
          suggestions.push("Considere incluir números de emergência");
        }
        if (!content.toLowerCase().includes('quando procurar ajuda')) {
          warnings.push("Adicione orientação sobre quando buscar ajuda profissional");
        }
        break;

      case 'Educação':
        if (!content.includes('idade') && !content.includes('anos')) {
          warnings.push("Especifique faixas etárias para as atividades");
        }
        if (!content.includes('material')) {
          suggestions.push("Liste materiais necessários para as atividades");
        }
        break;

      case 'Bem-estar':
        if (!content.toLowerCase().includes('profissional') && !content.includes('ajuda')) {
          warnings.push("Mencione quando buscar ajuda profissional");
        }
        break;

      case 'Organização':
        if (!content.includes('tempo') && !content.includes('minutos')) {
          suggestions.push("Indique tempo necessário para implementar as dicas");
        }
        break;
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Valida conceito visual origami
   */
  private validateImages(post: Partial<BlogPost>): Omit<ValidationResult, 'isValid' | 'score'> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!post.heroImageUrl) {
      warnings.push("Adicione imagem hero (problema/caos origami)");
    }

    if (!post.footerImageUrl) {
      warnings.push("Adicione imagem footer (solução/harmonia origami)");
    }

    // Verifica conceito origami nos nomes das imagens
    if (post.heroImageUrl && !post.heroImageUrl.includes('origami')) {
      suggestions.push("Imagem hero deve seguir conceito origami 'caos/problema'");
    }

    if (post.footerImageUrl && !post.footerImageUrl.includes('origami')) {
      suggestions.push("Imagem footer deve seguir conceito origami 'harmonia/solução'");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Helpers para detectar elementos específicos
   */
  private hasEmotionalHook(content: string): boolean {
    const hookPatterns = [
      /você já passou por/i,
      /aquele momento em que/i,
      /se você é como eu/i,
      /já sentiu essa/i,
      /conhece essa situação/i
    ];
    
    const firstParagraph = content.split('\n')[0];
    return hookPatterns.some(pattern => pattern.test(firstParagraph));
  }

  private hasPersonalReflection(content: string): boolean {
    const reflectionPatterns = [
      /lembro/i,
      /descobri que/i,
      /percebi que/i,
      /minha experiência/i,
      /quando eu/i,
      /aprendi que/i,
      /no meu caso/i
    ];
    
    return reflectionPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Gera sugestões de melhoria baseadas na categoria
   */
  generateImprovementSuggestions(post: Partial<BlogPost>): string[] {
    const suggestions: string[] = [];
    
    if (post.category) {
      const template = CATEGORY_TEMPLATES[post.category];
      suggestions.push(`Foco da categoria ${post.category}: ${template.focus}`);
      suggestions.push(...template.mustInclude.map(item => `Inclua: ${item}`));
    }

    if (!post.tags || post.tags.length === 0) {
      suggestions.push("Adicione tags semânticas para melhor descoberta");
    }

    const wordCount = post.content?.split(' ').length || 0;
    if (wordCount < 1500) {
      suggestions.push("Considere expandir o conteúdo (ideal: 1500-2500 palavras)");
    }

    return suggestions;
  }
}

// Instância singleton para uso na aplicação
export const blogValidator = new BlogValidator();