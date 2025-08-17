import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function GradientButton({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  className,
  disabled,
  type = "button"
}: GradientButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700",
    secondary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
    glass: "glassmorphism text-gray-700 hover:bg-white/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        type={type}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 rounded-full font-poppins font-semibold transition-all duration-300 shadow-lg from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-base hover:shadow-pink-500/25 bg-white hover:bg-gray-100 px-8 py-4 text-[#ffffff]"
      >
        {children}
      </Button>
    </motion.div>
  );
}
