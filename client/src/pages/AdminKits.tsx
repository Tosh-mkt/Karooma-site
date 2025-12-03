import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Plus, 
  Package, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Crown,
  Zap,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Settings,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ProductKit } from "@shared/schema";

const MOCK_KITS: ProductKit[] = [
  {
    id: "kit-001",
    title: "Kit Limpeza de Banheiro",
    slug: "kit-limpeza-banheiro",
    taskIntent: "BATHROOM_CLEAN",
    shortDescription: "Tudo para manter o banheiro limpo em poucos minutos.",
    coverImageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [
        { name: "escovas", keywords: ["escova sanitária silicone"], weight: 1.5 },
        { name: "desinfetantes", keywords: ["desinfetante banheiro"], weight: 1.2 }
      ],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 7,
      mustHaveTypes: [{ type: "MAIN", minCount: 1 }],
      priceRange: { min: 10, max: 200 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: ["Home & Kitchen"],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "1", kitId: "kit-001", asin: "A1", title: "Escova Sanitária", price: 49.9, role: "MAIN", rankScore: 0.92, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "2", kitId: "kit-001", asin: "A2", title: "Desinfetante", price: 24.9, role: "SECONDARY", rankScore: 0.81, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "3", kitId: "kit-001", asin: "A3", title: "Panos Microfibra", price: 29.9, role: "COMPLEMENT", rankScore: 0.75, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "4", kitId: "kit-001", asin: "A4", title: "Esponja Mágica", price: 19.9, role: "COMPLEMENT", rankScore: 0.68, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 1247,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-002",
    title: "Kit Troca de Fralda para Passeio",
    slug: "kit-troca-fralda-passeio",
    taskIntent: "DIAPER_ON_THE_GO",
    shortDescription: "Tudo para trocar fralda fora de casa com praticidade.",
    coverImageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 4,
      maxItems: 8,
      mustHaveTypes: [],
      priceRange: { min: 20, max: 150 },
      ratingMin: 4.2,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "5", kitId: "kit-002", asin: "B1", title: "Trocador Portátil", price: 89.9, role: "MAIN", rankScore: 0.94, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "6", kitId: "kit-002", asin: "B2", title: "Porta Fraldas", price: 45.9, role: "SECONDARY", rankScore: 0.82, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "7", kitId: "kit-002", asin: "B3", title: "Porta Lenços", price: 34.9, role: "COMPLEMENT", rankScore: 0.76, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 892,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-003",
    title: "Kit Organização da Pia",
    slug: "kit-organizacao-pia",
    taskIntent: "KITCHEN_PIA_ORG",
    shortDescription: "Praticidade e limpeza em um só lugar.",
    coverImageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    status: "DRAFT",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 6,
      mustHaveTypes: [],
      priceRange: { min: 15, max: 180 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "8", kitId: "kit-003", asin: "C1", title: "Dispenser", price: 59.9, role: "MAIN", rankScore: 0.88, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "9", kitId: "kit-003", asin: "C2", title: "Porta Esponja", price: 35.9, role: "SECONDARY", rankScore: 0.79, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 0,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  }
];

const statusConfig = {
  ACTIVE: { label: "Ativo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  DRAFT: { label: "Rascunho", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Clock },
  NEEDS_REVIEW: { label: "Precisa Revisão", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", icon: AlertCircle },
  ERROR: { label: "Erro", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: AlertCircle }
};

function CreateKitDialog() {
  const [theme, setTheme] = useState("");
  const [minItems, setMinItems] = useState(3);
  const [maxItems, setMaxItems] = useState(7);
  const [ratingMin, setRatingMin] = useState([4.0]);
  const [primeOnly, setPrimeOnly] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Kit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            Criar Kit Automaticamente
          </DialogTitle>
          <DialogDescription>
            Digite o tema do kit e o sistema irá gerar automaticamente as regras, buscar produtos e montar o kit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema do Kit *</Label>
            <Input
              id="theme"
              placeholder="Ex: Kit limpeza de banheiro, Kit troca de fralda para passeio"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              data-testid="input-kit-theme"
            />
            <p className="text-xs text-gray-500">
              O sistema irá interpretar o tema e gerar keywords, roles e filtros automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mínimo de Itens</Label>
              <Select value={minItems.toString()} onValueChange={(v) => setMinItems(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={n.toString()}>{n} itens</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Máximo de Itens</Label>
              <Select value={maxItems.toString()} onValueChange={(v) => setMaxItems(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 10, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>{n} itens</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Rating Mínimo</Label>
              <span className="text-sm font-medium text-green-600">{ratingMin[0].toFixed(1)} estrelas</span>
            </div>
            <Slider
              value={ratingMin}
              onValueChange={setRatingMin}
              min={3.0}
              max={5.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Apenas produtos Prime</Label>
              <p className="text-xs text-gray-500">Filtra apenas produtos elegíveis ao Amazon Prime</p>
            </div>
            <Switch
              checked={primeOnly}
              onCheckedChange={setPrimeOnly}
            />
          </div>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>PA-API Bloqueada:</strong> A busca automática de produtos está temporariamente indisponível. 
                  O kit será criado como rascunho para inserção manual de ASINs.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={isGenerating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={!theme.trim() || isGenerating}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
            data-testid="btn-generate-kit"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Kit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KitRow({ kit }: { kit: ProductKit }) {
  const status = statusConfig[kit.status];
  const StatusIcon = status.icon;
  const totalPrice = kit.products.reduce((sum, p) => sum + p.price, 0);
  
  const mainCount = kit.products.filter(p => p.role === 'MAIN').length;
  const secondaryCount = kit.products.filter(p => p.role === 'SECONDARY').length;
  const complementCount = kit.products.filter(p => p.role === 'COMPLEMENT').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              {kit.coverImageUrl ? (
                <img
                  src={kit.coverImageUrl}
                  alt={kit.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {kit.title}
                </h3>
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                {kit.shortDescription}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  {mainCount} principal
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  {secondaryCount} secundário
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-green-500" />
                  {complementCount} complemento
                </span>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-green-600">
                  R$ {totalPrice.toFixed(2)}
                </span>
                <span className="text-gray-400">•</span>
                <span>{kit.views} views</span>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/kits/${kit.slug}`}>
                <Button variant="ghost" size="sm" data-testid={`btn-view-${kit.id}`}>
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" data-testid={`btn-edit-${kit.id}`}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid={`btn-settings-${kit.id}`}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" data-testid={`btn-delete-${kit.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminKits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredKits = MOCK_KITS.filter(kit => {
    const matchesSearch = kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kit.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || kit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: MOCK_KITS.length,
    active: MOCK_KITS.filter(k => k.status === 'ACTIVE').length,
    draft: MOCK_KITS.filter(k => k.status === 'DRAFT').length,
    needsReview: MOCK_KITS.filter(k => k.status === 'NEEDS_REVIEW').length,
    totalProducts: MOCK_KITS.reduce((sum, k) => sum + k.products.length, 0),
    totalViews: MOCK_KITS.reduce((sum, k) => sum + (k.views || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-green-500" />
                Gerenciador de Kits
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Crie e gerencie kits de produtos automatizados
              </p>
            </div>
            
            <CreateKitDialog />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total de Kits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Produtos no Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                </div>
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Views Totais</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PA-API Status Banner */}
        <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                    PA-API Temporariamente Bloqueada
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    A busca automática de produtos será ativada após 3 vendas qualificadas (tag: karoom-20)
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-kits"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="DRAFT">Rascunhos</SelectItem>
              <SelectItem value="NEEDS_REVIEW">Precisa Revisão</SelectItem>
              <SelectItem value="ERROR">Com Erro</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Kits List */}
        <div className="space-y-4">
          {filteredKits.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nenhum kit encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Crie seu primeiro kit para começar"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <CreateKitDialog />
                )}
              </CardContent>
            </Card>
          ) : (
            filteredKits.map((kit) => (
              <KitRow key={kit.id} kit={kit} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
