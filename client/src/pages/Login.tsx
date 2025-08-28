import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Shield, 
  User,
  Chrome,
  Lock,
  UserPlus
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";

export function Login() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
    if (!adminEmail.trim() || !adminPassword.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }
    
    // Detecta automaticamente se é admin baseado no email
    const isAdmin = adminEmail.includes('@karooma.com') || adminEmail.includes('admin');
    loginMutation.mutate({ 
      email: adminEmail, 
      password: adminPassword, 
      type: isAdmin ? 'admin' : 'user' 
    });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Registro de usuário será implementado em breve. Use o Google por enquanto.",
      variant: "default",
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/signin/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link href="/">
            <motion.div 
              className="flex flex-col items-center space-y-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-16 h-16 flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={karoomaIcon} 
                  alt="Karooma Icon" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Entrar na Karooma
              </h1>
            </motion.div>
          </Link>
        </motion.div>

        <Card className="glassmorphism border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="absolute top-4 left-4" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </Link>
            
            <CardTitle className="text-xl font-outfit">Acesse sua conta</CardTitle>
            <CardDescription className="text-gray-600">
              Escolha como você quer entrar na plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Login Principal */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-sm"
                size="lg"
                disabled={loginMutation.isPending}
                data-testid="button-google-login"
              >
                <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                Continuar com Google
              </Button>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            {/* Formulário Unificado com Detecção Automática */}
            <div className="text-center pb-2">
              <p className="text-sm text-gray-600 mb-4">
                Login automático - Digite suas credenciais abaixo
              </p>
            </div>

            {/* Toggle entre Login e Cadastro */}
            <div className="flex justify-center space-x-4 py-2">
              <Button
                variant={!isSignUp ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSignUp(false)}
                className="text-xs"
                data-testid="button-login-mode"
              >
                Entrar
              </Button>
              <Button
                variant={isSignUp ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSignUp(true)}
                className="text-xs"
                data-testid="button-signup-mode"
              >
                Criar conta
              </Button>
            </div>

            {/* Formulário Principal */}
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="pl-10"
                      required={isSignUp}
                      data-testid="input-name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-email"
                  />
                </div>
                {/* Indicador visual do tipo de conta */}
                {adminEmail && (
                  <div className="text-xs text-center">
                    {adminEmail.includes('@karooma.com') || adminEmail.includes('admin') ? (
                      <span className="text-purple-600 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        Detectado: Conta de Administrador
                      </span>
                    ) : (
                      <span className="text-pink-600 flex items-center justify-center gap-1">
                        <User className="w-3 h-3" />
                        Detectado: Conta de Usuário
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  adminEmail.includes('@karooma.com') || adminEmail.includes('admin')
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                }`}
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Processando..." : isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar conta
                  </>
                ) : adminEmail.includes('@karooma.com') || adminEmail.includes('admin') ? (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Entrar como Admin
                  </>
                ) : "Entrar"}
              </Button>
            </form>

            {/* Demo para Desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3 text-center">
                  Desenvolvimento - Login Demo
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setAdminEmail("admin@karooma.com");
                      setAdminPassword("Karo0maSecure2025#6gu5xk");
                    }}
                    data-testid="button-admin-demo"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Preencher Admin Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setAdminEmail("user@example.com");
                      setAdminPassword("user123");
                    }}
                    data-testid="button-user-demo"
                  >
                    <User className="w-3 h-3 mr-1" />
                    Preencher Usuário Demo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link para voltar */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link href="/">
            <span className="text-sm text-gray-600 hover:text-purple-600 transition-colors cursor-pointer">
              ← Voltar para a página inicial
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}