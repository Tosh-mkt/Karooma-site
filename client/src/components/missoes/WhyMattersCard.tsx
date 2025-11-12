import { Heart } from "lucide-react";

interface WhyMattersCardProps {
  text?: string | null;
}

export function WhyMattersCard({ text }: WhyMattersCardProps) {
  if (!text) return null;

  return (
    <div className="bg-[#FFF5F0] dark:bg-rose-900/10 rounded-2xl p-6 md:p-8 border border-rose-100 dark:border-rose-800">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-800/30">
          <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Por que isso importa?
        </h2>
      </div>
      
      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
        {text}
      </p>
    </div>
  );
}
