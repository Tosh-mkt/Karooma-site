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
import { getFlipbookTheme } from '@shared/flipbook-themes';

// Usar o tema de bem-estar para alimentação
const alimentacaoTheme = getFlipbookTheme('bem-estar');
const alimentacaoColorScheme = alimentacaoTheme.colors;

export function AlimentacaoFlipbook() {
  const pages = [
    {
      id: 'cover',
      content: <CoverPage colorScheme={alimentacaoColorScheme} />
    },
    {
      id: 'welcome',
      content: <WelcomePage colorScheme={alimentacaoColorScheme} />
    },
    {
      id: 'toc',
      content: <TableOfContentsPage colorScheme={alimentacaoColorScheme} />
    },
    {
      id: 'chapter1',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={1}
          title="Por que investir em refeições rápidas?"
          icon="💭"
          content="Chegar em casa depois de um dia corrido e ainda ter que preparar o jantar pode ser desafiador.

Mas investir em refeições rápidas e nutritivas traz benefícios reais:

• **Economia**: Cozinhar em casa é mais barato que pedir delivery
• **Saúde**: Você controla os ingredientes e temperos  
• **Tempo de qualidade**: As crianças podem ajudar na preparação
• **Menos estresse**: Ter um plano reduz a ansiedade do 'o que vamos comer hoje?'"
          image="/api/images/generated_images/Baby_sleep_chaos_origami_9f730555.png"
        />
      )
    },
    {
      id: 'checklist1',
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Mudança de Mindset"
          items={[
            {
              text: "Aceitar que refeições nutritivas podem ser simples",
              category: "easy",
              time: "Agora mesmo"
            },
            {
              text: "Focar em ingredientes de qualidade, não em complexidade",
              category: "easy", 
              time: "5 min"
            },
            {
              text: "Planejar pelo menos 3 refeições por semana",
              category: "medium",
              time: "20 min"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter2',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={2}
          title="5 Receitas que salvam o jantar"
          icon="🍽️"
          content="**1. Omelete Recheada (8 minutos)**
4 ovos + tomate + queijo + presunto = jantar pronto!

**2. Macarrão com Molho Fresco (15 minutos)**  
Enquanto a água ferve, refogue alho e tomate. Simples e delicioso.

**3. Frango Desfiado no Liquidificador (12 minutos)**
Use sobras de frango + caldo + temperos. Bata, aqueça e sirva.

**4. Wrap de Atum (5 minutos)**
Tortilha + atum + vegetais + cream cheese. As crianças adoram!

**5. Sopa de Legumes Expressa (20 minutos)**
Legumes congelados + caldo pronto + macarrão pequeno."
          image="/api/images/generated_images/Baby_sleep_peace_origami_c25441c5.png"
        />
      )
    },
    {
      id: 'checklist2',
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Receitas Rápidas"
          items={[
            {
              text: "Testar a receita de omelete recheada",
              category: "easy",
              time: "8 min"
            },
            {
              text: "Fazer macarrão com molho fresco para a família",
              category: "easy",
              time: "15 min"
            },
            {
              text: "Experimentar wrap de atum com as crianças",
              category: "easy",
              time: "5 min"
            },
            {
              text: "Preparar sopa de legumes para a semana",
              category: "medium",
              time: "20 min"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter3',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={3}
          title="Planejamento semanal inteligente"
          icon="📅"
          content="**Planejamento Dominical (30 minutos):**

1. **Liste as refeições da semana** - apenas jantar já faz diferença
2. **Faça compras baseadas no cardápio** - sem desperdício
3. **Deixe ingredientes básicos sempre em casa** - sua segurança alimentar

**Dica de ouro:** Não planeje 7 jantares diferentes. Repita receitas que funcionam!"
        />
      )
    },
    {
      id: 'checklist3', 
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Planejamento Semanal"
          items={[
            {
              text: "Escolher 4-5 receitas para a semana",
              category: "easy",
              time: "15 min"
            },
            {
              text: "Fazer lista de compras baseada no cardápio",
              category: "easy",
              time: "10 min"
            },
            {
              text: "Reservar domingo para planejamento",
              category: "medium",
              time: "30 min/semana"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter4',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={4}
          title="Pré-preparo que funciona"
          icon="⚡"
          content="**Fim de semana estratégico:**

• **Corte legumes** e guarde na geladeira (duram 3-4 dias)
• **Cozinhe grãos em quantidade** - arroz e feijão congelam bem
• **Mantenha proteínas prontas**: ovos cozidos, frango desfiado

**Regra de ouro:** Prepare componentes, não refeições completas. Assim você tem flexibilidade durante a semana."
        />
      )
    },
    {
      id: 'checklist4',
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Pré-preparo Inteligente"
          items={[
            {
              text: "Cortar legumes para 3 dias e guardar na geladeira",
              category: "medium",
              time: "20 min"
            },
            {
              text: "Cozinhar arroz e feijão em quantidade e congelar",
              category: "medium", 
              time: "40 min"
            },
            {
              text: "Deixar ovos cozidos prontos na geladeira",
              category: "easy",
              time: "15 min"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter5',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={5}
          title="Despensa salvadora"
          icon="🥫"
          content="**Secos que salvam:**
• Massas variadas, arroz, quinoa
• Lentilha e grão de bico em conserva  
• Temperos básicos

**Geladeira/Freezer essenciais:**
• Ovos sempre frescos
• Queijos variados
• Legumes congelados
• Carnes já temperadas e porcionadas

**Enlatados estratégicos:**
• Atum, sardinha
• Molho de tomate pronto
• Milho, ervilha, caldo de legumes"
        />
      )
    },
    {
      id: 'checklist5',
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Despensa Estratégica"
          items={[
            {
              text: "Montar lista de básicos para sempre ter em casa",
              category: "easy",
              time: "10 min"
            },
            {
              text: "Organizar geladeira com proteínas prontas",
              category: "medium",
              time: "30 min"
            },
            {
              text: "Criar sistema de rotação de enlatados",
              category: "advanced",
              time: "1 hora"
            }
          ]}
        />
      )
    },
    {
      id: 'chapter6',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={6}
          title="Envolvendo as crianças"
          icon="👨‍👩‍👧‍👦"
          content="Cozinhar pode ser tempo de qualidade em família:

**Crianças pequenas (3-6 anos):**
• Lavar legumes, misturar ingredientes

**Crianças maiores (7+ anos):**  
• Cortar ingredientes macios, montar sanduíches

**Adolescentes:**
• Fazer receitas completas

**Benefício extra:** Crianças que ajudam a cozinhar comem melhor!"
        />
      )
    },
    {
      id: 'checklist6',
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Cozinhando em Família"
          items={[
            {
              text: "Definir tarefas apropriadas para cada idade",
              category: "easy",
              time: "10 min"
            },
            {
              text: "Escolher uma receita para fazer junto no fim de semana",
              category: "medium",
              time: "45 min"
            },
            {
              text: "Ensinar uma receita simples para cada filho",
              category: "advanced",
              time: "1 mês"
            }
          ]}
        />
      )
    },
    {
      id: 'testimonials',
      content: <TestimonialPage colorScheme={alimentacaoColorScheme} />
    },
    {
      id: 'chapter7',
      content: (
        <ChapterPage
          colorScheme={alimentacaoColorScheme}
          chapterNumber={7}
          title="O segredo da simplicidade"
          icon="✨"
          content="Lembrem-se: uma refeição nutritiva não precisa ter 20 ingredientes.

**O importante é:**
• Ter sempre proteína (ovo, queijo, carne, leguminosa)
• Incluir vegetais (mesmo que seja tomate no sanduíche)  
• Oferecer carboidratos de qualidade (integral quando possível)
• Manter-se hidratada e não se cobrar perfeição

**Alguns dias vocês vão arrasar na cozinha, outros dias vai ser miojo mesmo - e está tudo bem!**"
        />
      )
    },
    {
      id: 'checklist7',
      content: (
        <ChecklistPage
          colorScheme={alimentacaoColorScheme}
          title="Checklist: Mantendo a Simplicidade"
          items={[
            {
              text: "Aceitar que nem todo dia precisa ser perfeito",
              category: "easy",
              time: "Agora mesmo"
            },
            {
              text: "Criar 3 opções de 'plano B' para dias difíceis",
              category: "medium",
              time: "15 min"
            },
            {
              text: "Focar em ingredientes de qualidade, não complexidade",
              category: "easy",
              time: "5 min"
            }
          ]}
        />
      )
    },
    {
      id: 'final',
      content: <FinalPage colorScheme={alimentacaoColorScheme} />
    }
  ];

  const handlePageChange = (pageIndex: number) => {
    // Track page views for analytics if needed
    console.log(`Viewing alimentação flipbook page ${pageIndex + 1}`);
  };

  return (
    <div className="w-full h-screen">
      <FlipbookCore 
        pages={pages} 
        colorScheme={alimentacaoColorScheme}
        onPageChange={handlePageChange}
      />
    </div>
  );
}