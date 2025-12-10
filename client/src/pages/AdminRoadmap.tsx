import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Rocket, Zap, Bell, Mail, MessageSquare, TrendingUp, Target, AlertCircle, Plug2, Sheet } from "lucide-react";
import { motion } from "framer-motion";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  category: string;
  estimatedDays: string;
  prerequisites: string[];
  roi: string;
  icon: any;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "push-notifications",
    title: "Web Push Notifications System",
    description: "Sistema de notificações push nativas via PWA para engajamento direto com alertas de preço, novo conteúdo, ofertas exclusivas e lembretes personalizados.",
    status: "planned",
    priority: "high",
    category: "Marketing Automation",
    estimatedDays: "10 dias",
    prerequisites: [
      "✅ Sistema de autenticação",
      "✅ Sistema de favoritos",
      "✅ Rastreamento de preços",
      "✅ PostgreSQL database"
    ],
    roi: "+15% conversão em notificações, ROI em 2-3 meses",
    icon: Bell
  },
  {
    id: "email-welcome",
    title: "Email Welcome System",
    description: "Sistema automatizado de boas-vindas e entrega de lead magnet via SendGrid. Primeira fase do Marketing Automation MVP.",
    status: "in-progress",
    priority: "high",
    category: "Marketing Automation",
    estimatedDays: "2 dias",
    prerequisites: [
      "✅ SendGrid configurado",
      "✅ Sistema de newsletter"
    ],
    roi: ">25% taxa de abertura de emails",
    icon: Mail
  },
  {
    id: "whatsapp-integration",
    title: "WhatsApp Business Integration",
    description: "Integração com WhatsApp Business API para comunicação direta com leads de alto engajamento. Fase 2 pós-MVP.",
    status: "planned",
    priority: "medium",
    category: "Marketing Automation",
    estimatedDays: "5-7 dias",
    prerequisites: [
      "⏳ MVP validado com resultados positivos",
      "⏳ WhatsApp Business API aprovado"
    ],
    roi: "Aumento de conversão em leads qualificados",
    icon: MessageSquare
  },
  {
    id: "price-alert-system",
    title: "Price Alert Automation",
    description: "Sistema de monitoramento e alertas automáticos de queda de preço para produtos favoritados pelos usuários.",
    status: "planned",
    priority: "high",
    category: "Product Features",
    estimatedDays: "3 dias",
    prerequisites: [
      "✅ Sistema de favoritos",
      "✅ Rastreamento de preços",
      "⏳ Sistema de notificações"
    ],
    roi: "+10-20% conversão em produtos notificados",
    icon: TrendingUp
  },
  {
    id: "ai-personalization",
    title: "AI-Powered Content Personalization",
    description: "Personalização de conteúdo usando IA baseada em comportamento, preferências e histórico de navegação do usuário.",
    status: "planned",
    priority: "medium",
    category: "Content Enhancement",
    estimatedDays: "7-10 dias",
    prerequisites: [
      "⏳ Base de usuários estabelecida",
      "⏳ Dados de comportamento suficientes",
      "✅ Integração com LLMs"
    ],
    roi: "Aumento de engajamento e tempo no site",
    icon: Zap
  },
  {
    id: "advanced-segmentation",
    title: "Advanced Behavioral Segmentation",
    description: "Segmentação avançada de usuários por idade dos filhos, categorias de interesse, comportamento de compra e nível de engajamento.",
    status: "planned",
    priority: "low",
    category: "Marketing Automation",
    estimatedDays: "4-5 dias",
    prerequisites: [
      "⏳ Base de dados robusta",
      "⏳ Analytics implementados",
      "✅ Sistema de preferências"
    ],
    roi: "Campanhas mais direcionadas e efetivas",
    icon: Target
  },
  {
    id: "sendgrid-connector",
    title: "Migrar para SendGrid Connector",
    description: "Substituir integração manual do SendGrid por Replit Connector para gerenciamento automático de credenciais, autenticação única e reutilização entre projetos. Elimina necessidade de gerenciar API keys manualmente.",
    status: "planned",
    priority: "low",
    category: "Infrastructure",
    estimatedDays: "30-45 minutos",
    prerequisites: [
      "✅ SendGrid configurado e funcionando",
      "✅ Sistema de email welcome"
    ],
    roi: "Melhor segurança, menos manutenção de keys",
    icon: Plug2
  },
  {
    id: "google-sheets-connector",
    title: "Migrar para Google Sheets Connector",
    description: "Migrar de API pública CSV para Google Sheets Connector autenticado. Permite acesso a planilhas privadas, maior confiabilidade e recursos avançados de leitura/escrita de dados.",
    status: "planned",
    priority: "low",
    category: "Infrastructure",
    estimatedDays: "1 hora",
    prerequisites: [
      "✅ Sistema de importação funcionando",
      "✅ Merge de JSON + colunas implementado"
    ],
    roi: "Acesso a planilhas privadas, mais robusto",
    icon: Sheet
  }
];

const statusConfig = {
  planned: {
    label: "Planejado",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: Clock
  },
  "in-progress": {
    label: "Em Progresso",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Rocket
  },
  completed: {
    label: "Concluído",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle2
  }
};

const priorityConfig = {
  high: {
    label: "Alta",
    color: "bg-red-100 text-red-800"
  },
  medium: {
    label: "Média",
    color: "bg-yellow-100 text-yellow-800"
  },
  low: {
    label: "Baixa",
    color: "bg-green-100 text-green-800"
  }
};

export default function AdminRoadmap() {
  const getStatusIcon = (status: RoadmapItem["status"]) => {
    const StatusIcon = statusConfig[status].icon;
    return <StatusIcon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 md:pt-24 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Roadmap de Funcionalidades
              </h1>
              <p className="text-gray-600">
                Planejamento e acompanhamento de futuras implementações do Karooma
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.open('/replit.md', '_blank')}
              className="hover:bg-purple-50"
            >
              📄 Ver Documentação Completa
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Itens</p>
                    <p className="text-2xl font-bold text-gray-900">{roadmapItems.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Progresso</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {roadmapItems.filter(item => item.status === 'in-progress').length}
                    </p>
                  </div>
                  <Rocket className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Planejados</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {roadmapItems.filter(item => item.status === 'planned').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Prioridade Alta</p>
                    <p className="text-2xl font-bold text-red-600">
                      {roadmapItems.filter(item => item.priority === 'high').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Roadmap Items */}
        <div className="space-y-4">
          {roadmapItems.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                          <ItemIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={statusConfig[item.status].color}
                            >
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{statusConfig[item.status].label}</span>
                            </Badge>
                            <Badge className={priorityConfig[item.priority].color}>
                              {priorityConfig[item.priority].label}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Categoria</p>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Tempo Estimado</p>
                        <p className="text-sm text-gray-600">{item.estimatedDays}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">ROI Esperado</p>
                        <p className="text-sm text-gray-600">{item.roi}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Pré-requisitos</p>
                        <div className="space-y-1">
                          {item.prerequisites.map((prereq, idx) => (
                            <p key={idx} className="text-xs text-gray-600">
                              {prereq}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">
                    📝 Nota sobre Implementação
                  </h3>
                  <p className="text-sm text-purple-800">
                    Todos os planos detalhados estão documentados no arquivo <code className="bg-white/50 px-2 py-0.5 rounded">replit.md</code> para referência futura. 
                    Cada funcionalidade inclui especificações técnicas, arquitetura, fluxos de usuário, métricas de sucesso e próximos passos. 
                    As implementações devem seguir a ordem de prioridade e aguardar validação de pré-requisitos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
