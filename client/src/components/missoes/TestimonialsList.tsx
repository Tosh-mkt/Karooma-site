import { motion } from "framer-motion";
import { Quote, Plus } from "lucide-react";
import { MISSION_TESTIMONIALS } from "@/data/missionMockData";
import { Button } from "@/components/ui/button";

interface TestimonialsListProps {
  slug: string;
}

export function TestimonialsList({ slug }: TestimonialsListProps) {
  const testimonials = MISSION_TESTIMONIALS[slug] || [];

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Testimonials section with background image */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Background image with overlay - beige/cream gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3EE] to-[#E8DCC4] dark:from-[#7A6856] dark:to-[#5A4B3F]"></div>
        <div className="absolute inset-0 bg-[#FFF5F0]/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop')"
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Title */}
            <div className="text-center text-gray-800 dark:text-gray-100 space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">
                Outras mães disseram
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Você faz parte do Círculo da Leveza
              </p>
            </div>

            {/* Testimonial cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                  data-testid={`testimonial-${index}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#FDF3E6] to-[#E6B8A2] dark:from-[#D4A89A] dark:to-[#C39B8E] flex items-center justify-center text-gray-800 dark:text-gray-900 font-bold text-lg">
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
                    <Quote className="w-6 h-6 text-[#E6B8A2] dark:text-[#D4A89A] flex-shrink-0" />
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {testimonial.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                Você também faz parte disso.
              </p>
              <Button
                size="lg"
                className="bg-[#E6B8A2] hover:bg-[#D9A493] dark:bg-[#D4A89A] dark:hover:bg-[#C39B8E] text-gray-900 border-2 border-[#E8DCC4] dark:border-[#C3B9A2] font-semibold shadow-lg"
                data-testid="button-share-leveza"
              >
                <Plus className="w-5 h-5 mr-2" />
                Compartilhe sua leveza (+3 pontos)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
