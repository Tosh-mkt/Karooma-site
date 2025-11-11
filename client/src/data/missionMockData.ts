export interface MissionTask {
  id: string;
  title: string;
  subtitle: string;
}

export interface MissionTestimonial {
  name: string;
  avatar: string;
  time: string;
  text: string;
}

export const MISSION_TASKS: Record<string, MissionTask[]> = {
  'rotina-matinal-sem-caos': [
    { 
      id: 't1', 
      title: 'Prepare roupas e mochilas na noite anterior', 
      subtitle: 'Ganhe 15 minutos preciosos pela manhã.' 
    },
    { 
      id: 't2', 
      title: 'Crie uma playlist energizante', 
      subtitle: 'A música certa transforma o clima da casa.' 
    },
    { 
      id: 't3', 
      title: 'Monte lanches rápidos no domingo', 
      subtitle: 'Porções prontas para a semana toda.' 
    },
    { 
      id: 't4', 
      title: 'Use timer visual para as crianças', 
      subtitle: 'Elas se organizam melhor vendo o tempo passar.' 
    },
    { 
      id: 't5', 
      title: 'Respire fundo antes de acordar as crianças', 
      subtitle: 'Sua calma se transmite. Comece você em paz.' 
    }
  ],
  'organize-manha-10-minutos': [
    { 
      id: 't1', 
      title: 'Escolha 3 itens espalhados pela casa e guarde-os', 
      subtitle: 'Não precisa ser perfeito. Só três coisas que te incomodam agora.' 
    },
    { 
      id: 't2', 
      title: 'Abra uma janela por 2 minutos', 
      subtitle: 'O ar fresco renova o espaço e a sua energia.' 
    },
    { 
      id: 't3', 
      title: 'Coloque uma música que te acalme', 
      subtitle: 'Deixe tocar enquanto faz as próximas ações.' 
    },
    { 
      id: 't4', 
      title: 'Organize a mesa da cozinha ou da sala', 
      subtitle: 'Só a superfície visível. O resto pode esperar.' 
    },
    { 
      id: 't5', 
      title: 'Respire fundo 3 vezes', 
      subtitle: 'Sinta a diferença. Você criou esse espaço.' 
    }
  ],
};

export const MISSION_TESTIMONIALS: Record<string, MissionTestimonial[]> = {
  'rotina-matinal-sem-caos': [
    { 
      name: 'Beatriz', 
      avatar: 'B', 
      time: 'há 1 hora', 
      text: 'Deixar tudo pronto na noite anterior mudou TUDO! Agora acordo 20 minutos mais tarde.' 
    },
    { 
      name: 'Fernanda', 
      avatar: 'F', 
      time: 'há 3 horas', 
      text: 'O timer visual foi mágica pura. Meu filho de 6 anos agora se veste sozinho! 🎉' 
    },
    { 
      name: 'Sofia', 
      avatar: 'S', 
      time: 'ontem', 
      text: 'Comecei a respirar fundo antes de acordá-los. A manhã ficou mais leve para todos nós.' 
    }
  ],
  'organize-manha-10-minutos': [
    { 
      name: 'Mariana', 
      avatar: 'M', 
      time: 'há 2 horas', 
      text: 'Fiz hoje e me senti leve! Não sabia que 5 minutos podiam fazer tanta diferença.' 
    },
    { 
      name: 'Camila', 
      avatar: 'C', 
      time: 'há 5 horas', 
      text: 'Organizei com meu filho, foi divertido. Ele escolheu a música! 🎵' 
    },
    { 
      name: 'Juliana', 
      avatar: 'J', 
      time: 'ontem', 
      text: 'Respirei fundo e senti que estava cuidando de mim também, não só da casa.' 
    }
  ],
};
