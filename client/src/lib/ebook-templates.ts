// E-book Template System for Karooma
// Padrão visual e estrutural para todos os e-books

export interface EbookTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  coverImage: string;
  heroImage: string;
  successImage: string;
  chapters: EbookChapter[];
  metadata: EbookMetadata;
}

export interface EbookChapter {
  id: string;
  title: string;
  order: number;
  icon: string;
  sections: EbookSection[];
  checklist: ChecklistItem[];
}

export interface EbookSection {
  id: string;
  type: 'intro' | 'problem' | 'solution' | 'example' | 'bonus' | 'reflection';
  content: string;
  image?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: 'easy' | 'medium' | 'advanced';
  timeEstimate: string;
}

export interface EbookMetadata {
  author: string;
  publishDate: string;
  estimatedReadTime: string;
  targetAudience: string;
  tags: string[];
  sourcePost?: string;
}

import { getFlipbookTheme } from '@shared/flipbook-themes';

// Padrão Visual Karooma - usando tema centralizado
const defaultTheme = getFlipbookTheme('organizacao');
export const EBOOK_STYLES = {
  colors: defaultTheme.colors,
  fonts: {
    heading: 'Fredoka One',
    body: 'Poppins',
    caption: 'Inter',
  },
  spacing: {
    section: '3rem',
    paragraph: '1.5rem',
    margin: '2rem',
  },
  layout: {
    maxWidth: '42rem', // max-w-2xl
    pageBreak: 'page-break-after: always',
  }
};

// Template base para e-book de Organização da Casa
export const homeOrganizationTemplate: EbookTemplate = {
  id: 'home-organization-guide',
  title: 'Organização da Casa: Sistema Simples que Funciona',
  subtitle: 'Guia prático para mães ocupadas organizarem a casa sem stress',
  description: 'Métodos testados por famílias reais para manter a casa organizada com rotinas de 15 minutos que realmente funcionam.',
  category: 'Organização',
  coverImage: 'attached_assets/House_organization_chaos_origami_2d1f488c.png',
  heroImage: 'attached_assets/Wide_origami_home_organization_chaos_dbac14c5.png',
  successImage: 'attached_assets/Wide_origami_home_organization_peace_dd648e67.png',
  
  chapters: [
    {
      id: 'intro',
      title: 'Por que a organização parece impossível?',
      order: 1,
      icon: '🤯',
      sections: [
        {
          id: 'hook',
          type: 'intro',
          content: 'Você já teve aquele momento em que olha para a casa e pensa "por onde eu começo?"'
        },
        {
          id: 'problem',
          type: 'problem',
          content: 'A verdade é que a organização não é sobre perfeição - é sobre criar sistemas que funcionam para SUA família.'
        }
      ],
      checklist: [
        {
          id: 'mindset',
          text: 'Aceitar que organização é um processo, não um destino',
          category: 'easy',
          timeEstimate: '5 min'
        }
      ]
    },
    {
      id: 'sistema-15-min',
      title: 'O Sistema dos 15 Minutos',
      order: 2,
      icon: '⏰',
      sections: [
        {
          id: 'concept',
          type: 'solution',
          content: 'Dividir tarefas em blocos de 15 minutos torna a organização menos assustadora e mais eficiente.'
        }
      ],
      checklist: [
        {
          id: 'timer',
          text: 'Configurar timer para sessões de 15 minutos',
          category: 'easy',
          timeEstimate: '1 min'
        },
        {
          id: 'one-area',
          text: 'Escolher apenas UMA área por sessão',
          category: 'easy',
          timeEstimate: '15 min'
        }
      ]
    },
    {
      id: 'comodos',
      title: 'Organização por Cômodos',
      order: 3,
      icon: '🏠',
      sections: [
        {
          id: 'kitchen',
          type: 'solution',
          content: 'Cozinha: Sistema de zonas funcionais'
        },
        {
          id: 'living',
          type: 'solution',
          content: 'Sala: Princípio do "um lugar para cada coisa"'
        }
      ],
      checklist: [
        {
          id: 'zones',
          text: 'Definir zonas funcionais na cozinha',
          category: 'medium',
          timeEstimate: '30 min'
        }
      ]
    },
    {
      id: 'rotinas',
      title: 'Rotinas que se Mantêm',
      order: 4,
      icon: '🔄',
      sections: [
        {
          id: 'morning',
          type: 'solution',
          content: 'Rotina matinal de 10 minutos que funciona'
        },
        {
          id: 'evening',
          type: 'solution',
          content: 'Reset noturno em 15 minutos'
        }
      ],
      checklist: [
        {
          id: 'morning-routine',
          text: 'Implementar rotina matinal simples',
          category: 'easy',
          timeEstimate: '10 min/dia'
        }
      ]
    },
    {
      id: 'envolver-familia',
      title: 'Envolvendo Toda a Família',
      order: 5,
      icon: '👨‍👩‍👧‍👦',
      sections: [
        {
          id: 'kids-tasks',
          type: 'solution',
          content: 'Tarefas adequadas por idade'
        },
        {
          id: 'motivation',
          type: 'example',
          content: 'Sistema de recompensas que funciona'
        }
      ],
      checklist: [
        {
          id: 'age-tasks',
          text: 'Atribuir tarefas apropriadas para cada idade',
          category: 'medium',
          timeEstimate: '20 min'
        }
      ]
    },
    {
      id: 'emergencias',
      title: 'Plano de Emergência',
      order: 6,
      icon: '🚨',
      sections: [
        {
          id: 'quick-reset',
          type: 'bonus',
          content: 'Reset de 5 minutos para visitas inesperadas'
        }
      ],
      checklist: [
        {
          id: 'emergency-plan',
          text: 'Criar plano de organização de emergência',
          category: 'advanced',
          timeEstimate: '15 min'
        }
      ]
    },
    {
      id: 'manutencao',
      title: 'Mantendo o Sistema Funcionando',
      order: 7,
      icon: '✨',
      sections: [
        {
          id: 'weekly-review',
          type: 'reflection',
          content: 'Revisão semanal: o que funcionou e o que ajustar'
        }
      ],
      checklist: [
        {
          id: 'weekly-check',
          text: 'Agendar revisão semanal do sistema',
          category: 'easy',
          timeEstimate: '10 min/semana'
        }
      ]
    }
  ],
  
  metadata: {
    author: 'Equipe Karooma',
    publishDate: new Date().toISOString().split('T')[0],
    estimatedReadTime: '25-30 minutos',
    targetAudience: 'Mães ocupadas buscando organização prática',
    tags: ['organização', 'casa', 'rotinas', 'família', 'praticidade'],
    sourcePost: 'organizacao-da-casa-sistema-simples'
  }
};

// Utilitário para gerar novos templates
export function createEbookFromBlogPost(
  postData: any,
  category: string,
  images: { hero: string; success: string; cover: string }
): EbookTemplate {
  return {
    id: `${postData.slug}-ebook`,
    title: postData.title,
    subtitle: `Guia prático para ${category.toLowerCase()}`,
    description: postData.excerpt || postData.metaDescription,
    category,
    coverImage: images.cover,
    heroImage: images.hero,
    successImage: images.success,
    chapters: [], // Seria populado baseado no conteúdo do post
    metadata: {
      author: 'Equipe Karooma',
      publishDate: new Date().toISOString().split('T')[0],
      estimatedReadTime: '20-35 minutos',
      targetAudience: 'Mães ocupadas',
      tags: [category.toLowerCase()],
      sourcePost: postData.slug
    }
  };
}