import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  ExternalLink,
  Loader2,
  FileJson,
  Upload,
  Copy,
  Check,
  X
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SelectProductKit, InsertProductKit } from "@shared/schema";

const statusConfig = {
  CONCEPT_ONLY: { label: "Conceitual", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Sparkles },
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

interface ValidationPreview {
  title: string;
  slug: string;
  taskIntent: string;
  problemToSolve?: string[];
  shortDescription: string;
  category?: string;
  conceptItemsCount: number;
  roles: {
    MAIN: number;
    SECONDARY: number;
    COMPLEMENT: number;
  };
  priceRange?: { min?: number; max?: number };
  ratingMin?: number;
}

interface ValidationResponse {
  valid: boolean;
  message: string;
  preview?: ValidationPreview;
  warnings?: string[];
  errors?: Array<{ path: string; message: string }>;
}

function ImportJsonDialog({ onSuccess }: { onSuccess: () => void }) {
  const [jsonInput, setJsonInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      toast({ title: "Cole o JSON primeiro", variant: "destructive" });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // First try to parse JSON locally
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (parseError: any) {
        setValidationResult({
          valid: false,
          message: "JSON mal formatado. Verifique a sintaxe.",
          errors: [{ path: "root", message: parseError.message }]
        });
        setIsValidating(false);
        return;
      }

      // Send to server for validation
      const response = await fetch("/api/admin/kits/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setValidationResult({
          valid: false,
          message: result.error || result.message || "Erro ao validar JSON",
          errors: result.errors || result.details || (result.error ? [{ path: "auth", message: result.error }] : undefined)
        });
      } else {
        setValidationResult(result);
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        message: "Erro de conexão. Tente novamente.",
        errors: [{ path: "network", message: error.message }]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult?.valid) {
      toast({ title: "Valide o JSON primeiro", variant: "destructive" });
      return;
    }

    setIsImporting(true);

    try {
      const parsed = JSON.parse(jsonInput);
      
      const response = await fetch("/api/admin/kits/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast({ 
          title: result.error || "Erro ao importar",
          description: result.message || "Tente novamente",
          variant: "destructive" 
        });
        return;
      }
      
      toast({ 
        title: "Kit importado com sucesso!",
        description: `"${result.kit.title}" criado com ${result.stats.conceptItemsCount} itens`
      });
      
      setJsonInput("");
      setValidationResult(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kits"] });
      onSuccess();
    } catch (error: any) {
      toast({ 
        title: "Erro ao importar",
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setValidationResult(null);
  };

  const handlePasteExample = () => {
    const example = `{
  "kit": {
    "title": "Kit Exemplo - Troca de Fraldas",
    "slug": "kit-exemplo-troca-fraldas",
    "theme": "bebê-e-maternidade",
    "taskIntent": "Simplificar a troca de fraldas",
    "problemToSolve": [
      "Falta de organização",
      "Itens espalhados"
    ],
    "shortDescription": "Tudo para trocas rápidas e sem estresse",
    "category": "Bebês"
  },
  "conceptItems": [
    {
      "name": "Organizador de Fraldas",
      "role": "MAIN",
      "weight": 1.0,
      "criteria": {
        "mustKeywords": ["organizador", "bebê", "fralda"],
        "category": "Bebês",
        "priceMin": 50,
        "priceMax": 150,
        "ratingMin": 4.0,
        "primeOnly": true
      }
    }
  ],
  "rulesConfig": {
    "minItems": 3,
    "maxItems": 6,
    "ratingMin": 4.0,
    "updateFrequency": "weekly"
  }
}`;
    setJsonInput(example);
    setValidationResult(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
          <FileJson className="w-4 h-4 mr-2" />
          Importar JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Importar Kit via JSON
          </DialogTitle>
          <DialogDescription>
            Cole o JSON gerado pelo assistente de pesquisa para criar um novo kit automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="json-input">JSON do Kit</Label>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePasteExample}
                  data-testid="btn-paste-example"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Exemplo
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                  disabled={!jsonInput}
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>
            <Textarea
              id="json-input"
              placeholder='{"kit": {"title": "...", "slug": "..."}, "conceptItems": [...], "rulesConfig": {...}}'
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setValidationResult(null);
              }}
              className="font-mono text-sm h-64 resize-none"
              data-testid="textarea-json-input"
            />
          </div>

          {validationResult && (
            <Card className={validationResult.valid 
              ? "bg-green-50 dark:bg-green-900/20 border-green-200" 
              : "bg-red-50 dark:bg-red-900/20 border-red-200"
            }>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${validationResult.valid ? "text-green-800" : "text-red-800"}`}>
                      {validationResult.message}
                    </p>
                    
                    {validationResult.valid && validationResult.preview && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">Título:</span>{" "}
                            <span className="font-medium">{validationResult.preview.title}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Slug:</span>{" "}
                            <span className="font-mono text-xs">{validationResult.preview.slug}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Categoria:</span>{" "}
                            <span>{validationResult.preview.category || "Não definida"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Rating mínimo:</span>{" "}
                            <span>{validationResult.preview.ratingMin || 4.0} estrelas</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                          <Badge className="bg-amber-100 text-amber-700">
                            <Crown className="w-3 h-3 mr-1" />
                            {validationResult.preview.roles.MAIN} MAIN
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700">
                            <Zap className="w-3 h-3 mr-1" />
                            {validationResult.preview.roles.SECONDARY} SECONDARY
                          </Badge>
                          <Badge className="bg-green-100 text-green-700">
                            <Heart className="w-3 h-3 mr-1" />
                            {validationResult.preview.roles.COMPLEMENT} COMPLEMENT
                          </Badge>
                        </div>

                        {validationResult.warnings && validationResult.warnings.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-amber-700 text-xs">
                            {validationResult.warnings.map((w, i) => (
                              <div key={i}>{w}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!validationResult.valid && validationResult.errors && (
                      <div className="mt-2 space-y-1 text-sm text-red-700">
                        {validationResult.errors.map((err, i) => (
                          <div key={i} className="font-mono text-xs">
                            <span className="text-red-500">{err.path}:</span> {err.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleValidate}
            disabled={!jsonInput.trim() || isValidating || isImporting}
            data-testid="btn-validate-json"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Validar
              </>
            )}
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!validationResult?.valid || isImporting}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            data-testid="btn-import-kit"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Criar Kit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface KitWithProducts extends SelectProductKit {
  products?: Array<{
    id: string;
    role: string;
    price: string;
  }>;
}

function KitRow({ kit, onDelete }: { kit: KitWithProducts; onDelete: (id: string) => void }) {
  const status = statusConfig[kit.status as keyof typeof statusConfig] || statusConfig.DRAFT;
  const StatusIcon = status.icon;
  const products = kit.products || [];
  const totalPrice = products.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0);
  
  const mainCount = products.filter(p => p.role === 'MAIN').length;
  const secondaryCount = products.filter(p => p.role === 'SECONDARY').length;
  const complementCount = products.filter(p => p.role === 'COMPLEMENT').length;
  const conceptItemCount = kit.conceptItems?.length || 0;

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
                {products.length > 0 ? (
                  <>
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
                  </>
                ) : conceptItemCount > 0 ? (
                  <span className="flex items-center gap-1 text-purple-600">
                    <Sparkles className="w-3 h-3" />
                    {conceptItemCount} itens conceituais (aguardando PA-API)
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Sem produtos ainda</span>
                )}
                <span className="text-gray-400">•</span>
                <span>{kit.views || 0} views</span>
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700" 
                data-testid={`btn-delete-${kit.id}`}
                onClick={() => onDelete(kit.id)}
              >
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
  const { toast } = useToast();

  const { data: kits = [], isLoading, refetch } = useQuery<KitWithProducts[]>({
    queryKey: ["/api/admin/kits"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/kits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kits"] });
      toast({ title: "Kit excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir kit", variant: "destructive" });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este kit?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredKits = kits.filter(kit => {
    const matchesSearch = kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kit.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || kit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: kits.length,
    active: kits.filter(k => k.status === 'ACTIVE').length,
    draft: kits.filter(k => k.status === 'DRAFT' || k.status === 'CONCEPT_ONLY').length,
    needsReview: kits.filter(k => k.status === 'NEEDS_REVIEW').length,
    totalProducts: kits.reduce((sum, k) => sum + (k.products?.length || 0), 0),
    totalViews: kits.reduce((sum, k) => sum + (k.views || 0), 0)
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
            
            <div className="flex gap-2">
              <ImportJsonDialog onSuccess={() => refetch()} />
              <CreateKitDialog />
            </div>
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
              <SelectItem value="CONCEPT_ONLY">Conceituais</SelectItem>
              <SelectItem value="DRAFT">Rascunhos</SelectItem>
              <SelectItem value="NEEDS_REVIEW">Precisa Revisão</SelectItem>
              <SelectItem value="ERROR">Com Erro</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Kits List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-green-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Carregando kits...
                </h3>
              </CardContent>
            </Card>
          ) : filteredKits.length === 0 ? (
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
              <KitRow key={kit.id} kit={kit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
