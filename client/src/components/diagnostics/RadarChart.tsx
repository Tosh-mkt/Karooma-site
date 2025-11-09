import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Text } from 'recharts';
import { motion } from 'framer-motion';

export interface DiagnosticScores {
  cargaMental: number;
  tempoDaCasa: number;
  tempoDeQualidade: number;
  alimentacao: number;
  gestaoDaCasa: number;
  logisticaInfantil: number;
}

interface RadarChartProps {
  scores: DiagnosticScores;
  className?: string;
}

export function RadarChart({ scores, className = '' }: RadarChartProps) {
  // Preparar dados para o Recharts (formato [{area: string, value: number, fullMark: 5}])
  const data = [
    {
      area: 'Carga\nMental',
      value: Number(scores.cargaMental),
      fullMark: 5,
      icon: '🧠'
    },
    {
      area: 'Tempo da\nCasa',
      value: Number(scores.tempoDaCasa),
      fullMark: 5,
      icon: '🏠'
    },
    {
      area: 'Tempo de\nQualidade',
      value: Number(scores.tempoDeQualidade),
      fullMark: 5,
      icon: '❤️'
    },
    {
      area: 'Alimentação',
      value: Number(scores.alimentacao),
      fullMark: 5,
      icon: '🍽️'
    },
    {
      area: 'Gestão da\nCasa',
      value: Number(scores.gestaoDaCasa),
      fullMark: 5,
      icon: '📋'
    },
    {
      area: 'Logística\nInfantil',
      value: Number(scores.logisticaInfantil),
      fullMark: 5,
      icon: '👶'
    },
  ];

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Fundo escuro para destacar o glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 rounded-3xl" />
      
      <div className="relative">
        {/* SVG Overlay com camadas de Aurora */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 500 500"
          style={{ zIndex: 0 }}
        >
          <defs>
            {/* Filtro de Glow/Aurora */}
            <filter id="auroraGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradientes Radiantes para as camadas */}
            <radialGradient id="auroraPink">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="auroraPurple">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="auroraCyan">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Camadas concêntricas com animação de pulso */}
          <motion.circle
            cx="250"
            cy="250"
            r="180"
            fill="url(#auroraCyan)"
            filter="url(#auroraGlow)"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          <motion.circle
            cx="250"
            cy="250"
            r="130"
            fill="url(#auroraPurple)"
            filter="url(#auroraGlow)"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          />
          
          <motion.circle
            cx="250"
            cy="250"
            r="80"
            fill="url(#auroraPink)"
            filter="url(#auroraGlow)"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          />
        </svg>

        {/* Recharts Radar (sobre as camadas de glow) */}
        <div className="relative" style={{ zIndex: 1 }}>
          <ResponsiveContainer width="100%" height={500}>
            <RechartsRadar data={data}>
              {/* Grid circular sutil */}
              <PolarGrid 
                stroke="#ffffff20" 
                strokeWidth={1}
                strokeDasharray="0"
              />
              
              {/* Eixos radiais (invisíveis) */}
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 5]} 
                tick={false}
                axisLine={false}
              />
              
              {/* Labels das áreas com ícones */}
              <PolarAngleAxis 
                dataKey="area" 
                tick={(props) => {
                  const { payload, x, y, textAnchor } = props;
                  const item = data.find(d => d.area === payload.value);
                  
                  return (
                    <g transform={`translate(${x},${y})`}>
                      {/* Ícone */}
                      <text
                        x={0}
                        y={-20}
                        textAnchor={textAnchor}
                        className="text-2xl"
                      >
                        {item?.icon}
                      </text>
                      {/* Label */}
                      <text
                        x={0}
                        y={10}
                        textAnchor={textAnchor}
                        className="text-sm font-semibold fill-white dark:fill-white"
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
                stroke="#ffffff40"
              />
              
              {/* Área preenchida com gradiente vibrante */}
              <Radar
                name="Scores"
                dataKey="value"
                stroke="url(#radarStroke)"
                fill="url(#radarFillGradient)"
                fillOpacity={0.5}
                strokeWidth={3}
                dot={{
                  fill: '#ffffff',
                  stroke: '#ec4899',
                  strokeWidth: 3,
                  r: 7
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              
              {/* Definições de gradientes para o polígono */}
              <defs>
                <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                
                <radialGradient id="radarFillGradient">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                </radialGradient>
              </defs>
            </RechartsRadar>
          </ResponsiveContainer>
        </div>

        {/* Logo Karooma.life no centro (círculo dark) */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ zIndex: 2 }}
        >
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full p-0.5 shadow-2xl">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-full px-8 py-4 shadow-inner">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                Karooma.life
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Componente auxiliar para exibir score individual
export function ScoreCard({ label, score, icon }: { label: string; score: number; icon: string }) {
  const percentage = (score / 5) * 100;
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
