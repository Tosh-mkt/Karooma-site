import { useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MissionFavoriteButtonProps {
  missionId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function MissionFavoriteButton({ 
  missionId, 
  className, 
  size = "md", 
  showText = false 
}: MissionFavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if mission is favorited
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/mission-favorites/check/${missionId}`],
    enabled: isAuthenticated && !!missionId,
  });

  const isFavorite = (favoriteData as { isFavorite: boolean })?.isFavorite || false;

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/mission-favorites/${missionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mission-favorites/check/${missionId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mission-favorites"] });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      toast({
        title: "Adicionado aos favoritos!",
        description: "A missão foi salva na sua lista de favoritos.",
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
      return apiRequest("DELETE", `/api/mission-favorites/${missionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mission-favorites/check/${missionId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mission-favorites"] });
      toast({
        title: "Removido dos favoritos",
        description: "A missão foi removida da sua lista de favoritos.",
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

  const handleToggleFavorite = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar missões nos favoritos.",
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
        data-testid="button-mission-favorite"
        variant={isFavorite ? "default" : "outline"}
        size="sm"
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={cn(
          "gap-2 transition-all duration-300",
          !isFavorite && "hover:bg-green-50 hover:text-green-600 hover:border-green-300",
          isAnimating && "animate-pulse",
          className,
          isFavorite && "!bg-green-500 hover:!bg-green-600 !text-white !border-green-500"
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
      data-testid="button-mission-favorite-icon"
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-300 hover:bg-green-50",
        isFavorite 
          ? "text-green-500 hover:text-green-600" 
          : "text-gray-400 hover:text-green-500",
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
