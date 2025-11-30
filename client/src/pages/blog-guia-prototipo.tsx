import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Sun, 
  Clock, 
  Heart, 
  Calendar,
  Play,
  Pause,
  Volume2,
  BookOpen,
  Brain,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Quote,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export default function BlogGuiaPrototipo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(225); // 3:45 em segundos
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const missoes = [
    {
      slug: "prepare-o-cafe-da-manha-na-vespera",
      title: "Prepare o Café da Manhã na Véspera",
      time: "20 min",
      tasks: 5,
      impact: "Alto",
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=200&fit=crop"
    },
    {
      slug: "roupa-do-dia-anterior",
      title: "Roupa do Dia Anterior",
      time: "5 min",
      tasks: 3,
      impact: "Alto",
      image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=200&fit=crop"
    },
    {
      slug: "checklist-da-porta",
      title: "Checklist da Porta",
      time: "10 min",
      tasks: 4,
      impact: "Médio",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero do Post */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 py-12 md:py-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-200 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <Link href="/blog" className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar para Blog</span>
          </Link>
          
          <div className="max-w-4xl">
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-800 dark:text-amber-200 border-0 px-4 py-2">
                <Sun className="w-4 h-4 mr-2" />
                Rotina Matinal
              </Badge>
            </motion.div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Por Que Acordar é Uma Batalha<br />
              <span className="text-amber-600 dark:text-amber-400">(E Como Mudar Isso)</span>
            </motion.h1>
            
            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>8 min de leitura</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>30 Nov 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>2.4k leituras</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Audio Player - Resumo em Áudio */}
      <section className="py-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-4 md:p-6"
              data-section="audio-player"
            >
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex-shrink-0"
                  data-testid="audio-play-button"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Resumo em Áudio</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={handleSeek}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            
            {/* Seção: Eu Te Entendo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Eu Te Entendo
                </h2>
              </div>
              
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 md:p-8 border border-rose-100 dark:border-gray-700">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  São 6:30 da manhã. Você acabou de acordar – ou melhor, foi acordada. O caçula está chorando, 
                  o do meio não quer sair da cama, e a mais velha ainda não escolheu a roupa. O café está 
                  esfriando pela terceira vez.
                </p>
                
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  <strong>Você não está sozinha.</strong> Milhares de mães brasileiras passam exatamente por isso 
                  toda manhã. E não, não é porque você está fazendo algo errado.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Café frio (de novo) na mesa",
                    "Criança que \"não quer acordar\"",
                    "Mochila sem o lanche",
                    "Correria que começa antes do sol"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Seção: O Que a Ciência Diz */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  O Que a Ciência Diz
                </h2>
              </div>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  A neurociência explica: nosso cérebro toma cerca de <strong>35.000 decisões por dia</strong>. 
                  Pela manhã, quando ainda estamos acordando, cada pequena escolha ("o que vestir?", "o que comer?") 
                  consome energia mental preciosa.
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">30 min</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">economizados com preparação noturna</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">50%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">menos estresse matinal</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">85%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">eficácia da luz gradual para acordar</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Citação */}
              <blockquote className="relative bg-gradient-to-r from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-6 mt-8">
                <Quote className="absolute top-4 left-4 w-8 h-8 text-amber-300 dark:text-amber-600" />
                <p className="text-xl italic text-gray-800 dark:text-gray-200 leading-relaxed pl-8">
                  "A paz da manhã define o ritmo do dia inteiro. Comece leve."
                </p>
                <footer className="mt-4 pl-8 text-gray-600 dark:text-gray-400">
                  — Filosofia Karooma
                </footer>
              </blockquote>
            </motion.section>

            {/* Seção: Entendendo o Problema */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Por Que Suas Manhãs São Assim
                </h2>
              </div>
              
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      O Efeito Dominó Invertido
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Quando a noite anterior não é planejada, a manhã seguinte já começa atrasada. 
                      É como um dominó ao contrário: cada decisão adiada à noite cria duas decisões 
                      de manhã – quando você menos tem tempo para pensar.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      O Ritmo Circadiano das Crianças
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Crianças têm relógios biológicos diferentes dos adultos. Forçar um despertar 
                      abrupto ativa o sistema de "luta ou fuga" – e o resultado são as birras matinais.
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sono recomendado por idade:</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">1-3 anos:</span>
                          <span className="font-medium text-gray-900 dark:text-white">11-14 horas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">3-5 anos:</span>
                          <span className="font-medium text-gray-900 dark:text-white">10-13 horas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">6-12 anos:</span>
                          <span className="font-medium text-gray-900 dark:text-white">9-12 horas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Adolescentes:</span>
                          <span className="font-medium text-gray-900 dark:text-white">8-10 horas</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.section>

            {/* Seção: A Boa Notícia */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  A Boa Notícia
                </h2>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 md:p-8 border border-green-100 dark:border-gray-700">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  <strong>Pequenas mudanças podem transformar suas manhãs.</strong> Não precisa de uma 
                  revolução – apenas de estratégias certas, no momento certo.
                </p>
                
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  A pesquisa mostra que <strong>15 minutos de preparação à noite</strong> economizam 
                  até <strong>30 minutos de caos pela manhã</strong>. E mais: reduzem brigas, esquecimentos 
                  e aquela sensação de começar o dia já esgotada.
                </p>
              </div>
            </motion.section>

          </div>
        </div>
      </article>

      {/* CTA: Missões Recomendadas */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                <Sparkles className="w-4 h-4 mr-2" />
                Da Teoria à Prática
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Missões Recomendadas
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Agora que você entende o problema, é hora de agir. 
                Escolha uma missão e transforme sua rotina matinal hoje.
              </p>
            </motion.div>
            
            {/* Mission Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {missoes.map((missao, i) => (
                <motion.div
                  key={missao.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/missoes/${missao.slug}`}>
                    <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden bg-white dark:bg-gray-800">
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={missao.image}
                          alt={missao.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge className={`absolute top-3 right-3 border-0 ${
                          missao.impact === 'Alto' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          Impacto {missao.impact}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                          {missao.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{missao.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{missao.tasks} tarefas</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
                          data-testid={`cta-mission-${missao.slug}`}
                        >
                          Começar Missão
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Ver Todas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link href="/missoes?category=Rotina%20Matinal">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-8 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  Ver Todas as Missões de Rotina Matinal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Posts Relacionados */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Continue Lendo
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { category: "Casa em Ordem", emoji: "🏠", title: "A pia brilhante que muda sua mentalidade", color: "bg-blue-100 dark:bg-blue-900/30" },
                { category: "Tempo para Mim", emoji: "💆", title: "Burnout materno: você não é fraca", color: "bg-purple-100 dark:bg-purple-900/30" }
              ].map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <Badge className={`mb-3 ${post.color} border-0`}>
                        <span className="mr-2">{post.emoji}</span>
                        {post.category}
                      </Badge>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {post.title}
                      </h4>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
