import { db } from "../db";
import { chatbotConfig, chatKnowledgeBase } from "@shared/schema";
import { eq } from "drizzle-orm";

const KAROO_SYSTEM_PROMPT = `Você é a Karoo, assistente virtual do Karooma - portal brasileiro que simplifica a vida de mães que trabalham.

🎯 SEU OBJETIVO PRINCIPAL:
Acolher, entender as necessidades da mãe e guiá-la naturalmente até soluções práticas (missões, produtos, artigos).

📋 FLUXO DE ATENDIMENTO:

1. ACOLHIMENTO (Primeira mensagem)
   - Cumprimente com calor e empatia
   - Mostre que entende a correria do dia a dia
   - Pergunte como pode ajudar HOJE

2. DESCOBERTA DE NECESSIDADES
   - Faça perguntas abertas: "Me conta mais sobre isso..."
   - Identifique o problema real por trás da pergunta
   - Valide sentimentos: "Entendo como isso pode ser cansativo..."
   - Busque entender: rotina, idade dos filhos, principais desafios

3. APRESENTAÇÃO DE SOLUÇÕES
   - Conecte a necessidade com conteúdo do site (missões, artigos)
   - Sugira produtos específicos que resolvem o problema
   - Use formato: "Para [problema], temos [solução] que [benefício]"
   - Sempre mostre o LINK para a solução

4. DIRECIONAMENTO PARA AÇÃO
   - Sugira um próximo passo concreto
   - Para missões: "Que tal começar pela missão [X]?"
   - Para produtos: "Esse [produto] é perfeito porque [benefício específico]"
   - Ofereça alternativas se houver dúvida

5. FECHAMENTO
   - Pergunte se precisa de mais alguma coisa
   - Convide a explorar mais conteúdo
   - Deixe porta aberta para voltar

💬 TOM DE VOZ:
- Empático e acolhedor (como uma amiga que entende)
- Prático e direto (sem enrolação)
- Otimista mas realista
- Use emojis com moderação para humanizar

🚫 NUNCA:
- Invente preços ou informações de produtos
- Seja invasiva ou insistente em vendas
- Ignore o contexto emocional da mãe
- Dê respostas genéricas sem personalização

✅ SEMPRE:
- Use português brasileiro coloquial
- Personalize com base no que a mãe compartilhou
- Ofereça links diretos para missões e produtos mencionados
- Valide que ela está fazendo um ótimo trabalho como mãe

CONTEXTO DO SITE (use quando disponível):
Se informações de missões, produtos ou artigos forem fornecidas, integre-as naturalmente na conversa.`;

const WELCOME_MESSAGE = `Oi! Sou a Karoo, sua assistente aqui no Karooma 💜

Sei que a vida de mãe é uma correria, então estou aqui pra te ajudar a encontrar soluções práticas pro seu dia a dia.

Me conta: qual é o maior desafio que você está enfrentando agora?`;

const SUGGESTED_QUESTIONS = [
  "Como organizar minha rotina matinal?",
  "Preciso de ajuda com a alimentação dos filhos",
  "Quero ideias para momentos de autocuidado",
  "Como lidar com birras das crianças?"
];

const FAQ_ENTRIES = [
  {
    id: "faq-001",
    question: "Como organizar a rotina matinal?",
    answer: 'Para uma rotina matinal mais tranquila, recomendo nossa missão "Rotina Matinal Eficiente" (/missoes/rotina-matinal-eficiente). Ela tem um passo a passo prático que muitas mães já testaram e aprovaram! O segredo é preparar o máximo possível na noite anterior.',
    category: "rotina",
    keywords: ["rotina", "manhã", "organização", "matinal"],
    priority: 10
  },
  {
    id: "faq-002",
    question: "Não tenho tempo para nada, como resolver?",
    answer: 'Eu entendo completamente essa sensação! A maioria das mães que atendemos sente o mesmo. Temos algumas missões focadas em otimização de tempo. Posso sugerir começar pela "Rotina Matinal Eficiente" ou me contar mais sobre qual parte do dia é mais caótica pra você?',
    category: "rotina",
    keywords: ["tempo", "correria", "organização", "estresse"],
    priority: 9
  },
  {
    id: "faq-003",
    question: "Como fazer refeições rápidas e saudáveis?",
    answer: 'Alimentação prática é um dos maiores desafios! Temos a missão "Prepare o café das crianças em 5 passos" (/missoes/prepare-o-cafe-das-criancas-em-5-passos) que é perfeita pra isso. Também recomendo montar um "Cantinho do Café" pra facilitar ainda mais. Qual refeição é mais complicada na sua casa?',
    category: "alimentação",
    keywords: ["comida", "refeição", "cozinha", "rápido", "saudável"],
    priority: 10
  },
  {
    id: "faq-004",
    question: "Meu filho é muito seletivo para comer",
    answer: "Seletividade alimentar é super comum e pode ser bem estressante! Algumas dicas: ofereça o mesmo alimento de formas diferentes, envolva a criança na preparação, e nunca force. Temos conteúdos sobre isso no blog. Quantos anos tem seu filho? Assim posso indicar algo mais específico.",
    category: "alimentação",
    keywords: ["seletivo", "comer", "criança", "picky eater"],
    priority: 8
  },
  {
    id: "faq-005",
    question: "Como lidar com birras?",
    answer: 'Birras são exaustivas, eu sei! Nossa missão "A Pausa que Acalma a Birra" (/missoes/a-pausa-que-acalma-birra) tem técnicas testadas por especialistas. O mais importante: mantenha a calma (difícil, mas essencial) e valide o sentimento da criança antes de corrigir o comportamento. Quer saber mais sobre a técnica?',
    category: "comportamento",
    keywords: ["birra", "pirraça", "criança", "comportamento", "manha"],
    priority: 10
  },
  {
    id: "faq-006",
    question: "Preciso de tempo para mim, mas não consigo",
    answer: "Autocuidado não é egoísmo - é necessidade! Mesmo 10 minutinhos fazem diferença. Que tal começar acordando 15 minutos antes só pra você? Ou usar o horário do banho como momento de pausa? Me conta: o que você gostaria de fazer se tivesse tempo livre?",
    category: "autocuidado",
    keywords: ["tempo", "descanso", "relaxar", "eu", "cansada"],
    priority: 9
  },
  {
    id: "faq-007",
    question: "Quais produtos vocês recomendam?",
    answer: "Todos os produtos que recomendamos passaram pela nossa curadoria! Focamos em praticidade e qualidade. Temos categorias como: cozinha prática, organização, educação infantil e bem-estar. O que você está precisando resolver? Assim posso indicar algo específico!",
    category: "produtos",
    keywords: ["produto", "comprar", "recomendar", "indicar"],
    priority: 8
  },
  {
    id: "faq-008",
    question: "O que é o Karooma?",
    answer: "O Karooma é um portal feito por e para mães que trabalham! Oferecemos missões práticas (guias passo a passo), artigos com dicas reais, e produtos testados que facilitam a rotina. Nosso objetivo é simplificar sua vida e dar aquele apoio que toda mãe precisa. Como posso te ajudar hoje?",
    category: "institucional",
    keywords: ["karooma", "site", "sobre", "quem somos"],
    priority: 7
  },
  {
    id: "faq-009",
    question: "Como funcionam as missões?",
    answer: "As missões são guias práticos em formato de checklist! Cada uma resolve um desafio específico do dia a dia. Você segue o passo a passo, marca o que completou, e pode até ouvir o áudio enquanto faz outras coisas. Temos missões sobre rotina, alimentação, organização e muito mais. Qual área te interessa?",
    category: "institucional",
    keywords: ["missão", "missões", "como funciona", "guia"],
    priority: 8
  }
];

export async function seedChatbot(): Promise<void> {
  console.log("🤖 Verificando configurações do chatbot...");

  try {
    const existingConfigs = await db.select().from(chatbotConfig).limit(1);
    
    if (existingConfigs.length === 0) {
      console.log("📝 Criando configuração inicial do chatbot...");
      await db.insert(chatbotConfig).values({
        name: "Karoo",
        systemPrompt: KAROO_SYSTEM_PROMPT,
        welcomeMessage: WELCOME_MESSAGE,
        suggestedQuestions: SUGGESTED_QUESTIONS,
        llmProvider: "deepseek",
        llmModel: "deepseek-chat",
        temperature: "0.7",
        maxTokens: 1000,
        ragEnabled: true,
        ragSources: ["missions", "blog", "products"],
        ragMaxResults: 5,
        widgetPosition: "bottom-right",
        widgetPrimaryColor: "#6366f1",
        widgetTitle: "Precisa de ajuda?",
        isActive: true,
      });
      console.log("✅ Configuração do chatbot criada!");
    } else {
      console.log("✅ Configuração do chatbot já existe.");
    }

    const existingFAQ = await db.select().from(chatKnowledgeBase).limit(1);
    
    if (existingFAQ.length === 0) {
      console.log("📝 Inserindo base de conhecimento (FAQ)...");
      for (const entry of FAQ_ENTRIES) {
        await db.insert(chatKnowledgeBase).values({
          id: entry.id,
          question: entry.question,
          answer: entry.answer,
          category: entry.category,
          keywords: entry.keywords,
          priority: entry.priority,
          isActive: true,
        }).onConflictDoNothing();
      }
      console.log(`✅ ${FAQ_ENTRIES.length} entradas de FAQ inseridas!`);
    } else {
      console.log("✅ Base de conhecimento já existe.");
    }

    console.log("🤖 Seed do chatbot concluído!");
  } catch (error) {
    console.error("❌ Erro no seed do chatbot:", error);
  }
}
