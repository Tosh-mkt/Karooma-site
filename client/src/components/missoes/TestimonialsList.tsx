import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { MISSION_TESTIMONIALS } from "@/data/missionMockData";

interface TestimonialsListProps {
  slug: string;
}

export function TestimonialsList({ slug }: TestimonialsListProps) {
  const testimonials = MISSION_TESTIMONIALS[slug] || [];

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          O que outras mães estão dizendo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Você não está sozinha nessa jornada
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            data-testid={`testimonial-${index}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                {testimonial.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.time}
                </p>
              </div>
              <Quote className="w-6 h-6 text-green-400 dark:text-green-500 flex-shrink-0" />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {testimonial.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
