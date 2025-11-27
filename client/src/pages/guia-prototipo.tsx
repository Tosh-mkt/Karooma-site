import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Sun, 
  Clock, 
  Heart, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Coffee,
  Baby,
  Utensils,
  Play,
  Star,
  Users,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuiaPrototipo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Empático */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-200 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <Link href="/missoes" className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar para Missões</span>
          </Link>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-800 dark:text-amber-200 border-0">
                <Sun className="w-4 h-4 mr-2" />
                Guia de Categoria
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Manhãs Caóticas?<br />
                <span className="text-amber-600 dark:text-amber-400">Você Não Está Sozinha</span>
              </h1>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                Acordar cedo, preparar café, vestir as crianças, encontrar a mochila, 
                lembrar do lanche... Sabemos como é. Este guia vai te ajudar a transformar 
                o caos matinal em uma rotina mais leve e organizada.
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>8 min de leitura</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5 missões relacionadas</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=600&h=400&fit=crop"
                  alt="Família na cozinha pela manhã"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bloco "Eu Te Entendo" */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 mb-6">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Eu Te Entendo
            </h2>
            
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-8 text-left">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Se você marcou no diagnóstico que <strong>"acordar é uma batalha"</strong> ou 
                que <strong>"sempre sai de casa correndo"</strong>, saiba que milhares de mães 
                passam exatamente pelo mesmo.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Coffee, text: "Café frio de novo hoje?" },
                  { icon: Baby, text: "Criança que não quer acordar?" },
                  { icon: Utensils, text: "Lanche esquecido na geladeira?" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-600 rounded-xl p-4 shadow-sm">
                    <item.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                A boa notícia? <strong>Pequenas mudanças podem transformar suas manhãs</strong>. 
                Não precisa de uma revolução – apenas de estratégias certas, no momento certo.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seções de Aprendizado */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">
              <BookOpen className="w-4 h-4 mr-2" />
              Entendendo o Problema
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Por Que Suas Manhãs São Assim?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    O Efeito Dominó Invertido
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Quando a noite anterior não é planejada, a manhã seguinte já começa atrasada. 
                    É como um dominó ao contrário: cada decisão adiada à noite cria duas decisões 
                    de manhã – quando você menos tem tempo para pensar.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Decisões que Esgotam
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Estudos mostram que tomamos cerca de 35.000 decisões por dia. Pela manhã, 
                    quando ainda estamos acordando, cada pequena escolha ("o que vestir?", 
                    "o que comer?") consome energia mental preciosa.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Citação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-12"
          >
            <blockquote className="relative bg-gradient-to-r from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-8">
              <div className="absolute -top-4 left-8 text-6xl text-amber-300 dark:text-amber-600">"</div>
              <p className="text-xl italic text-gray-800 dark:text-gray-200 leading-relaxed pl-8">
                A paz da manhã define o ritmo do dia inteiro. Comece leve.
              </p>
              <footer className="mt-4 pl-8 text-gray-600 dark:text-gray-400">
                — Filosofia Karooma
              </footer>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Bloco "Da Teoria à Prática" */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
              <Play className="w-4 h-4 mr-2" />
              Da Teoria à Prática
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Missões Para Transformar Suas Manhãs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Agora que você entende o problema, é hora de agir. 
              Escolhemos as missões mais impactantes para você começar hoje.
            </p>
          </div>
          
          {/* Missão Destaque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="absolute top-4 left-4">
                <Badge className="bg-amber-500 text-white border-0">
                  <Star className="w-4 h-4 mr-1" />
                  Missão Destaque
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&h=400&fit=crop"
                    alt="Café da manhã organizado"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 dark:to-gray-800/20" />
                </div>
                
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Prepare o Café da Manhã na Véspera
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Reduza 70% das decisões matinais preparando tudo na noite anterior. 
                    Mesa posta, lanche pronto, mochilas organizadas. Acorde apenas para executar.
                  </p>
                  
                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>20 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>5 tarefas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>2.4k mães fizeram</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
                    size="lg"
                  >
                    Começar Esta Missão
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Missões Quick Wins */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🚀 Quick Wins – Comece em 5 Minutos
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Roupa do Dia Anterior",
                  time: "5 min",
                  impact: "Alto",
                  desc: "Deixe a roupa das crianças separada antes de dormir"
                },
                {
                  title: "Cantinho do Lanche",
                  time: "10 min",
                  impact: "Médio",
                  desc: "Crie um espaço fixo para montar lanches rapidamente"
                },
                {
                  title: "Checklist da Porta",
                  time: "3 min",
                  impact: "Alto",
                  desc: "Lista visual do que não pode esquecer ao sair"
                }
              ].map((mission, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-xs">
                          {mission.time}
                        </Badge>
                        <Badge className={`text-xs border-0 ${
                          mission.impact === 'Alto' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          Impacto {mission.impact}
                        </Badge>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {mission.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {mission.desc}
                      </p>
                      
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                        <span>Ver missão</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Depoimento */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-700 rounded-3xl p-8 md:p-12"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center text-2xl">
                    👩
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                    "Achei que era impossível ter manhãs tranquilas com 3 filhos. Depois de seguir 
                    a missão do café da manhã na véspera, ganhei 30 minutos extras toda manhã. 
                    Agora até tomo meu café quente!"
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Mariana S.
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      Mãe de 3, São Paulo
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-800 dark:to-emerald-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronta Para Transformar Suas Manhãs?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Comece com uma missão simples hoje. Cada pequena mudança 
              te aproxima de manhãs mais leves e organizadas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-white text-green-700 hover:bg-green-50 rounded-full px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Começar Missão Destaque
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 rounded-full px-8"
              >
                Ver Todas as Missões da Categoria
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navegação para Outras Categorias */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Explore Outros Guias
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Casa em Ordem", emoji: "🏠", color: "bg-blue-100 dark:bg-blue-900/30" },
              { name: "Cozinha Inteligente", emoji: "🍳", color: "bg-orange-100 dark:bg-orange-900/30" },
              { name: "Tempo para Mim", emoji: "💆", color: "bg-purple-100 dark:bg-purple-900/30" },
              { name: "Saúde e Emergências", emoji: "🩺", color: "bg-red-100 dark:bg-red-900/30" }
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${cat.color} rounded-xl p-6 text-center cursor-pointer hover:scale-105 transition-transform`}
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{cat.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
