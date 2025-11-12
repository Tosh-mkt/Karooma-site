import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommunityCTA() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#F5F3EE] to-[#E6D8C6] dark:from-[#7A6856] dark:to-[#5A4B3F] rounded-3xl p-8 md:p-12 shadow-2xl">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FFFBF5] blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#FFF5F0] blur-3xl"></div>
      </div>
      
      <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#E6B8A2] dark:bg-[#D4A89A] flex items-center justify-center mx-auto shadow-lg">
          <Users className="w-8 h-8 text-gray-900 dark:text-gray-100" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Você faz parte do Círculo da Leveza
        </h2>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Um espaço para mães que respiram entre uma missão e outra. 
          Aqui você não está sozinha — está acompanhada por quem entende.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-[#E6B8A2] hover:bg-[#D9A493] dark:bg-[#D4A89A] dark:hover:bg-[#C39B8E] text-gray-900 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            data-testid="button-join-community"
          >
            <Users className="w-5 h-5 mr-2" />
            Entrar na comunidade
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sua jornada de leveza continua aqui 🌿
        </p>
      </div>
    </div>
  );
}
