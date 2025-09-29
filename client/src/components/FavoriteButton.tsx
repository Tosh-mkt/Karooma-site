import { useState } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function FavoriteButton({ 
  productId, 
  className, 
  size = "md", 
  showText = false 
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if product is favorited
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/favorites/check/${productId}`],
    enabled: isAuthenticated && !!productId,
  });

  const isFavorite = (favoriteData as { isFavorite: boolean })?.isFavorite || false;

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      toast({
        title: "Adicionado aos favoritos!",
        description: "O produto foi salvo na sua lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removido dos favoritos",
        description: "O produto foi removido da sua lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar produtos nos favoritos.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const isLoading = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;

  const sizeClasses = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1",
    lg: "h-10 w-10 p-2"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  if (showText) {
    return (
      <Button
        variant={isFavorite ? "default" : "outline"}
        size="sm"
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={cn(
          "gap-2 transition-all duration-300",
          isFavorite 
            ? "bg-pink-500 hover:bg-pink-600 text-white" 
            : "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300",
          isAnimating && "animate-pulse",
          className
        )}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors duration-300",
              isFavorite ? "fill-current" : ""
            )} 
          />
        )}
        {isFavorite ? "Favoritado" : "Favoritar"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-300 hover:bg-pink-50",
        isFavorite 
          ? "text-pink-500 hover:text-pink-600" 
          : "text-gray-400 hover:text-pink-500",
        isAnimating && "animate-bounce",
        className
      )}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <Heart 
          className={cn(
            iconSizes[size],
            "transition-all duration-300",
            isFavorite ? "fill-current" : "",
            isAnimating && "scale-125"
          )} 
        />
      )}
    </Button>
  );
}