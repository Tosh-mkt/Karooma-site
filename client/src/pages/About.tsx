import { motion } from "framer-motion";
import { Heart, Users, Target, Lightbulb, Shield, Star, Coffee, Home, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

// Dados padrão para valores (editáveis via CMS)
const getDefaultValues = (content: PageContent) => [
  {
    icon: Heart,
    title: content.valor1Title || "Empatia Genuína",
    description: content.valor1Description || "Entendemos que ser mãe é uma jornada cheia de desafios únicos. Cada dia traz novas situações, e você não está sozinha nisso.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Lightbulb,
    title: content.valor2Title || "Soluções Práticas",
    description: content.valor2Description || "Oferecemos estratégias testadas por mães reais, produtos que realmente funcionam e conteúdo que facilita o dia a dia.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: Target,
    title: content.valor3Title || "Objetivos Claros",
    description: content.valor3Description || "Nosso foco é simplificar sua rotina familiar para que você tenha mais tempo para o que realmente importa: momentos especiais.",
    color: "from-green-500 to-emerald-500"
  }
];

const defaultStats = [
  { number: "1000+", label: "Mães Ajudadas", icon: Users },
  { number: "500+", label: "Produtos Avaliados", icon: Star },
  { number: "200+", label: "Artigos Publicados", icon: Coffee },
  { number: "95%", label: "Satisfação", icon: Heart }
];

// Interface para o conteúdo da página
interface PageContent {
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionContent: string;
  valuesTitle: string;
  valor1Title?: string;
  valor1Description?: string;
  valor2Title?: string;
  valor2Description?: string;
  valor3Title?: string;
  valor3Description?: string;
  helpSectionTitle?: string;
  helpSectionSubtitle?: string;
  momentosMeusTitle?: string;
  momentosMeusContent?: string;
  facilitaVidaTitle?: string;
  facilitaVidaContent?: string;
  suporteContinuoTitle?: string;
  suporteContinuoContent?: string;
  closingTitle: string;
  closingQuote: string;
  closingDescription: string;
  closingSignature: string;
}

// Conteúdo padrão caso não haja dados no CMS
const defaultContent: PageContent = {
  heroTitle: "Juntas, Sempre Encontramos um Jeito",
  heroSubtitle: "A Karooma nasceu da compreensão profunda de que ser mãe é uma das experiências mais transformadoras e desafiadoras da vida. Estamos aqui para simplificar seu dia a dia e fortalecer sua confiança como mãe.",
  missionTitle: "Nossa Missão",
  missionContent: "Acreditamos que toda mãe merece sentir-se apoiada e confiante. Nossa missão é fornecer recursos práticos, produtos cuidadosamente selecionados e conteúdo empático que realmente fazem a diferença no cotidiano familiar.\n\nSabemos que você carrega uma carga mental imensa - desde lembrar dos compromissos médicos das crianças até planejar as refeições da semana. Por isso, criamos um espaço onde você encontra soluções testadas e estratégias que funcionam.\n\nNão somos apenas mais um site. Somos uma comunidade que entende que por trás de cada mãe existe uma mulher que também precisa de cuidado, compreensão e momentos para si mesma.",
  valuesTitle: "Nossos Valores",
  valor1Title: "Empatia Genuína",
  valor1Description: "Entendemos que ser mãe é uma jornada cheia de desafios únicos. Cada dia traz novas situações, e você não está sozinha nisso.",
  valor2Title: "Soluções Práticas", 
  valor2Description: "Oferecemos estratégias testadas por mães reais, produtos que realmente funcionam e conteúdo que facilita o dia a dia.",
  valor3Title: "Objetivos Claros",
  valor3Description: "Nosso foco é simplificar sua rotina familiar para que você tenha mais tempo para o que realmente importa: momentos especiais.",
  closingTitle: "Você Não Está Sozinha",
  closingQuote: "Sua família tem sorte de ter você",
  closingDescription: "Esta é nossa mensagem principal: reconhecer o trabalho incrível que você faz todos os dias, mesmo nos momentos quando tudo parece caótico.",
  closingSignature: "Equipe Karooma"
};

export default function About() {
  // Buscar conteúdo dinâmico do CMS
  const { data: pageContentData, isLoading } = useQuery({
    queryKey: ["/api/content/page/about"],
    retry: false,
  });

  // Processar conteúdo do CMS ou usar padrão
  let content = defaultContent;
  if (pageContentData && (pageContentData as any).content) {
    try {
      const parsedContent = JSON.parse((pageContentData as any).content);
      content = { ...defaultContent, ...parsedContent };
    } catch (error) {
      console.error("Erro ao processar conteúdo da página:", error);
    }
  }

  // Mostrar loading se ainda estiver carregando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 font-poppins">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-lg">
              Sobre a Karooma
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-8 font-fredoka">
              {content.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-poppins">
              {content.heroSubtitle}
            </p>
          </motion.div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="py-20 px-4"
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 font-fredoka">
                {content.missionTitle}
              </h2>
              <div className="space-y-6 text-lg text-gray-700 font-poppins">
                {content.missionContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="text-center space-y-6">
                  <Home className="w-20 h-20 mx-auto text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-800 font-fredoka">
                    "{content.closingQuote}"
                  </h3>
                  <p className="text-gray-600 italic font-poppins">
                    {content.closingDescription}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Values Grid */}
      <motion.section 
        className="py-20 px-4 bg-white/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-fredoka">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
              Cada decisão que tomamos é guiada por estes princípios fundamentais que 
              definem quem somos e como queremos impactar sua vida.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {getDefaultValues(content).map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 font-fredoka">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-poppins">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How We Help */}
      <motion.section 
        className="py-20 px-4"
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-fredoka">
              Como Te Auxiliamos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
              Oferecemos apoio prático e emocional através de diferentes canais, 
              sempre com foco em soluções que realmente funcionam.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Coffee className="w-16 h-16 mx-auto mb-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4 font-fredoka">
                  {content.momentosMeusTitle || "Momentos Meus"}
                </h3>
                <p className="text-gray-600 leading-relaxed font-poppins">
                  {content.momentosMeusContent || "Artigos empáticos e estratégias práticas para organização familiar, autocuidado e gestão da carga mental. Conteúdo criado por e para mães reais."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Star className="w-16 h-16 mx-auto mb-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4 font-fredoka">
                  {content.facilitaVidaTitle || "Facilita a Vida"}
                </h3>
                <p className="text-gray-600 leading-relaxed font-poppins">
                  {content.facilitaVidaContent || "Produtos cuidadosamente avaliados que realmente facilitam o dia a dia familiar. Cada recomendação é testada e aprovada por especialistas e mães."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 mx-auto mb-6 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4 font-fredoka">
                  {content.suporteContinuoTitle || "Suporte Contínuo"}
                </h3>
                <p className="text-gray-600 leading-relaxed font-poppins">
                  {content.suporteContinuoContent || "Uma comunidade acolhedora onde você pode encontrar apoio, trocar experiências e lembrar que não está sozinha nessa jornada."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 font-fredoka">
            Nosso Impacto
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {defaultStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-white/80" />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-fredoka">
                  {stat.number}
                </div>
                <div className="text-white/80 text-lg font-poppins">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-20 px-4"
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 font-fredoka">
            Lembre-se Sempre
          </h2>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-12 rounded-3xl">
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-fredoka">
              "Você está fazendo um trabalho incrível, mesmo quando parece que tudo está bagunçado."
            </p>
            <p className="text-xl text-gray-600 mb-8 font-poppins">
              Sua família tem sorte de ter você. E nós estamos aqui para lembrá-la disso todos os dias, 
              oferecendo o apoio prático e emocional que você merece.
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-fredoka">
              Porque juntas, a gente sempre encontra um jeito. ✨
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}