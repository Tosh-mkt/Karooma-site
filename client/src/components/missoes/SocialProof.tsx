import { motion } from "framer-motion";
import { Quote, Heart } from "lucide-react";

interface Testimonial {
  text: string;
  author: string;
  context: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "Fazer isso me deu 30 minutos a mais de sono. Parece pouco, mas mudou meu dia inteiro.",
    author: "Ana, mãe de 3",
    context: "Rotina Matinal"
  },
  {
    text: "Finalmente consegui aquele café quente. E sem culpa.",
    author: "Camila, mãe de 2",
    context: "Tempo para mim"
  },
  {
    text: "As crianças adoraram escolher a roupa na noite anterior. Virou um momento nosso.",
    author: "Paula, mãe de 4",
    context: "Organização"
  }
];

export function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            O que outras mães disseram
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Você faz parte do Círculo da Leveza
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
          >
            <Quote className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic leading-relaxed">
              "{testimonial.text}"
            </p>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {testimonial.author}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {testimonial.context}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
