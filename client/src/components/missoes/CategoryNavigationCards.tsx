import { Coffee, Package, Heart, Baby, Home } from "lucide-react";
import { Link } from "wouter";

const categories = [
  {
    id: "minhas-manhas",
    name: "Minhas manhãs",
    description: "Começar o dia com mais calma",
    icon: Coffee,
    color: "from-amber-500 to-orange-500"
  },
  {
    id: "baguncaque-nunca-some",
    name: "A bagunça que nunca some",
    description: "Organizar sem exaustão",
    icon: Package,
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "tempo-pra-mim",
    name: "O tempo pra mim",
    description: "Momentos de autocuidado",
    icon: Heart,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "criancas-energia",
    name: "As crianças cheias de energia",
    description: "Atividades para canalizar a energia",
    icon: Baby,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "casa-cuidado",
    name: "A casa que precisa de um cuidado",
    description: "Pequenos reparos e manutenção",
    icon: Home,
    color: "from-green-500 to-emerald-500"
  }
];

export function CategoryNavigationCards() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          O que está te pedindo leveza hoje?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Escolha o dilema que mais ressoa com seu momento atual
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          
          return (
            <Link key={category.id} href="/missoes">
              <div className="group cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
