import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bell, Trash2, RefreshCw, AlertCircle, Loader2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import AlertModal from "@/components/AlertModal";

interface Alert {
  id: string;
  type: 'product' | 'category';
  productId?: number;
  category?: string;
  minDiscountPercent: number;
  notifyEmail: boolean;
  notifyPush: boolean;
  isActive: boolean;
  createdAt: Date;
  product?: {
    id: number;
    title: string;
    imageUrl?: string;
    currentPrice?: number;
  };
}

export default function MyAlerts() {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Buscar alertas do usuário
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });

  // Verificar autenticação
  const { data: session } = useQuery<any>({ 
    queryKey: ['/api/session'],
    retry: false 
  });

  // Deletar alerta
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest(`/api/alerts/${alertId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "✅ Alerta removido",
        description: "O alerta foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover alerta",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Atualizar alerta
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/alerts/${id}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "✅ Alerta atualizado",
        description: "Suas preferências foram salvas.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar alerta",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (alertId: string, currentStatus: boolean) => {
    updateAlertMutation.mutate({
      id: alertId,
      updates: { isActive: !currentStatus }
    });
  };

  const handleToggleEmail = (alertId: string, currentStatus: boolean) => {
    updateAlertMutation.mutate({
      id: alertId,
      updates: { notifyEmail: !currentStatus }
    });
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Faça login para ver seus alertas
          </h2>
          <p className="text-gray-600 mb-6">
            Crie alertas de preço e receba notificações quando seus produtos favoritos entrarem em promoção!
          </p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Meus Alertas de Promoção
              </h1>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              data-testid="button-create-new-alert"
            >
              <Bell className="h-4 w-4 mr-2" />
              Criar Alerta
            </Button>
          </div>
          <p className="text-gray-600">
            Gerencie seus alertas e receba notificações quando detectarmos promoções
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!alerts || alerts.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum alerta criado ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie seu primeiro alerta e seja notificado quando houver promoções imperdíveis!
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Criar Primeiro Alerta
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alerts List */}
        {!isLoading && alerts && alerts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {alert.type === 'product' ? (
                            <ShoppingCart className="h-5 w-5 text-purple-600" />
                          ) : (
                            <Bell className="h-5 w-5 text-pink-600" />
                          )}
                          {alert.type === 'product' ? 'Produto' : 'Categoria'}
                        </CardTitle>
                      </div>
                      <Badge 
                        variant={alert.isActive ? "default" : "secondary"}
                        className={alert.isActive ? "bg-green-500" : ""}
                      >
                        {alert.isActive ? 'Ativo' : 'Pausado'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Informações do alerta */}
                    {alert.type === 'product' && alert.product && (
                      <div className="flex gap-3">
                        {alert.product.imageUrl && (
                          <img 
                            src={alert.product.imageUrl} 
                            alt={alert.product.title}
                            className="w-16 h-16 object-contain rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {alert.product.title}
                          </p>
                          {alert.product.currentPrice && (
                            <p className="text-xs text-gray-500 mt-1">
                              Preço atual: R$ {alert.product.currentPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {alert.type === 'category' && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">
                          Categoria: {alert.category}
                        </p>
                      </div>
                    )}

                    {/* Configurações */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Desconto mínimo:</span>
                        <Badge variant="outline" className="font-bold text-purple-600">
                          {alert.minDiscountPercent}% OFF
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Notificar por email</span>
                        <Switch
                          checked={alert.notifyEmail}
                          onCheckedChange={() => handleToggleEmail(alert.id, alert.notifyEmail)}
                          data-testid={`switch-email-${alert.id}`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Alerta ativo</span>
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => handleToggleActive(alert.id, alert.isActive)}
                          data-testid={`switch-active-${alert.id}`}
                        />
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="pt-3 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        disabled={deleteAlertMutation.isPending}
                        data-testid={`button-delete-${alert.id}`}
                      >
                        {deleteAlertMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Remover Alerta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Alert Modal */}
        <AlertModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          type="category"
          category="Alimentação"
        />
      </div>
    </div>
  );
}
