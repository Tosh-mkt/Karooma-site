import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function TempLogin() {
  const [userId, setUserId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("/api/auth/temp-login", {
        method: "POST",
        body: { userId },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vinda, ${data.user.firstName || data.user.email}!`,
      });
      
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session-user"] });
      
      // Redirect to admin if is admin, otherwise home
      setTimeout(() => {
        window.location.href = data.isAdmin ? "/admin/dashboard" : "/";
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login. Verifique o ID do usuário.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    if (!userId.trim()) {
      toast({
        title: "ID necessário",
        description: "Por favor, insira um ID de usuário válido.",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate(userId);
  };

  const quickLoginAdmin = () => {
    setUserId("admin-karooma");
    loginMutation.mutate("admin-karooma");
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glassmorphism border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-outfit gradient-text">
              Login Temporário - Karooma
            </CardTitle>
            <p className="text-gray-600">
              Entre com seu ID de usuário para acessar o sistema
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId">ID do Usuário</Label>
              <Input
                id="userId"
                type="text"
                placeholder="Digite seu ID de usuário"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={loginMutation.isPending || !userId.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
            
            <Button
              onClick={quickLoginAdmin}
              disabled={loginMutation.isPending}
              variant="outline"
              className="w-full border-purple-200 hover:bg-purple-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Login Rápido - Admin
            </Button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <h4 className="font-semibold text-blue-800 mb-2">IDs de Usuário Disponíveis:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• <code>admin-karooma</code> - Administrador principal</li>
                <li>• <code>test-admin</code> - Usuário de teste admin</li>
              </ul>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Sistema temporário para desenvolvimento.</p>
              <p>OAuth do Replit será configurado em produção.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}