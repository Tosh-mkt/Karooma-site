import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Mail, Send } from "lucide-react";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const resetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao solicitar recuperação");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Email enviado!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao solicitar recuperação de senha.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu endereço de email.",
        variant: "destructive",
      });
      return;
    }
    
    resetMutation.mutate(email);
  };

  if (isSubmitted) {
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
                  Email Enviado
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
              
              <CardTitle className="text-xl font-outfit">Verifique seu email</CardTitle>
              <CardDescription className="text-gray-600">
                Instruções para recuperar sua senha foram enviadas
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
                  <Mail className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Email enviado com sucesso!</h3>
                  <p className="text-gray-600">
                    Enviamos um link de recuperação para <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    O link é válido por 1 hora. Verifique também sua pasta de spam.
                  </p>
                </div>
              </motion.div>

              <div className="space-y-4">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                  data-testid="button-resend"
                >
                  Enviar novamente
                </Button>
                
                <Link href="/login">
                  <Button variant="ghost" className="w-full" data-testid="button-back-login">
                    Voltar para o login
                  </Button>
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
                Recuperar Senha
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
            
            <CardTitle className="text-xl font-outfit">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-gray-600">
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu endereço de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Como funciona:</p>
                    <ul className="mt-1 space-y-1 text-blue-700">
                      <li>• Você receberá um email com um link seguro</li>
                      <li>• O link expira em 1 hora</li>
                      <li>• Clique no link para criar uma nova senha</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                disabled={resetMutation.isPending}
                data-testid="button-submit"
              >
                {resetMutation.isPending ? (
                  <>
                    <Send className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar link de recuperação
                  </>
                )}
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