import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface Question {
  id: number;
  area: keyof DiagnosticAreas;
  question: string;
  icon: string;
  sentiment: 'positive' | 'negative';
}

interface DiagnosticAreas {
  cargaMental: number[];
  tempoDaCasa: number[];
  tempoDeQualidade: number[];
  alimentacao: number[];
  gestaoDaCasa: number[];
  logisticaInfantil: number[];
}

// 12 perguntas (2 por área)
const questions: Question[] = [
  // Carga Mental
  { 
    id: 1, 
    area: 'cargaMental', 
    question: 'Com que frequência você se sente sobrecarregada mentalmente com tudo que precisa lembrar e organizar?', 
    icon: '🧠',
    sentiment: 'negative'
  },
  { 
    id: 2, 
    area: 'cargaMental', 
    question: 'Com que frequência você sente que precisa fazer tudo sozinha sem conseguir delegar?', 
    icon: '🧠',
    sentiment: 'negative'
  },
  
  // Tempo da Casa
  { 
    id: 3, 
    area: 'tempoDaCasa', 
    question: 'Você sente que passa tempo excessivo cuidando da casa (limpeza, organização)?', 
    icon: '🏠',
    sentiment: 'negative'
  },
  { 
    id: 4, 
    area: 'tempoDaCasa', 
    question: 'Você se sente satisfeita com a organização da sua casa?', 
    icon: '🏠',
    sentiment: 'positive'
  },
  
  // Tempo de Qualidade
  { 
    id: 5, 
    area: 'tempoDeQualidade', 
    question: 'Você consegue ter momentos de qualidade com seus filhos diariamente?', 
    icon: '❤️',
    sentiment: 'positive'
  },
  { 
    id: 6, 
    area: 'tempoDeQualidade', 
    question: 'Você reserva tempo para autocuidado e momentos para você mesma?', 
    icon: '❤️',
    sentiment: 'positive'
  },
  
  // Alimentação
  { 
    id: 7, 
    area: 'alimentacao', 
    question: 'Com que frequência você consegue planejar refeições saudáveis para a família?', 
    icon: '🍽️',
    sentiment: 'positive'
  },
  { 
    id: 8, 
    area: 'alimentacao', 
    question: 'Você se sente estressada na hora das refeições com as crianças?', 
    icon: '🍽️',
    sentiment: 'negative'
  },
  
  // Gestão da Casa
  { 
    id: 9, 
    area: 'gestaoDaCasa', 
    question: 'Com que frequência você consegue manter as contas, compras e tarefas domésticas organizadas?', 
    icon: '📋',
    sentiment: 'positive'
  },
  { 
    id: 10, 
    area: 'gestaoDaCasa', 
    question: 'Você consegue manter as rotinas da casa funcionando de forma tranquila?', 
    icon: '📋',
    sentiment: 'positive'
  },
  
  // Logística Infantil
  { 
    id: 11, 
    area: 'logisticaInfantil', 
    question: 'As manhãs com as crianças (acordar, vestir, café, escola) fluem tranquilamente?', 
    icon: '👶',
    sentiment: 'positive'
  },
  { 
    id: 12, 
    area: 'logisticaInfantil', 
    question: 'Você consegue gerenciar os horários e atividades das crianças sem estresse?', 
    icon: '👶',
    sentiment: 'positive'
  },
];

// Para perguntas POSITIVAS: triste→feliz (quanto mais frequente, melhor!)
const responseOptionsPositive = [
  { value: 1, label: 'Nunca', emoji: '😰' },
  { value: 2, label: 'Raramente', emoji: '😟' },
  { value: 3, label: 'Às vezes', emoji: '😐' },
  { value: 4, label: 'Frequentemente', emoji: '🙂' },
  { value: 5, label: 'Sempre', emoji: '😊' },
];

// Para perguntas NEGATIVAS: feliz→triste (quanto mais frequente, pior!)
const responseOptionsNegative = [
  { value: 1, label: 'Nunca', emoji: '😊' },
  { value: 2, label: 'Raramente', emoji: '🙂' },
  { value: 3, label: 'Às vezes', emoji: '😐' },
  { value: 4, label: 'Frequentemente', emoji: '😟' },
  { value: 5, label: 'Sempre', emoji: '😰' },
];

export default function DiagnosticoPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [answers, setAnswers] = useState<number[]>(Array(12).fill(0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleStartQuiz = () => {
    if (!userName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, nos diga seu nome para personalizar o diagnóstico!",
        variant: "destructive"
      });
      return;
    }
    setShowNameInput(false);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    // Avançar automaticamente após selecionar
    setTimeout(() => {
      if (isLastQuestion) {
        handleSubmit(newAnswers);
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScores = (allAnswers: number[]): DiagnosticAreas => {
    const scores: DiagnosticAreas = {
      cargaMental: [],
      tempoDaCasa: [],
      tempoDeQualidade: [],
      alimentacao: [],
      gestaoDaCasa: [],
      logisticaInfantil: [],
    };

    allAnswers.forEach((answer, index) => {
      const question = questions[index];
      
      // Inverter scores para perguntas negativas
      // Pergunta negativa: "Sempre sobrecarregada" (5) → Score 1 (crítico)
      // Pergunta positiva: "Sempre organizada" (5) → Score 5 (ótimo)
      const adjustedScore = question.sentiment === 'negative' 
        ? 6 - answer  // Inverte: 1→5, 2→4, 3→3, 4→2, 5→1
        : answer;      // Mantém: 1→1, 2→2, ..., 5→5
      
      scores[question.area].push(adjustedScore);
    });

    return scores;
  };

  const handleSubmit = async (finalAnswers: number[]) => {
    try {
      setIsSubmitting(true);

      // Calcular scores (média de cada área)
      const areaScores = calculateScores(finalAnswers);
      const diagnosticData = {
        userName: userName.trim(),
        userId: null, // Opcional - pode ser anônimo
        cargaMental: (areaScores.cargaMental.reduce((a, b) => a + b, 0) / areaScores.cargaMental.length).toFixed(2),
        tempoDaCasa: (areaScores.tempoDaCasa.reduce((a, b) => a + b, 0) / areaScores.tempoDaCasa.length).toFixed(2),
        tempoDeQualidade: (areaScores.tempoDeQualidade.reduce((a, b) => a + b, 0) / areaScores.tempoDeQualidade.length).toFixed(2),
        alimentacao: (areaScores.alimentacao.reduce((a, b) => a + b, 0) / areaScores.alimentacao.length).toFixed(2),
        gestaoDaCasa: (areaScores.gestaoDaCasa.reduce((a, b) => a + b, 0) / areaScores.gestaoDaCasa.length).toFixed(2),
        logisticaInfantil: (areaScores.logisticaInfantil.reduce((a, b) => a + b, 0) / areaScores.logisticaInfantil.length).toFixed(2),
        quizAnswers: JSON.stringify({ answers: finalAnswers, timestamp: new Date().toISOString() })
      };

      // Salvar diagnóstico na API
      const response = await apiRequest('POST', '/api/diagnostics', diagnosticData);
      const result = await response.json();

      // Navegar para resultado com ID do diagnóstico
      navigate(`/diagnostico/resultado?id=${result.id}`);
    } catch (error) {
      console.error('Erro ao salvar diagnóstico:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu diagnóstico. Tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 flex items-center justify-center p-4">
        <motion.div
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full p-1 mb-6">
                  <div className="bg-white dark:bg-gray-900 rounded-full px-8 py-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                      Karooma.life
                    </span>
                  </div>
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Diagnóstico de Rotina Materna
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Descubra quais áreas da sua vida precisam de mais leveza! ✨
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Como podemos te chamar?
                </label>
                <input
                  id="name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Seu primeiro nome"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
                  data-testid="input-name"
                />
              </div>

              <Button
                onClick={handleStartQuiz}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold py-6 rounded-xl text-lg shadow-lg"
                data-testid="button-start-quiz"
              >
                Começar Diagnóstico
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-6">
              São apenas 12 perguntas rápidas • Leva menos de 3 minutos
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 mb-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-6">{question.icon}</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {question.question}
              </h2>
            </div>

            {/* Response Options */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(question.sentiment === 'negative' ? responseOptionsNegative : responseOptionsPositive).map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    answers[currentQuestion] === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`option-${option.value}`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          {isSubmitting && (
            <div className="text-center text-purple-600 dark:text-purple-400 font-medium">
              Preparando seu panorama...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
