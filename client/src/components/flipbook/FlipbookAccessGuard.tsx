import React from 'react';
import { useFlipbookAccess, useEmailFromUrl } from '@/hooks/useFlipbookAccess';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlipbookAccessGuardProps {
  flipbookId: string;
  children: React.ReactNode;
}

export function FlipbookAccessGuard({ flipbookId, children }: FlipbookAccessGuardProps) {
  const { hasAccess, isLoading, error, requireAuth, isAdmin, message } = useFlipbookAccess(flipbookId);
  const emailFromUrl = useEmailFromUrl();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-poppins">Verificando acesso...</p>
        </motion.div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="relative">
        {isAdmin && (
          <div className="fixed top-4 right-4 z-50 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Crown className="w-4 h-4" />
            Modo Admin
          </div>
        )}
        {children}
      </div>
    );
  }

  // Access denied screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="font-fredoka text-2xl text-gray-800">
              {requireAuth ? 'Login Necessário' : 'Acesso Restrito'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {requireAuth ? (
              <div>
                <p className="text-gray-600 text-center mb-4 font-poppins">
                  Este flipbook é exclusivo para usuários autorizados. 
                  Entre com seu email para verificar o acesso.
                </p>
                
                <AccessForm flipbookId={flipbookId} />
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-center mb-4 font-poppins">
                  Você não tem permissão para acessar este conteúdo.
                </p>
                
                {emailFromUrl && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <p className="text-gray-700 text-sm">
                      Email: <strong>{emailFromUrl}</strong>
                    </p>
                  </div>
                )}
                
                <AccessForm flipbookId={flipbookId} />
              </div>
            )}
            
            {message && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-blue-700 text-sm">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Form component for testing access
function AccessForm({ flipbookId }: { flipbookId: string }) {
  const [email, setEmail] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Redirect with email parameter to test access
      const url = new URL(window.location.href);
      url.searchParams.set('email', email.trim());
      window.location.href = url.toString();
    }
  };

  const handleAdminTest = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('admin', 'true');
    window.location.href = url.toString();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seu email:
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email para verificar acesso"
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full">
          Verificar Acesso
        </Button>
      </form>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdminTest}
            className="w-full text-xs"
          >
            Testar como Admin (Dev Only)
          </Button>
        </div>
      )}
    </div>
  );
}