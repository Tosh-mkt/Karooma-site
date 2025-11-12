import { motion } from "framer-motion";
import { Coffee, Home, UtensilsCrossed, Heart, Users, Gift, Car, Hospital, Wrench } from "lucide-react";

interface DilemmaOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const DILEMAS: DilemmaOption[] = [
  { id: "morning", label: "Minhas manhãs", icon: Coffee, category: "Rotina Matinal" },
  { id: "mess", label: "A bagunça que nunca some", icon: Home, category: "Casa em Ordem" },
  { id: "cooking", label: "A cabeça cansada", icon: UtensilsCrossed, category: "Cozinha Inteligente" },
  { id: "self", label: "O tempo pra mim", icon: Heart, category: "Tempo para Mim" },
  { id: "kids", label: "As crianças cheias de energia", icon: Users, category: "Educação e Brincadeiras" },
  { id: "home", label: "A casa que precisa de um cuidado", icon: Wrench, category: "Manutenção e Melhorias do Lar" },
];

interface Props {
  onSelect: (category: string) => void;
}

export function DilemmaQuiz({ onSelect }: Props) {
  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          O que está pedindo leveza hoje?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Escolha um dilema e vamos te ajudar com soluções práticas
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {DILEMAS.map((dilema, index) => {
          const Icon = dilema.icon;
          return (
            <motion.button
              key={dilema.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(dilema.category)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600"
              data-testid={`button-dilema-${dilema.id}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white text-center leading-snug">
                  {dilema.label}
                </p>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/0 via-pink-400/0 to-purple-400/0 group-hover:from-orange-400/10 group-hover:via-pink-400/10 group-hover:to-purple-400/10 transition-all duration-300 pointer-events-none" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
