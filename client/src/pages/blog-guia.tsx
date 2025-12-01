import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  ChevronRight,
  Home,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectGuidePost, SelectMission } from "@shared/schema";

interface GuidePostWithMissions extends SelectGuidePost {
  relatedMissions?: SelectMission[];
}

const categoryIcons: Record<string, typeof Sun> = {
  "Rotina Matinal": Sun,
  "Casa em Ordem": Home,
  "Tempo para Mim": Heart,
  "Educação": BookOpen,
  "Cozinha": Users,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Rotina Matinal": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-800 dark:text-amber-200", border: "border-amber-200 dark:border-amber-800" },
  "Casa em Ordem": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-200", border: "border-blue-200 dark:border-blue-800" },
  "Tempo para Mim": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-200", border: "border-purple-200 dark:border-purple-800" },
  "Educação": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-200", border: "border-green-200 dark:border-green-800" },
  "Cozinha": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-200", border: "border-orange-200 dark:border-orange-800" },
};

export default function BlogGuia() {
  const { slug } = useParams<{ slug: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: post, isLoading, error } = useQuery<GuidePostWithMissions>({
    queryKey: ['/api/guide-posts', slug],
    enabled: !!slug,
  });

  const duration = post?.audioDuration || 225;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration && !audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const CategoryIcon = post?.category ? (categoryIcons[post.category] || Sun) : Sun;
  const categoryColor = post?.category ? (categoryColors[post.category] || categoryColors["Rotina Matinal"]) : categoryColors["Rotina Matinal"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post não encontrado</h1>
          <Link href="/blog">
            <Button>Voltar para o Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {post.audioUrl && (
        <audio ref={audioRef} src={post.audioUrl} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />
      )}

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
          
          <div className="flex gap-8 items-start">
            {/* Conteúdo à esquerda */}
            <div className="flex-1 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Badge className={`${categoryColor.bg} ${categoryColor.text} border-0 px-4 py-2`}>
                  <CategoryIcon className="w-4 h-4 mr-2" />
                  {post.categoryEmoji} {post.category}
                </Badge>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              >
                {post.title}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min de leitura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : ''}</span>
                </div>
                {post.views && post.views > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{post.views.toLocaleString('pt-BR')} leituras</span>
                  </div>
                )}
              </motion.div>
              
              {/* Audio Player - Below Title */}
              {(post.audioUrl || post.audioDuration) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
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
                        <span className="font-medium text-gray-900 dark:text-white">Ouça o Áudio</span>
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
              )}
              
              {/* Botão Favoritar e Imagem - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:hidden flex flex-col gap-4 mt-6"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-xl px-6 py-3 font-medium shadow-sm"
                  data-testid="button-favorite-guide-mobile"
                >
                  <Heart className="w-6 h-6 mr-2" />
                  Favoritar
                </Button>
                
                {post.heroImageUrl && (
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white/50">
                    <img 
                      src={post.heroImageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Imagem de Capa e Botão Favoritar à direita (apenas desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:flex flex-col items-center gap-4 flex-shrink-0"
            >
              {/* Botão Favoritar Grande */}
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-xl px-6 py-3 font-medium shadow-sm"
                data-testid="button-favorite-guide"
              >
                <Heart className="w-6 h-6 mr-2" />
                Favoritar
              </Button>
              
              {/* Imagem de Capa */}
              {post.heroImageUrl && (
                <div className="w-64 xl:w-80">
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white/50">
                    <img 
                      src={post.heroImageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            
            {/* Seção: Eu Te Entendo */}
            {post.sectionEuTeEntendo && (
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
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.sectionEuTeEntendo.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </motion.section>
            )}

            {/* Seção: O Que a Ciência Diz */}
            {post.sectionCiencia && (
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
                
                <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: post.sectionCiencia.replace(/\n/g, '<br/>') }} />
                </div>
                
                {/* Stats Cards */}
                {post.stats && post.stats.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {post.stats.map((stat, i) => (
                      <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
                        <CardContent className="p-6 text-center">
                          <div className={`text-3xl font-bold mb-2 ${stat.color || 'text-amber-600 dark:text-amber-400'}`}>
                            {stat.value}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Citação */}
                {post.quote && (
                  <blockquote className="relative bg-gradient-to-r from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-700 rounded-2xl p-6 mt-8">
                    <Quote className="absolute top-4 left-4 w-8 h-8 text-amber-300 dark:text-amber-600" />
                    <p className="text-xl italic text-gray-800 dark:text-gray-200 leading-relaxed pl-8">
                      "{post.quote}"
                    </p>
                    {post.quoteAuthor && (
                      <footer className="mt-4 pl-8 text-gray-600 dark:text-gray-400">
                        — {post.quoteAuthor}
                      </footer>
                    )}
                  </blockquote>
                )}
              </motion.section>
            )}

            {/* Seção: Por Que o Problema Existe */}
            {post.sectionProblema && (
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
                    Por Que Isso Acontece
                  </h2>
                </div>
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.sectionProblema.replace(/\n/g, '<br/>') }} />
                </div>
              </motion.section>
            )}

            {/* Seção: A Boa Notícia */}
            {post.sectionBoaNoticia && (
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
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.sectionBoaNoticia.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </motion.section>
            )}

          </div>
        </div>
      </article>

      {/* CTA: Missões Recomendadas */}
      {post.relatedMissions && post.relatedMissions.length > 0 && (
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
                  Escolha uma missão e transforme sua rotina hoje.
                </p>
              </motion.div>
              
              {/* Mission Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {post.relatedMissions.map((mission, i) => (
                  <motion.div
                    key={mission.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/missoes/${mission.slug}`}>
                      <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden bg-white dark:bg-gray-800">
                        {mission.heroImageUrl && (
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={mission.heroImageUrl}
                              alt={mission.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            {mission.energyLevel && (
                              <Badge className={`absolute top-3 right-3 border-0 ${
                                mission.energyLevel === 'alta' 
                                  ? 'bg-red-500 text-white' 
                                  : mission.energyLevel === 'média'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-green-500 text-white'
                              }`}>
                                Energia {mission.energyLevel}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <CardContent className="p-5">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                            {mission.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {mission.estimatedMinutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{mission.estimatedMinutes} min</span>
                              </div>
                            )}
                            {mission.tarefasSimplesDeExecucao && (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{mission.tarefasSimplesDeExecucao.length} tarefas</span>
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
                            data-testid={`cta-mission-${mission.slug}`}
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
              {post.category && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mt-10"
                >
                  <Link href={`/missoes?category=${encodeURIComponent(post.category)}`}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="rounded-full px-8 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      Ver Todas as Missões de {post.category}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
