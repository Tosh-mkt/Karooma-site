import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  Package, Star, ArrowRight, Sparkles, Clock, LayoutGrid, ChevronDown,
  Home, Baby, UtensilsCrossed, Bath, Car, Shirt, BookOpen, Heart, Wrench
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProductKit } from "@shared/schema";

interface Subcategory {
  value: string;
  label: string;
}

interface Category {
  value: string;
  label: string;
  Icon: typeof Home;
  color: string;
  bgColor: string;
  textColor: string;
  subcategories: Subcategory[];
}

const CATEGORIES: Category[] = [
  { 
    value: "all", 
    label: "Todos os Kits", 
    Icon: LayoutGrid, 
    color: "from-gray-500 to-gray-600", 
    bgColor: "bg-gray-100 dark:bg-gray-800", 
    textColor: "text-gray-600 dark:text-gray-400",
    subcategories: []
  },
  { 
    value: "casa", 
    label: "Casa em Ordem", 
    Icon: Home, 
    color: "from-blue-500 to-cyan-500", 
    bgColor: "bg-blue-50 dark:bg-blue-900/20", 
    textColor: "text-blue-600 dark:text-blue-400",
    subcategories: [
      { value: "limpeza-banheiro", label: "Limpeza de Banheiro" },
      { value: "limpeza-cozinha", label: "Limpeza de Cozinha" },
      { value: "organizacao", label: "Organização" },
      { value: "lavanderia", label: "Lavanderia" }
    ]
  },
  { 
    value: "bebe", 
    label: "Cuidados com Bebê", 
    Icon: Baby, 
    color: "from-pink-500 to-rose-500", 
    bgColor: "bg-pink-50 dark:bg-pink-900/20", 
    textColor: "text-pink-600 dark:text-pink-400",
    subcategories: [
      { value: "troca-fralda", label: "Troca de Fralda" },
      { value: "banho-bebe", label: "Banho do Bebê" },
      { value: "alimentacao-bebe", label: "Alimentação" },
      { value: "passeio-bebe", label: "Passeio" }
    ]
  },
  { 
    value: "cozinha", 
    label: "Cozinha Inteligente", 
    Icon: UtensilsCrossed, 
    color: "from-green-500 to-emerald-500", 
    bgColor: "bg-green-50 dark:bg-green-900/20", 
    textColor: "text-green-600 dark:text-green-400",
    subcategories: [
      { value: "preparo-refeicoes", label: "Preparo de Refeições" },
      { value: "marmitas", label: "Marmitas" },
      { value: "organizacao-cozinha", label: "Organização" },
      { value: "utensilios", label: "Utensílios" }
    ]
  },
  { 
    value: "higiene", 
    label: "Higiene Pessoal", 
    Icon: Bath, 
    color: "from-cyan-500 to-teal-500", 
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20", 
    textColor: "text-cyan-600 dark:text-cyan-400",
    subcategories: [
      { value: "banho-criancas", label: "Banho das Crianças" },
      { value: "rotina-noturna", label: "Rotina Noturna" },
      { value: "cuidados-cabelo", label: "Cuidados com Cabelo" }
    ]
  },
  { 
    value: "passeio", 
    label: "Passeios e Saídas", 
    Icon: Car, 
    color: "from-indigo-500 to-violet-500", 
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20", 
    textColor: "text-indigo-600 dark:text-indigo-400",
    subcategories: [
      { value: "viagem-carro", label: "Viagem de Carro" },
      { value: "praia-piscina", label: "Praia e Piscina" },
      { value: "parque", label: "Parque" },
      { value: "escola", label: "Escola" }
    ]
  },
  { 
    value: "roupas", 
    label: "Roupas e Organização", 
    Icon: Shirt, 
    color: "from-purple-500 to-fuchsia-500", 
    bgColor: "bg-purple-50 dark:bg-purple-900/20", 
    textColor: "text-purple-600 dark:text-purple-400",
    subcategories: [
      { value: "guarda-roupa", label: "Guarda-Roupa" },
      { value: "uniformes", label: "Uniformes" },
      { value: "closet-infantil", label: "Closet Infantil" }
    ]
  },
  { 
    value: "educacao", 
    label: "Educação e Brincadeiras", 
    Icon: BookOpen, 
    color: "from-amber-500 to-orange-500", 
    bgColor: "bg-amber-50 dark:bg-amber-900/20", 
    textColor: "text-amber-600 dark:text-amber-400",
    subcategories: [
      { value: "material-escolar", label: "Material Escolar" },
      { value: "brinquedos", label: "Brinquedos" },
      { value: "atividades", label: "Atividades em Casa" }
    ]
  },
  { 
    value: "autocuidado", 
    label: "Tempo para Mim", 
    Icon: Heart, 
    color: "from-rose-500 to-pink-500", 
    bgColor: "bg-rose-50 dark:bg-rose-900/20", 
    textColor: "text-rose-600 dark:text-rose-400",
    subcategories: [
      { value: "relaxamento", label: "Relaxamento" },
      { value: "skincare", label: "Skincare" },
      { value: "exercicios", label: "Exercícios em Casa" }
    ]
  },
  { 
    value: "manutencao", 
    label: "Manutenção do Lar", 
    Icon: Wrench, 
    color: "from-slate-500 to-zinc-500", 
    bgColor: "bg-slate-50 dark:bg-slate-900/20", 
    textColor: "text-slate-600 dark:text-slate-400",
    subcategories: [
      { value: "reparos-basicos", label: "Reparos Básicos" },
      { value: "ferramentas", label: "Ferramentas" },
      { value: "jardinagem", label: "Jardinagem" }
    ]
  },
];

const MOCK_KITS: (ProductKit & { category: string; subcategory: string })[] = [
  {
    id: "kit-001",
    title: "Kit Limpeza de Banheiro",
    slug: "kit-limpeza-banheiro",
    taskIntent: "BATHROOM_CLEAN",
    shortDescription: "Tudo para manter o banheiro limpo em poucos minutos, sem esforço e com praticidade.",
    coverImageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=400&fit=crop",
    generatedTitle: "Kit Limpeza de Banheiro — Limpeza rápida sem esforço",
    status: "ACTIVE",
    category: "casa",
    subcategory: "limpeza-banheiro",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 7,
      mustHaveTypes: [],
      priceRange: { min: 10, max: 200 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "1", kitId: "kit-001", asin: "A1", title: "Escova", price: 49.9, role: "MAIN", rankScore: 0.9, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "2", kitId: "kit-001", asin: "A2", title: "Desinfetante", price: 24.9, role: "SECONDARY", rankScore: 0.8, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "3", kitId: "kit-001", asin: "A3", title: "Panos", price: 29.9, role: "COMPLEMENT", rankScore: 0.7, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "4", kitId: "kit-001", asin: "A4", title: "Esponja", price: 19.9, role: "COMPLEMENT", rankScore: 0.6, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 1247,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-002",
    title: "Kit Troca de Fralda para Passeio",
    slug: "kit-troca-fralda-passeio",
    taskIntent: "DIAPER_ON_THE_GO",
    shortDescription: "Tudo para trocar fralda fora de casa com praticidade e segurança.",
    coverImageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=400&fit=crop",
    generatedTitle: "Kit Troca de Fralda (Passeio) — Praticidade para sair com o bebê",
    status: "ACTIVE",
    category: "bebe",
    subcategory: "troca-fralda",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 4,
      maxItems: 8,
      mustHaveTypes: [],
      priceRange: { min: 20, max: 150 },
      ratingMin: 4.2,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "5", kitId: "kit-002", asin: "B1", title: "Trocador", price: 89.9, role: "MAIN", rankScore: 0.94, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "6", kitId: "kit-002", asin: "B2", title: "Organizador", price: 45.9, role: "SECONDARY", rankScore: 0.82, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "7", kitId: "kit-002", asin: "B3", title: "Porta Lenços", price: 34.9, role: "COMPLEMENT", rankScore: 0.76, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 892,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-003",
    title: "Kit Organização da Pia da Cozinha",
    slug: "kit-organizacao-pia",
    taskIntent: "KITCHEN_PIA_ORG",
    shortDescription: "Praticidade e limpeza em um só lugar para sua pia de cozinha.",
    coverImageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
    generatedTitle: "Kit Organização da Pia — Resolva a bagunça da cozinha",
    status: "ACTIVE",
    category: "cozinha",
    subcategory: "organizacao-cozinha",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 6,
      mustHaveTypes: [],
      priceRange: { min: 15, max: 180 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "8", kitId: "kit-003", asin: "C1", title: "Dispenser", price: 59.9, role: "MAIN", rankScore: 0.88, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "9", kitId: "kit-003", asin: "C2", title: "Porta Esponja", price: 35.9, role: "SECONDARY", rankScore: 0.79, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "10", kitId: "kit-003", asin: "C3", title: "Escorredor", price: 42.9, role: "COMPLEMENT", rankScore: 0.71, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 654,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-004",
    title: "Kit Banho do Bebê Completo",
    slug: "kit-banho-bebe",
    taskIntent: "BABY_BATH",
    shortDescription: "Tudo para a hora do banho do bebê com segurança e praticidade.",
    coverImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
    generatedTitle: "Kit Banho do Bebê — Momento seguro e relaxante",
    status: "ACTIVE",
    category: "bebe",
    subcategory: "banho-bebe",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 4,
      maxItems: 8,
      mustHaveTypes: [],
      priceRange: { min: 30, max: 250 },
      ratingMin: 4.3,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "11", kitId: "kit-004", asin: "D1", title: "Banheira", price: 129.9, role: "MAIN", rankScore: 0.91, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "12", kitId: "kit-004", asin: "D2", title: "Termômetro", price: 39.9, role: "SECONDARY", rankScore: 0.85, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "13", kitId: "kit-004", asin: "D3", title: "Toalha", price: 49.9, role: "COMPLEMENT", rankScore: 0.78, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 543,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-005",
    title: "Kit Preparo de Marmitas",
    slug: "kit-marmitas",
    taskIntent: "MEAL_PREP",
    shortDescription: "Organize suas refeições da semana com praticidade e economia.",
    coverImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop",
    generatedTitle: "Kit Marmitas — Prepare a semana toda em 2h",
    status: "ACTIVE",
    category: "cozinha",
    subcategory: "marmitas",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 4,
      maxItems: 10,
      mustHaveTypes: [],
      priceRange: { min: 20, max: 200 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "14", kitId: "kit-005", asin: "E1", title: "Conjunto Potes", price: 89.9, role: "MAIN", rankScore: 0.93, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "15", kitId: "kit-005", asin: "E2", title: "Balança", price: 49.9, role: "SECONDARY", rankScore: 0.81, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 765,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-006",
    title: "Kit Viagem de Carro com Crianças",
    slug: "kit-viagem-carro",
    taskIntent: "CAR_TRIP_KIDS",
    shortDescription: "Tudo para viagens tranquilas de carro com as crianças.",
    coverImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=400&fit=crop",
    generatedTitle: "Kit Viagem de Carro — Entretenha e organize",
    status: "ACTIVE",
    category: "passeio",
    subcategory: "viagem-carro",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 8,
      mustHaveTypes: [],
      priceRange: { min: 25, max: 180 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "16", kitId: "kit-006", asin: "F1", title: "Organizador Banco", price: 79.9, role: "MAIN", rankScore: 0.89, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "17", kitId: "kit-006", asin: "F2", title: "Lixeira", price: 29.9, role: "SECONDARY", rankScore: 0.75, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 432,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  }
];

function CategoryButton({ 
  category, 
  isSelected, 
  onClick,
  showSubcategories,
  onSubcategoryClick,
  selectedSubcategory
}: { 
  category: Category; 
  isSelected: boolean; 
  onClick: () => void;
  showSubcategories: boolean;
  onSubcategoryClick: (sub: string) => void;
  selectedSubcategory: string | null;
}) {
  const Icon = category.Icon;
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm
          transition-all duration-200 whitespace-nowrap
          ${isSelected 
            ? `bg-gradient-to-r ${category.color} text-white shadow-lg` 
            : `${category.bgColor} ${category.textColor} hover:shadow-md`
          }
        `}
        data-testid={`btn-category-${category.value}`}
      >
        <Icon className="w-4 h-4" />
        <span>{category.label}</span>
        {category.subcategories.length > 0 && (
          <ChevronDown className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
        )}
      </motion.button>
      
      <AnimatePresence>
        {showSubcategories && category.subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="absolute z-10 left-0 mt-2 min-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {category.subcategories.map((sub) => (
                <button
                  key={sub.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubcategoryClick(sub.value);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${selectedSubcategory === sub.value
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  data-testid={`btn-subcategory-${sub.value}`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KitCard({ kit, index }: { kit: ProductKit & { category: string; subcategory: string }; index: number }) {
  const totalPrice = kit.products.reduce((sum, p) => sum + p.price, 0);
  const avgRating = 4.5;
  const category = CATEGORIES.find(c => c.value === kit.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Link href={`/kits/${kit.slug}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
          <div className="relative h-48 overflow-hidden">
            {kit.coverImageUrl ? (
              <img
                src={kit.coverImageUrl}
                alt={kit.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-green-500 text-white">
                <Package className="w-3 h-3 mr-1" />
                Kit Curado
              </Badge>
              {category && (
                <Badge className={`${category.bgColor} ${category.textColor} border-0`}>
                  <category.Icon className="w-3 h-3 mr-1" />
                  {category.label}
                </Badge>
              )}
            </div>
            
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {kit.products.length} itens
                </span>
                <span className="w-1 h-1 bg-white/50 rounded-full" />
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-5">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {kit.generatedTitle || kit.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {kit.shortDescription}
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">A partir de</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  R$ {totalPrice.toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center text-green-600 dark:text-green-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Ver kit <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Kits() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [openCategoryMenu, setOpenCategoryMenu] = useState<string | null>(null);

  const handleCategoryClick = (categoryValue: string) => {
    if (categoryValue === selectedCategory && openCategoryMenu === categoryValue) {
      setOpenCategoryMenu(null);
    } else {
      setSelectedCategory(categoryValue);
      setSelectedSubcategory(null);
      setOpenCategoryMenu(categoryValue);
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setOpenCategoryMenu(null);
  };

  const filteredKits = MOCK_KITS.filter(kit => {
    if (selectedCategory === "all") return true;
    if (selectedSubcategory) return kit.subcategory === selectedSubcategory;
    return kit.category === selectedCategory;
  });

  const activeCategory = CATEGORIES.find(c => c.value === selectedCategory);
  const activeSubcategory = activeCategory?.subcategories.find(s => s.value === selectedSubcategory);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Curadoria Inteligente
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Kits de Produtos por Tarefa
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Soluções completas montadas por especialistas para resolver tarefas do dia a dia. 
              Produtos selecionados, testados e prontos para comprar.
            </p>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-white/80">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{MOCK_KITS.length} kits disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Atualização diária</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category.value}
                category={category}
                isSelected={selectedCategory === category.value}
                onClick={() => handleCategoryClick(category.value)}
                showSubcategories={openCategoryMenu === category.value && selectedCategory === category.value}
                onSubcategoryClick={handleSubcategoryClick}
                selectedSubcategory={selectedSubcategory}
              />
            ))}
          </div>
          
          {/* Active Filter Indicator */}
          {(selectedCategory !== "all" || selectedSubcategory) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 text-sm"
            >
              <span className="text-gray-500 dark:text-gray-400">Filtrando por:</span>
              {activeCategory && (
                <Badge className={`${activeCategory.bgColor} ${activeCategory.textColor}`}>
                  <activeCategory.Icon className="w-3 h-3 mr-1" />
                  {activeCategory.label}
                </Badge>
              )}
              {activeSubcategory && (
                <>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <Badge variant="outline">{activeSubcategory.label}</Badge>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory(null);
                  setOpenCategoryMenu(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
                data-testid="btn-clear-filters"
              >
                Limpar filtros
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Kits Grid */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {filteredKits.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${selectedSubcategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredKits.map((kit, index) => (
                <KitCard key={kit.id} kit={kit} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nenhum kit encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Ainda não temos kits nesta categoria, mas estamos preparando!
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory(null);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500"
                data-testid="btn-show-all-kits"
              >
                Ver todos os kits
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coming Soon */}
        {filteredKits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-dashed border-2 border-gray-300 dark:border-gray-700">
              <CardContent className="py-12">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  Mais kits em breve!
                </h3>
                <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                  Estamos preparando mais kits curados para facilitar sua vida. 
                  Volte em breve para conferir as novidades.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
