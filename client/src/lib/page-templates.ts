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