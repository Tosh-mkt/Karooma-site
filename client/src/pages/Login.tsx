import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Shield, 
  User,
  Chrome
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState("user");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, type }: { email: string; password: string; type: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, loginType: type }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vinda${data.user?.firstName ? `, ${data.user.firstName}` : ''}!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      setTimeout(() => {
        window.location.href = data.isAdmin ? "/admin/dashboard" : "/";
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }
    
    // Detectar automaticamente se é admin baseado no email
    const isAdminEmail = email.includes('@karooma.com') || email.includes('admin');
    loginMutation.mutate({ email, password, type: isAdminEmail ? 'admin' : 'user' });
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?type=user`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glassmorphism border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="absolute top-4 left-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </Link>
            
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-outfit font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Entrar na Karooma
            </CardTitle>
            <CardDescription className="text-gray-600">
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Removido seletor de tipo - detecção automática */}

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-2 hover:bg-gray-50 transition-colors"
              disabled={loginMutation.isPending}
            >
              <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
              Continuar com Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            {/* Email/Password Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Desenvolvimento - Login Rápido */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3 text-center">
                  Desenvolvimento - Login Rápido
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setEmail("admin@karooma.com");
                      setPassword("Karo0ma@2025!SecureP4ss");
                      setLoginType('admin');
                    }}
                  >
                    Admin Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setEmail("user@karooma.com");
                      setPassword("user123");
                      setLoginType('user');
                    }}
                  >
                    Usuário Demo (user@karooma.com)
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>
                Não tem uma conta? {" "}
                <Link href="/register">
                  <span className="text-pink-600 hover:text-pink-700 font-medium cursor-pointer">
                    Criar conta
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}