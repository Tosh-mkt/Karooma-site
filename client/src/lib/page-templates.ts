import { PageTemplate, SectionType } from "@/types/page-builder";

// Tipos de seções disponíveis
export const sectionTypes: SectionType[] = [
  {
    id: 'hero',
    name: 'Hero Section',
    category: 'Cabeçalhos',
    description: 'Seção principal com título, subtítulo e botões',
    preview: '/templates/hero-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título Principal',
        placeholder: 'Ex: Você Não Está Sozinha',
        required: true
      },
      {
        id: 'subtitle',
        name: 'subtitle', 
        type: 'textarea',
        label: 'Subtítulo',
        placeholder: 'Descrição que aparece abaixo do título'
      },
      {
        id: 'backgroundImage',
        name: 'backgroundImage',
        type: 'image',
        label: 'Imagem de Fundo'
      },
      {
        id: 'primaryButtonText',
        name: 'primaryButtonText',
        type: 'text',
        label: 'Texto do Botão Principal',
        placeholder: 'Começar Jornada'
      },
      {
        id: 'primaryButtonLink',
        name: 'primaryButtonLink',
        type: 'text',
        label: 'Link do Botão Principal',
        placeholder: '/blog'
      },
      {
        id: 'secondaryButtonText',
        name: 'secondaryButtonText',
        type: 'text',
        label: 'Texto do Botão Secundário',
        placeholder: 'Saber Mais'
      },
      {
        id: 'secondaryButtonLink',
        name: 'secondaryButtonLink',
        type: 'text',
        label: 'Link do Botão Secundário',
        placeholder: '/sobre'
      }
    ],
    defaultData: {
      title: 'Você Não Está Sozinha',
      subtitle: 'Compartilhamos a jornada da maternidade real, com dicas práticas para o dia a dia e momentos de autocuidado que fazem toda diferença.',
      backgroundImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1920&h=800',
      primaryButtonText: 'Começar Jornada',
      primaryButtonLink: '/blog',
      secondaryButtonText: 'Saber Mais', 
      secondaryButtonLink: '/sobre'
    }
  },
  {
    id: 'content',
    name: 'Seção de Conteúdo',
    category: 'Conteúdo',
    description: 'Texto corrido com formatação rich text',
    preview: '/templates/content-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título da Seção'
      },
      {
        id: 'content',
        name: 'content',
        type: 'textarea',
        label: 'Conteúdo',
        required: true
      },
      {
        id: 'alignment',
        name: 'alignment',
        type: 'select',
        label: 'Alinhamento',
        options: ['left', 'center', 'right']
      }
    ],
    defaultData: {
      title: 'Nossa História',
      content: 'Escreva aqui o conteúdo da seção...',
      alignment: 'left'
    }
  },
  {
    id: 'featured-content',
    name: 'Conteúdo em Destaque', 
    category: 'Conteúdo',
    description: 'Mostra posts ou produtos em destaque',
    preview: '/templates/featured-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título da Seção',
        required: true
      },
      {
        id: 'contentType',
        name: 'contentType',
        type: 'select',
        label: 'Tipo de Conteúdo',
        options: ['blog', 'products', 'videos'],
        required: true
      },
      {
        id: 'limit',
        name: 'limit',
        type: 'number',
        label: 'Quantidade de Items',
        validation: { min: 1, max: 12 }
      }
    ],
    defaultData: {
      title: 'Últimos Posts',
      contentType: 'blog',
      limit: 3
    }
  },
  {
    id: 'gallery',
    name: 'Galeria de Imagens',
    category: 'Visual', 
    description: 'Grade de imagens com legendas',
    preview: '/templates/gallery-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título da Galeria'
      },
      {
        id: 'columns',
        name: 'columns',
        type: 'select',
        label: 'Número de Colunas',
        options: ['2', '3', '4']
      },
      {
        id: 'images',
        name: 'images',
        type: 'textarea',
        label: 'URLs das Imagens (uma por linha)'
      }
    ],
    defaultData: {
      title: 'Galeria',
      columns: '3',
      images: ''
    }
  },
  {
    id: 'landing-hero',
    name: 'Hero Landing Page',
    category: 'Landing',
    description: 'Hero específico para landing page com formulário integrado',
    preview: '/templates/landing-hero-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título Principal',
        placeholder: 'Ex: Guia das 5 Soluções',
        required: true
      },
      {
        id: 'subtitle',
        name: 'subtitle',
        type: 'textarea',
        label: 'Subtítulo',
        placeholder: 'Descrição do problema que você resolve'
      },
      {
        id: 'backgroundImage',
        name: 'backgroundImage',
        type: 'image',
        label: 'Imagem de Fundo'
      },
      {
        id: 'formTitle',
        name: 'formTitle',
        type: 'text',
        label: 'Título do Formulário',
        placeholder: 'Receba o Guia Gratuito'
      },
      {
        id: 'formSubtitle',
        name: 'formSubtitle',
        type: 'text',
        label: 'Subtítulo do Formulário'
      }
    ],
    defaultData: {
      title: 'Guia das 5 Soluções para a Mãe Ocupada',
      subtitle: 'Estratégias práticas testadas por mães reais para organizar a rotina familiar sem perder a sanidade',
      backgroundImage: '',
      formTitle: 'Receba o Guia Gratuito',
      formSubtitle: 'Enviado direto para seu email em segundos'
    }
  },
  {
    id: 'benefits-grid',
    name: 'Grid de Benefícios',
    category: 'Landing',
    description: 'Grade de benefícios com ícones e descrições',
    preview: '/templates/benefits-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título da Seção',
        required: true
      },
      {
        id: 'benefits',
        name: 'benefits',
        type: 'textarea',
        label: 'Benefícios (JSON)',
        placeholder: '[{"icon":"⏰","title":"Economia de Tempo","description":"Reduza 2h diárias..."}]'
      }
    ],
    defaultData: {
      title: 'O que você vai conquistar:',
      benefits: '[{"icon":"⏰","title":"Economia de Tempo","description":"Reduza 2h diárias na organização doméstica"},{"icon":"🧘‍♀️","title":"Menos Estresse","description":"Estratégias para manter a calma nos momentos caóticos"},{"icon":"👨‍👩‍👧‍👦","title":"Família Organizada","description":"Rotinas que funcionam para toda a família"},{"icon":"💆‍♀️","title":"Tempo para Você","description":"Encontre momentos de autocuidado na rotina"}]'
    }
  },
  {
    id: 'testimonials',
    name: 'Depoimentos',
    category: 'Landing',
    description: 'Seção de depoimentos de clientes satisfeitos',
    preview: '/templates/testimonials-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título da Seção'
      },
      {
        id: 'testimonials',
        name: 'testimonials',
        type: 'textarea',
        label: 'Depoimentos (JSON)',
        placeholder: '[{"name":"Ana","role":"Mãe de 2","quote":"Mudou nossa rotina...","avatar":""}]'
      }
    ],
    defaultData: {
      title: 'Mães que já transformaram suas rotinas:',
      testimonials: '[{"name":"Ana Paula","role":"Mãe de 2 (4 e 7 anos)","quote":"Finalmente consegui organizar nossa rotina matinal. As crianças agora se preparam sozinhas e sobra tempo para um café tranquilo!","avatar":""},{"name":"Mariana","role":"Mãe de 3 (2, 5 e 8 anos)","quote":"O guia me mostrou que pequenas mudanças fazem grande diferença. Agora tenho 1h livre todas as noites para cuidar de mim.","avatar":""},{"name":"Cláudia","role":"Mãe de 3 (10, 6 e 2 anos)","quote":"As estratégias são realmente práticas. Consegui envolver toda a família na organização da casa de forma divertida!","avatar":""}]'
    }
  },
  {
    id: 'newsletter-form',
    name: 'Formulário Newsletter',
    category: 'Landing',
    description: 'Formulário standalone de captura de newsletter',
    preview: '/templates/newsletter-preview.jpg',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: 'text',
        label: 'Título',
        required: true
      },
      {
        id: 'subtitle',
        name: 'subtitle',
        type: 'text',
        label: 'Subtítulo'
      },
      {
        id: 'buttonText',
        name: 'buttonText',
        type: 'text',
        label: 'Texto do Botão',
        placeholder: 'Receber Guia Gratuito'
      },
      {
        id: 'disclaimer',
        name: 'disclaimer',
        type: 'text',
        label: 'Aviso Legal',
        placeholder: 'Sem spam. Cancele quando quiser.'
      }
    ],
    defaultData: {
      title: 'Receba o Guia Gratuito',
      subtitle: 'Enviado direto para seu email em segundos',
      buttonText: 'Receber Guia Gratuito',
      disclaimer: 'Sem spam. Cancele quando quiser.'
    }
  }
];

// Templates de página pré-definidos
export const pageTemplates: PageTemplate[] = [
  {
    id: 'homepage',
    name: 'Página Inicial',
    description: 'Template completo para página inicial',
    preview: '/templates/homepage-preview.jpg',
    sections: [
      {
        id: '1',
        type: 'hero',
        name: 'Hero Principal',
        position: 0,
        data: sectionTypes.find(s => s.id === 'hero')?.defaultData || {}
      },
      {
        id: '2', 
        type: 'featured-content',
        name: 'Posts em Destaque',
        position: 1,
        data: {
          title: 'Últimos Posts',
          contentType: 'blog',
          limit: 3
        }
      },
      {
        id: '3',
        type: 'featured-content', 
        name: 'Produtos em Destaque',
        position: 2,
        data: {
          title: 'Produtos Recomendados',
          contentType: 'products',
          limit: 4
        }
      }
    ]
  },
  {
    id: 'about',
    name: 'Página Sobre',
    description: 'Template para página institucional',
    preview: '/templates/about-preview.jpg', 
    sections: [
      {
        id: '1',
        type: 'hero',
        name: 'Cabeçalho Sobre',
        position: 0,
        data: {
          title: 'Sobre Nós',
          subtitle: 'Conheça nossa história e missão',
          backgroundImage: 'https://images.unsplash.com/photo-1516627145497-ae5bf4ec4fdc?auto=format&fit=crop&w=1920&h=600',
          primaryButtonText: '',
          primaryButtonLink: '',
          secondaryButtonText: '',
          secondaryButtonLink: ''
        }
      },
      {
        id: '2',
        type: 'content',
        name: 'Conteúdo Principal',
        position: 1,
        data: {
          title: 'Nossa Missão',
          content: 'Conte sua história aqui...',
          alignment: 'left'
        }
      },
      {
        id: '3',
        type: 'gallery',
        name: 'Galeria de Momentos',
        position: 2,
        data: {
          title: 'Momentos Especiais',
          columns: '3',
          images: ''
        }
      }
    ]
  },
  {
    id: 'blank',
    name: 'Página em Branco',
    description: 'Comece do zero',
    preview: '/templates/blank-preview.jpg',
    sections: []
  }
];

// Função para obter tipo de seção
export const getSectionType = (typeId: string): SectionType | undefined => {
  return sectionTypes.find(type => type.id === typeId);
};

// Função para obter template
export const getPageTemplate = (templateId: string): PageTemplate | undefined => {
  return pageTemplates.find(template => template.id === templateId);
};