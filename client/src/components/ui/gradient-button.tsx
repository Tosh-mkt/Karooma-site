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
        className={cn(
          "rounded-full font-poppins font-semibold transition-all duration-300 shadow-lg",
          variants[variant],
          sizes[size],
          variant === "primary" && "hover:shadow-pink-500/25",
          variant === "secondary" && "hover:shadow-blue-500/25",
          className
        )}
      >
        {children}
      </Button>
    </motion.div>
  );
}
