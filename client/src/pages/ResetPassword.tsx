import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";

export function ResetPassword() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Extract token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: "Token inválido",
        description: "Link de recuperação inválido ou expirado.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const resetMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao redefinir senha");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      toast({
        title: "Senha alterada!",
        description: data.message,
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao redefinir senha.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, insira uma nova senha.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (!token) {
      toast({
        title: "Token inválido",
        description: "Link de recuperação inválido.",
        variant: "destructive",
      });
      return;
    }
    
    resetMutation.mutate({ token, newPassword });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 1, label: "Muito fraca", color: "text-red-500" };
    if (password.length < 8) return { strength: 2, label: "Fraca", color: "text-orange-500" };
    if (password.length < 12) return { strength: 3, label: "Média", color: "text-yellow-500" };
    return { strength: 4, label: "Forte", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (isSuccess) {
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
                  Senha Alterada
                </h1>
              </motion.div>
            </Link>
          </motion.div>

          <Card className="glassmorphism border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-outfit">Senha alterada com sucesso!</CardTitle>
              <CardDescription className="text-gray-600">
                Você será redirecionado para o login em instantes
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Senha alterada com sucesso!</h3>
                  <p className="text-gray-600">
                    Sua senha foi redefinida. Agora você pode fazer login com sua nova senha.
                  </p>
                </div>
              </motion.div>

              <Link href="/login">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-login">
                  Fazer login agora
                </Button>
              </Link>
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="glassmorphism border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-outfit">Link inválido</CardTitle>
              <CardDescription className="text-gray-600">
                O link de recuperação é inválido ou expirou
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Link inválido ou expirado</h3>
                  <p className="text-gray-600">
                    O link de recuperação pode ter expirado ou ser inválido. 
                    Solicite um novo link de recuperação.
                  </p>
                </div>
              </motion.div>

              <div className="space-y-3">
                <Link href="/forgot-password">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-request-new">
                    Solicitar novo link
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button variant="outline" className="w-full" data-testid="button-back-login">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
                Nova Senha
              </h1>
            </motion.div>
          </Link>
        </motion.div>

        <Card className="glassmorphism border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="absolute top-4 left-4" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </Link>
            
            <CardTitle className="text-xl font-outfit">Criar nova senha</CardTitle>
            <CardDescription className="text-gray-600">
              Digite sua nova senha. Escolha uma senha forte e segura.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 pr-10"
                    required
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Força da senha</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                          passwordStrength.strength === 2 ? 'bg-orange-500 w-2/4' :
                          passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/4' :
                          passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pr-10"
                    required
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className="flex items-center space-x-2">
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500">Senhas coincidem</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-500">Senhas não coincidem</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Dicas para uma senha segura:</p>
                    <ul className="mt-1 space-y-1 text-blue-700">
                      <li>• Use pelo menos 8 caracteres</li>
                      <li>• Combine letras maiúsculas e minúsculas</li>
                      <li>• Inclua números e símbolos</li>
                      <li>• Evite informações pessoais</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                disabled={resetMutation.isPending || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                data-testid="button-submit"
              >
                {resetMutation.isPending ? "Alterando senha..." : "Alterar senha"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Lembrou da senha?{" "}
              <Link href="/login">
                <span className="text-purple-600 hover:underline cursor-pointer">
                  Fazer login
                </span>
              </Link>
            </div>
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