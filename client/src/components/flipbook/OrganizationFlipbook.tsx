import React from 'react';
import { FlipbookCore } from './FlipbookCore';
import { 
  CoverPage, 
  WelcomePage, 
  TableOfContentsPage, 
  ChapterPage, 
  ChecklistPage, 
  TestimonialPage, 
  FinalPage 
} from './FlipbookPages';

// Color scheme for Organization theme
const organizationColorScheme = {
  primary: '#8b5cf6', // purple-500
  secondary: '#ec4899', // pink-500
  gradient: 'from-purple-600 to-pink-600',
  background: '#ffffff',
  text: '#1f2937', // gray-800
  accent: '#f3f4f6', // gray-100
};

export function OrganizationFlipbook() {
  const pages = [
    {
      id: 'cover',
      content: <CoverPage colorScheme={organizationColorScheme} />
    },
    {
      id: 'welcome',
      content: <WelcomePage colorScheme={organizationColorScheme} />
    },
    {
      id: 'toc',
      content: <TableOfContentsPage colorScheme={organizationColorScheme} />
    },
    {
      id: 'chapter1',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={1}
          title="Por que parece impossível?"
          icon="🤯"
          content="Você já teve aquele momento em que olha para a casa e pensa 'por onde eu começo?'

A verdade é que a organização não é sobre perfeição - é sobre criar sistemas que funcionam para SUA família.

O problema não é você. O problema é que nunca ninguém te ensinou que organização é uma habilidade que se aprende, como andar de bicicleta."
          image="attached_assets/Wide_origami_home_organization_chaos_dbac14c5.png"
        />
      )
    },
    {
      id: 'checklist1',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Mudança de Mindset"
          items={[
            {
              text: "Aceitar que organização é um processo, não um destino",
              category: "easy",
              time: "5 min"
            },
            {
              text: "Parar de se comparar com casas perfeitas do Instagram",
              category: "easy",
              time: "Agora mesmo"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter2',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={2}
          title="Sistema dos 15 Minutos"
          icon="⏰"
          content="Dividir tarefas em blocos de 15 minutos torna a organização menos assustadora e mais eficiente.

Por que 15 minutos? É tempo suficiente para fazer progresso real, mas curto o bastante para não desencorajar.

Regra de ouro: Uma área por vez. Não tente organizar a casa inteira de uma vez."
          image="attached_assets/Organized_time_management_origami_2ddfbdb0.png"
        />
      )
    },
    {
      id: 'checklist2',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Sistema 15 Minutos"
          items={[
            {
              text: "Configurar timer para sessões de 15 minutos",
              category: "easy",
              time: "1 min"
            },
            {
              text: "Escolher apenas UMA área por sessão",
              category: "easy",
              time: "15 min"
            },
            {
              text: "Implementar sistema em 3 cômodos diferentes",
              category: "medium",
              time: "1 semana"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter3',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={3}
          title="Organização por Cômodos"
          icon="🏠"
          content="Cada cômodo tem sua função específica. O segredo é criar zonas funcionais.

Cozinha: Zona de preparo, zona de cocção, zona de limpeza.

Sala: Zona de relaxamento, zona de brincar, zona de trabalho.

Quarto: Zona de dormir, zona de vestir, zona de estudar."
          image="attached_assets/Wide_origami_home_organization_peace_dd648e67.png"
        />
      )
    },
    {
      id: 'checklist3',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Organização por Cômodos"
          items={[
            {
              text: "Definir zonas funcionais na cozinha",
              category: "medium",
              time: "30 min"
            },
            {
              text: "Criar sistema 'um lugar para cada coisa' na sala",
              category: "medium",
              time: "45 min"
            },
            {
              text: "Organizar guarda-roupa por categorias",
              category: "advanced",
              time: "2 horas"
            },
            {
              text: "Implementar sistema de brinquedos no quarto das crianças",
              category: "medium",
              time: "1 hora"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter4',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={4}
          title="Rotinas que se Mantêm"
          icon="🔄"
          content="A diferença entre organização temporária e permanente são as rotinas.

Rotina matinal de 10 minutos: Fazer cama, recolher roupas sujas, guardar itens fora do lugar.

Reset noturno de 15 minutos: Lavar louça, organizar sala, preparar roupas do dia seguinte."
          image="attached_assets/Morning_routine_peace_origami_51b1cbcb.png"
        />
      )
    },
    {
      id: 'checklist4',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Rotinas Sustentáveis"
          items={[
            {
              text: "Implementar rotina matinal de 10 minutos",
              category: "easy",
              time: "10 min/dia"
            },
            {
              text: "Criar reset noturno de 15 minutos",
              category: "easy",
              time: "15 min/dia"
            },
            {
              text: "Ensinar toda família a seguir as rotinas",
              category: "medium",
              time: "2 semanas"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter5',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={5}
          title="Envolvendo Toda a Família"
          icon="👨‍👩‍👧‍👦"
          content="Organização não é responsabilidade só sua. Toda família pode e deve ajudar.

Crianças de 3-6 anos: Guardar brinquedos, colocar roupa suja no cesto.

Crianças de 7-12 anos: Organizar quarto, ajudar na cozinha, cuidar dos próprios pertences.

Adolescentes: Lavar própria roupa, manter quarto organizado, ajudar nas tarefas domésticas."
          image="attached_assets/Organized_family_home_origami_28044657.png"
        />
      )
    },
    {
      id: 'checklist5',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Família Organizada"
          items={[
            {
              text: "Atribuir tarefas apropriadas para cada idade",
              category: "medium",
              time: "20 min"
            },
            {
              text: "Criar sistema de recompensas simples",
              category: "easy",
              time: "15 min"
            }
          ]}
        />
      )
    },
    {
      id: 'testimonials',
      content: <TestimonialPage colorScheme={organizationColorScheme} />
    },
    {
      id: 'chapter6',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={6}
          title="Plano de Emergência"
          icon="🚨"
          content="Às vezes a vida acontece e a casa fica bagunçada. Tenha um plano!

Reset de 5 minutos para visitas inesperadas: Recolher itens soltos, dar uma passada rápida no banheiro, organizar sala.

Reset de 20 minutos para final de semana: Focar nos 3 cômodos principais, deixar detalhes para depois."
        />
      )
    },
    {
      id: 'checklist6',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Plano de Emergência"
          items={[
            {
              text: "Criar plano de organização de emergência de 5 min",
              category: "advanced",
              time: "15 min"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter7',
      content: (
        <ChapterPage
          colorScheme={organizationColorScheme}
          chapterNumber={7}
          title="Mantendo o Sistema Funcionando"
          icon="✨"
          content="O segredo não é ser perfeita, é ser consistente.

Revisão semanal de 10 minutos: O que funcionou bem? O que precisa ajustar? Que área precisa de atenção?

Lembre-se: progresso, não perfeição. Cada pequeno passo conta."
        />
      )
    },
    {
      id: 'checklist7',
      content: (
        <ChecklistPage
          colorScheme={organizationColorScheme}
          title="Checklist: Manutenção do Sistema"
          items={[
            {
              text: "Agendar revisão semanal do sistema",
              category: "easy",
              time: "10 min/semana"
            }
          ]}
        />
      )
    },
    {
      id: 'final',
      content: <FinalPage colorScheme={organizationColorScheme} />
    }
  ];

  const handlePageChange = (pageIndex: number) => {
    // Track page views for analytics if needed
    console.log(`Viewing page ${pageIndex + 1}`);
  };

  return (
    <div className="w-full h-screen">
      <FlipbookCore 
        pages={pages} 
        colorScheme={organizationColorScheme}
        onPageChange={handlePageChange}
      />
    </div>
  );
}