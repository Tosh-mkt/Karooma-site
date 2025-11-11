import { motion } from "framer-motion";
import { Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  currentPrice: string | null;
  originalPrice: string | null;
  affiliateLink: string;
  rating: string | null;
  discount: number | null;
  featured: boolean | null;
  createdAt: Date;
}

interface MissionProductsProps {
  products?: Product[];
}

export function MissionProducts({ products = [] }: MissionProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Produtos que Facilitam
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Selecionados com carinho pela nossa curadoria para tornar essa missão ainda mais leve
        </p>
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
