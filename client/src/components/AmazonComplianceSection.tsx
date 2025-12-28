import { motion } from "framer-motion";

interface AmazonComplianceSectionProps {
  compact?: boolean;
}

export function AmazonComplianceSection({ compact = false }: AmazonComplianceSectionProps) {
  if (compact) {
    return (
      <div className="mt-8 px-4 py-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
        <p className="font-inter text-xs text-gray-500 dark:text-gray-400 text-center italic">
          Como associado da Amazon, a Karooma ganha com compras qualificadas que auxiliam na manutenção da estrutura para continuidade e melhoria dos serviços. Isso não aumenta o preço dos produtos.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="mt-8 px-6 py-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100/50 dark:border-purple-800/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p className="font-poppins text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-4">
        Cada produto que recomendamos e desenvolvemos passou pelo nosso teste rigoroso: funciona mesmo no dia a dia corrido de uma família? Está conectado aos dilemas das famílias? Selecionamos apenas itens que realmente simplificam, organizam ou facilitam algum aspecto da vida familiar.
      </p>
      
      <p className="font-inter text-xs text-gray-500 dark:text-gray-400 text-center italic">
        Como associado da Amazon, a Karooma ganha com compras qualificadas que auxiliam na manutenção da estrutura para continuidade e melhoria dos serviços. Isso não aumenta o preço dos produtos.
      </p>
    </motion.div>
  );
}
