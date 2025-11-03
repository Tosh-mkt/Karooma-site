import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, Loader2 } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number;
  productTitle?: string;
  category?: string;
  type: 'product' | 'category';
}

export default function AlertModal({ isOpen, onClose, productId, productTitle, category, type }: AlertModalProps) {
  const { toast } = useToast();
  const [minDiscountPercent, setMinDiscountPercent] = useState(20);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);

  // Verificar se o usuário está autenticado
  const { data: session } = useQuery<any>({ 
    queryKey: ['/api/session'],
    retry: false,
    refetchOnWindowFocus: false
  });

  const isAuthenticated = !!session?.user;

  // Push notifications hook
  const { isSupported, permission, isSubscribed, subscribe } = usePushNotifications();

  // Sincronizar notifyPush com isSubscribed
  useEffect(() => {
    if (isSubscribed) {
      setNotifyPush(true);
    }
  }, [isSubscribed]);

  // Criar alerta
  const createAlertMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/alerts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "✅ Alerta criado!",
        description: `Você receberá notificações quando houver ${minDiscountPercent}% ou mais de desconto.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar alerta",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handlePushToggle = async (enabled: boolean) => {
    if (!isAuthenticated) return;

    if (enabled && !isSubscribed) {
      const success = await subscribe();
      if (success) {
        setNotifyPush(true);
        toast({
          title: "✅ Notificações push ativadas!",
          description: "Você receberá notificações push quando houver promoções.",
        });
      } else {
        setNotifyPush(false);
        toast({
          title: "Erro ao ativar notificações",
          description: "Permita notificações no navegador para continuar.",
          variant: "destructive",
        });
      }
    } else {
      setNotifyPush(enabled);
    }
  };

  const handleCreateAlert = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para criar alertas de preço.",
        variant: "destructive",
      });
      return;
    }

    createAlertMutation.mutate({
      type,
      productId: type === 'product' ? productId : undefined,
      category: type === 'category' ? category : undefined,
      minDiscountPercent,
      notifyEmail,
      notifyPush,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Criar Alerta de Promoção
          </DialogTitle>
          <DialogDescription>
            {type === 'product' && productTitle && (
              <span className="block mt-2 font-medium text-gray-700">{productTitle}</span>
            )}
            {type === 'category' && category && (
              <span className="block mt-2 font-medium text-gray-700">Categoria: {category}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-6 text-center">
            <p className="text-gray-600 mb-4">Faça login para criar alertas de preço e receber notificações quando houver promoções!</p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Fazer Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Desconto mínimo */}
            <div className="space-y-2">
              <Label htmlFor="discount">
                Desconto Mínimo: <span className="text-purple-600 font-bold">{minDiscountPercent}%</span>
              </Label>
              <Input
                id="discount"
                type="range"
                min="10"
                max="70"
                step="5"
                value={minDiscountPercent}
                onChange={(e) => setMinDiscountPercent(Number(e.target.value))}
                className="cursor-pointer"
                data-testid="input-discount-slider"
              />
              <p className="text-xs text-gray-500">
                Você será notificado quando o desconto for igual ou maior que {minDiscountPercent}%
              </p>
            </div>

            {/* Opções de notificação */}
            <div className="space-y-3">
              <Label>Como deseja ser notificado?</Label>
              
              <div className="flex items-center justify-between space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">📧 Email</span>
                </div>
                <Switch
                  checked={notifyEmail}
                  onCheckedChange={setNotifyEmail}
                  data-testid="switch-notify-email"
                />
              </div>

              <div className="flex items-center justify-between space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🔔 Notificação Push</span>
                    {!isSupported && <span className="text-xs text-gray-500">(não suportado)</span>}
                  </div>
                  {isSupported && permission === 'denied' && (
                    <span className="text-xs text-red-500">Permissão negada. Ative nas configurações do navegador.</span>
                  )}
                </div>
                <Switch
                  checked={notifyPush}
                  onCheckedChange={handlePushToggle}
                  disabled={!isSupported || permission === 'denied'}
                  data-testid="switch-notify-push"
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={createAlertMutation.isPending}
                data-testid="button-cancel-alert"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAlert}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={createAlertMutation.isPending}
                data-testid="button-create-alert"
              >
                {createAlertMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Criar Alerta
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
