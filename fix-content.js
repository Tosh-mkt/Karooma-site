// Script para limpar URLs brutas do conteúdo e converter para markdown
const content = `É hora do jantar. Você mal sentou para respirar e já se levanta de novo. Tem que fazer o arroz, cortar os legumes, responder a mensagem da escola no celular, pensar na roupa das crianças para amanhã e, claro, lembrar de pegar o remédio do filho mais novo na farmácia. Tudo ao mesmo tempo. A louça da manhã ainda está na pia. As meias sujas do seu filho de 10 anos, espalhadas na sala. E você está ali, no centro do furacão, tentando manter tudo em pé, enquanto a sua cabeça não para de listar "coisas a fazer".

A sensação de ser a única pessoa na casa com uma lista de tarefas infinita, que ninguém mais parece ver, é quase palpável. É a famosa carga mental. Aquele peso invisível que só nós, mães, carregamos. Não é só sobre fazer as coisas, é sobre lembrar de fazer, planejar, organizar e garantir que tudo aconteça como deveria.

## Carga Mental: O Que É e Por Que Só Nós Sentimos?

A carga mental é essa responsabilidade constante de **gerenciar a vida familiar**. É você que lembra que o leite está acabando, que a reunião escolar é na quinta, que o aniversário da sogra é semana que vem. Enquanto o seu parceiro pode simplesmente "desligar" ao final do dia, a sua mente continua trabalhando, organizando e planejando.

Não é culpa de ninguém específico, mas nossa sociedade ainda coloca essa responsabilidade principalmente nos ombros das mulheres. E isso é **exaustivo**. É como se você fosse a CEO invisível da sua própria casa, tomando mil micro-decisões por dia sem nem se dar conta.

## 5 Estratégias Práticas Para Aliviar o Peso

### 1. **Liste e Delegue**
Pegue uma folha de papel e anote **tudo** que você faz em um dia típico. Desde "fazer café" até "lembrar da consulta médica". Depois, circule o que pode ser delegado. Não precisa ser perfeito, apenas feito.

### 2. **Crie Sistemas Automáticos**
Estabeleça rotinas que funcionem sozinhas:
- Segunda: lavar roupa
- Terça: compras online
- Sábado: cada um arruma o próprio quarto

### 3. **Use a Tecnologia a Seu Favor**
Coloque lembretes no celular para **tudo**. Agenda médica, aniversários, até "comprar pão". Se está na sua cabeça, está no lugar errado. Tem que estar no calendário.

### 4. **Pratique o "Não Perfeito"**
A casa não precisa estar impecável. O jantar pode ser mais simples. As crianças podem usar a mesma roupa dois dias (se estiver limpa, claro!). **Baixe o padrão** e ganhe sanidade mental.

### 5. **Converse Sobre Divisão Real**
Sente com seu parceiro e tenham uma conversa honesta sobre quem faz o quê. Não apenas as tarefas físicas, mas também o **planejamento** por trás delas. Quem lembra de marcar consulta? Quem planeja as refeições da semana?

## Uma Reflexão Pessoal

Quando eu comecei a perceber minha própria carga mental, foi libertador e assustador ao mesmo tempo. Libertador porque finalmente tinha nome para aquela sensação de cansaço constante que não conseguia explicar. Assustador porque percebi o quanto estava carregando sozinha.

Comecei pequeno: delegando a organização da mochila escolar para minha filha de 8 anos, ensinando meu marido a planejar (e não apenas executar) o café da manhã de domingo. Não foi perfeito no início, mas com o tempo todos nós nos ajustamos. E eu recuperei um pouco da minha energia mental.

A verdade é que **você não precisa ser a coordenadora de tudo**. Sua família é capaz de assumir responsabilidades, de aprender, de contribuir de verdade. Às vezes, só precisa de um empurrãozinho (e de algumas conversas francas) para que isso aconteça como planejado, mas à peso nas minhas costas diminui mais do que eu jamais imaginei. As vezes, facilitar a vida não é prejudica, é autocuidado.

## Lembre-se Sempre: 
Você não é uma super-heroína e não precisa ser. É uma mãe incrível, que faz o melhor que pode, e isso já é mais do que suficiente. Pedir ajuda, delegar tarefas e dar a si mesma o direito de errar não te torna menos capaz. Pelo contrário, te torna mais humana, mais feliz e, no fim, mais presente para quem realmente importa. A nossa força está em admitir que não podemos dar conta de tudo sozinhas.

Porque juntas, a gente sempre encontra um jeito. 🧡`;

// Função para limpar URLs brutas
function cleanContent(text) {
  // Remove URLs standalone que começam com /objects/
  return text.replace(/^\/objects\/uploads\/[a-f0-9-]+$/gm, '');
}

console.log(cleanContent(content));