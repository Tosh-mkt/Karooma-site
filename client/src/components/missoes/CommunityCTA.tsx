import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommunityCTA() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-3xl p-8 md:p-12 shadow-2xl">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
      </div>
      
      <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto">
          <Users className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Você faz parte do Círculo da Leveza
        </h2>
        
        <p className="text-lg text-white/90 leading-relaxed">
          Um espaço para mães que respiram entre uma missão e outra. 
          Aqui você não está sozinha — está acompanhada por quem entende.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-white hover:bg-gray-100 text-green-600 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            data-testid="button-join-community"
          >
            <Users className="w-5 h-5 mr-2" />
            Entrar na comunidade
          </Button>
        </div>
        
        <p className="text-sm text-white/70">
          Sua jornada de leveza continua aqui 🌿
        </p>
      </div>
    </div>
  );
}
