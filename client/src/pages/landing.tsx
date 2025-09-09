import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Heart, Star, ArrowRight, Gift, Clock, Target, Users, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import karoomaLogo from "@/assets/LOGO_KAROOMA_TIPO_1753945361411.png";
import heroBackground from "@assets/generated_images/Papercraft_origami_chaos_to_harmony_4b428ce9.png";

export default function Landing() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest(
        "POST",
        "/api/newsletter/subscribe",
        {
          email: formData.email,
          name: formData.name || "Mãe Organizada",
          source: "landing_page"
        }
      );

      toast({
        title: "🎉 Parabéns!",
        description: "Seu guia será enviado por email em alguns minutos!"
      });

      // Reset form
      setFormData({ name: "", email: "" });

      // Track conversion (opcional - para analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'landing_page_signup'
        });
      }

    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Ops! Algo deu errado",
        description: "Tente novamente em alguns instantes"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Rotinas que as crianças seguem sozinhas",
      description: "Técnicas simples para criar autonomia sem briga"
    },
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      title: "3 truques para organização rápida",
      description: "Métodos de 10 minutos que funcionam de verdade"
    },
    {
      icon: <Gift className="w-6 h-6 text-pink-600" />,
      title: "Refeições sem stress em família",
      description: "Cardápio semanal + dicas para facilitar o preparo"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Momentos para si sem culpa",
      description: "Como reservar tempo pessoal sendo uma boa mãe"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Estratégias para emergências",
      description: "O que fazer quando tudo dá errado no mesmo dia"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      location: "São Paulo",
      text: "Consegui organizar a rotina das crianças em apenas um final de semana. Muito prático!",
      avatar: "👩🏻"
    },
    {
      name: "Ana Costa", 
      location: "Rio de Janeiro",
      text: "As dicas de refeição salvaram minha semana. Finalmente consigo jantar em família sem correria.",
      avatar: "👩🏽"
    },
    {
      name: "Carolina Santos",
      location: "Belo Horizonte", 
      text: "Pela primeira vez em anos consegui 30 minutos só para mim sem me sentir culpada.",
      avatar: "👩🏻‍🦱"
    }
  ];

  return (
    <div className="min-h-screen">
      
      {/* Header com Logo */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.img 
            src={karoomaLogo} 
            alt="Karooma" 
            className="h-8 object-contain mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </header>

      {/* Hero Section com Background */}
      <section 
        className="pt-24 pb-12 px-4 relative min-h-screen flex items-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay para melhorar legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-purple-50/80 to-pink-50/90"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-fredoka text-4xl md:text-6xl gradient-text mb-6 leading-tight">
              Cansada do Caos Diário?
            </h1>
            
            <p className="font-poppins text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubra as <strong>5 Soluções</strong> que outras mães usam para ter 
              <span className="text-purple-600 font-semibold"> mais tempo e menos stress!</span>
            </p>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <p className="font-poppins text-gray-600 mb-6">
                Baixe <strong>grátis</strong> o guia com estratégias testadas por mães como você - 
                sem complicação, sem teoria, só o que <strong>funciona na prática.</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Seu primeiro nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-center text-lg py-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400"
                />
                
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-center text-lg py-4 rounded-2xl border-2 border-purple-200 focus:border-purple-400"
                />
                
                <GradientButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-xl font-semibold rounded-2xl"
                  data-testid="button-download-guide"
                >
                  {isSubmitting ? "Enviando..." : "QUERO MEU GUIA GRÁTIS! 🎁"}
                </GradientButton>
              </form>

              <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Mais de 2.500 mães já transformaram sua rotina
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-fredoka text-3xl md:text-4xl gradient-text mb-4">
              O que você vai descobrir:
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-full">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-gray-800 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-fredoka text-3xl md:text-4xl text-gray-800 mb-8">
              Você também se sente assim?
            </h2>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 text-left">
              <div className="space-y-6 text-gray-700 font-poppins leading-relaxed">
                <p className="text-lg">
                  <strong>Manhã:</strong> Você acorda já correndo. Uma criança não quer vestir a roupa, 
                  outra perdeu o material da escola, e a menor está chorando porque quer colo.
                </p>
                
                <p className="text-lg">
                  <strong>Tarde:</strong> Casa bagunçada, pilha de roupa para dobrar, e você ainda 
                  não almoçou direito. As crianças brigam, pedem lanche a cada 5 minutos, 
                  e você se sente uma má mãe por estar sempre impaciente.
                </p>
                
                <p className="text-lg">
                  <strong>Noite:</strong> Jantar improvisado, banho em protesto, e você desaba 
                  no sofá pensando: "Onde foi parar o meu tempo? Quando foi que eu me perdi no meio de tanta coisa?"
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl mt-8">
                  <p className="text-lg font-medium text-gray-800">
                    <strong>Eu entendo porque eu também sou mãe.</strong> Passei anos me sentindo assim, 
                    até descobrir que o problema não era eu ser "desorganizada" - era não ter um sistema que funcionasse.
                  </p>
                </div>
                
                <p className="text-xl font-medium text-purple-700 text-center">
                  E se eu te dissesse que você pode ter mais leveza na sua rotina, 
                  sem perfeccionismo, sem culpa e sem precisar abrir mão de ser uma mãe presente?
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-fredoka text-3xl md:text-4xl gradient-text mb-4">
              O que nossas mães organizadas dizem:
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-poppins font-semibold text-gray-800">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-fredoka text-3xl md:text-4xl mb-6">
              Não perca mais tempo!
            </h2>
            
            <p className="font-poppins text-xl mb-8 opacity-90">
              Baixe o seu <strong>Guia das 5 Soluções</strong> gratuito agora e vá colecionando os demais guias e conteúdos que a Karooma está preparando para você!
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Seu primeiro nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-center text-lg py-4 rounded-2xl bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-center text-lg py-4 rounded-2xl bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-xl font-semibold rounded-2xl bg-white text-purple-600 hover:bg-gray-100 transition-colors"
                  data-testid="button-download-guide-final"
                >
                  {isSubmitting ? "Enviando..." : "QUERO MEU GUIA GRÁTIS! 🚀"}
                </Button>
              </form>

              <p className="text-white/80 text-sm mt-4">
                Junte-se às mães que já estão vivendo com mais leveza ✨
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}