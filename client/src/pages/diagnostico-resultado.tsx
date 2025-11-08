import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadarChart, ScoreCard } from '@/components/diagnostics/RadarChart';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface DiagnosticData {
  id: string;
  userName: string;
  cargaMental: string;
  tempoDaCasa: string;
  tempoDeQualidade: string;
  alimentacao: string;
  gestaoDaCasa: string;
  logisticaInfantil: string;
  createdAt: string;
}

export default function DiagnosticoResultadoPage() {
  const [, navigate] = useLocation();
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);

  // Pegar ID do diagnóstico da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setDiagnosticId(id);
  }, []);

  // Buscar diagnóstico da API
  const { data: diagnostic, isLoading, error } = useQuery<DiagnosticData>({
    queryKey: ['/api/diagnostics', diagnosticId],
    enabled: !!diagnosticId,
  });

  // Calcular áreas críticas (score < 3)
  const getCriticalAreas = () => {
    if (!diagnostic) return [];
    
    const areas = [
      { name: 'Carga Mental', score: parseFloat(diagnostic.cargaMental), key: 'cargaMental' },
      { name: 'Tempo da Casa', score: parseFloat(diagnostic.tempoDaCasa), key: 'tempoDaCasa' },
      { name: 'Tempo de Qualidade', score: parseFloat(diagnostic.tempoDeQualidade), key: 'tempoDeQualidade' },
      { name: 'Alimentação', score: parseFloat(diagnostic.alimentacao), key: 'alimentacao' },
      { name: 'Gestão da Casa', score: parseFloat(diagnostic.gestaoDaCasa), key: 'gestaoDaCasa' },
      { name: 'Logística Infantil', score: parseFloat(diagnostic.logisticaInfantil), key: 'logisticaInfantil' },
    ];

    return areas
      .filter(area => area.score < 3)
      .sort((a, b) => a.score - b.score);
  };

  const getPersonalizedMessage = () => {
    const criticalAreas = getCriticalAreas();
    const firstName = diagnostic?.userName?.split(' ')[0] || 'Mãe';

    if (criticalAreas.length === 0) {
      return {
        title: `${firstName}, você está indo muito bem! 🌟`,
        message: `Todas as áreas da sua rotina estão equilibradas. Continue assim e não se esqueça de reservar momentos para você mesma!`
      };
    }

    if (criticalAreas.length === 1) {
      return {
        title: `${firstName}, identificamos 1 área que precisa de atenção`,
        message: `A área de ${criticalAreas[0].name} está pedindo leveza. Vamos focar nela para trazer mais tranquilidade ao seu dia a dia!`
      };
    }

    const topArea = criticalAreas[0].name;
    return {
      title: `${firstName}, vamos trazer mais leveza! 💚`,
      message: `Identificamos ${criticalAreas.length} áreas que precisam de atenção, começando por ${topArea}. Não se preocupe - temos soluções práticas para você!`
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Preparando seu panorama...
          </p>
        </div>
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Diagnóstico não encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não conseguimos encontrar seu diagnóstico. Que tal fazer o teste novamente?
          </p>
          <Button
            onClick={() => navigate('/diagnostico')}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
          >
            Fazer Novo Diagnóstico
          </Button>
        </div>
      </div>
    );
  }

  const scores = {
    cargaMental: parseFloat(diagnostic.cargaMental),
    tempoDaCasa: parseFloat(diagnostic.tempoDaCasa),
    tempoDeQualidade: parseFloat(diagnostic.tempoDeQualidade),
    alimentacao: parseFloat(diagnostic.alimentacao),
    gestaoDaCasa: parseFloat(diagnostic.gestaoDaCasa),
    logisticaInfantil: parseFloat(diagnostic.logisticaInfantil),
  };

  const personalizedMessage = getPersonalizedMessage();
  const criticalAreas = getCriticalAreas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Seu Panorama Está Pronto, {diagnostic.userName?.split(' ')[0]}! 🌸
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Veja como estão as 6 áreas da sua rotina materna
          </p>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <RadarChart scores={scores} />
        </motion.div>

        {/* Personalized Analysis */}
        <motion.div
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-start gap-4 mb-6">
            <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {personalizedMessage.title}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {personalizedMessage.message}
              </p>
            </div>
          </div>

          {criticalAreas.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                Áreas que precisam de atenção:
              </h3>
              <div className="flex flex-wrap gap-3">
                {criticalAreas.map((area, index) => (
                  <div
                    key={area.key}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      index === 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {area.name} ({area.score.toFixed(1)})
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Score Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <ScoreCard label="Carga Mental" score={scores.cargaMental} icon="🧠" />
          <ScoreCard label="Tempo da Casa" score={scores.tempoDaCasa} icon="🏠" />
          <ScoreCard label="Tempo de Qualidade" score={scores.tempoDeQualidade} icon="❤️" />
          <ScoreCard label="Alimentação" score={scores.alimentacao} icon="🍽️" />
          <ScoreCard label="Gestão da Casa" score={scores.gestaoDaCasa} icon="📋" />
          <ScoreCard label="Logística Infantil" score={scores.logisticaInfantil} icon="👶" />
        </motion.div>

        {/* CTA - Ver Soluções */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={() => navigate('/missoes')}
            size="lg"
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold px-12 py-6 rounded-2xl text-xl shadow-2xl"
            data-testid="button-view-solutions"
          >
            Ver Soluções Personalizadas
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Descubra missões práticas para trazer mais leveza à sua rotina
          </p>
        </motion.div>
      </div>
    </div>
  );
}
