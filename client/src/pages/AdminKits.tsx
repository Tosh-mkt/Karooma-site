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
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [minItems, setMinItems] = useState(3);
  const [maxItems, setMaxItems] = useState(7);
  const [ratingMin, setRatingMin] = useState([4.0]);
  const [primeOnly, setPrimeOnly] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [productsTableText, setProductsTableText] = useState("");
  const { toast } = useToast();

  const parsedProducts = parseMarkdownTable(productsTableText);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast({ title: "Informe o tema do kit", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const slug = theme.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const kitData = {
        title: theme,
        slug: slug + '-' + Date.now().toString(36),
        shortDescription: `Kit com produtos selecionados para: ${theme}`,
        taskIntent: theme,
        status: parsedProducts.length > 0 ? 'ACTIVE' : 'CONCEPT_ONLY',
        paapiEnabled: false,
        conceptItems: []
      };

      const response = await fetch('/api/admin/kits/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(kitData)
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error('Resposta não é JSON:', responseText.substring(0, 200));
        toast({ title: "Erro ao criar kit", description: "Resposta inválida do servidor", variant: "destructive" });
        return;
      }

      if (!response.ok) {
        toast({ title: result.error || "Erro ao criar kit", variant: "destructive" });
        return;
      }

      console.log('Kit criado:', result);
      const kitId = result.kit?.id;
      
      if (parsedProducts.length > 0 && kitId) {
        console.log('Adicionando produtos ao kit:', kitId, parsedProducts.length);
        const updateResponse = await fetch(`/api/admin/kits/${kitId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            manualProducts: parsedProducts
          })
        });
        
        const updateText = await updateResponse.text();
        if (updateResponse.ok) {
          toast({ title: `Kit criado com ${parsedProducts.length} produtos!` });
        } else {
          console.error('Erro ao adicionar produtos:', updateText);
          toast({ title: "Kit criado, mas erro ao adicionar produtos", variant: "destructive" });
        }
      } else {
        toast({ title: "Kit conceitual criado com sucesso!" });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kits"] });
      setOpen(false);
      setTheme("");
      setProductsTableText("");
    } catch (error: any) {
      toast({ title: "Erro ao criar kit", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Criar Kit
          </DialogTitle>
          <DialogDescription>
            Digite o tema do kit e cole a tabela de produtos para criar um kit manualmente.
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
                  <strong>PA-API Bloqueada:</strong> Cole abaixo a tabela de produtos para criar o kit manualmente.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Produtos do Kit</Label>
              <Badge variant="outline">{parsedProducts.length} produtos</Badge>
            </div>
            <Textarea
              value={productsTableText}
              onChange={(e) => setProductsTableText(e.target.value)}
              placeholder={`Cole a tabela markdown com os produtos:

| Segmentação | Título | ASIN | Por que ajuda | Preço atual | Preço original | Rating | Avaliações | Categoria | URL Imagem | Link Afiliado |
|-------------|--------|------|---------------|-------------|----------------|--------|------------|-----------|------------|---------------|
| Kits Experiência - Piquenique | Cesta Térmica... | B0FB1VVN42 | Cria memórias ao ar livre... | R$ 89,90 | R$ 120,00 | 4,5 | 150 | Casa | https://... | https://... |`}
              className="h-40 resize-none font-mono text-xs"
              data-testid="textarea-create-products-table"
            />
            {parsedProducts.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {parsedProducts.length} produtos reconhecidos:
                </p>
                <div className="flex flex-wrap gap-1">
                  {parsedProducts.slice(0, 5).map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {p.asin}
                    </Badge>
                  ))}
                  {parsedProducts.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{parsedProducts.length - 5} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Cole a tabela de produtos coletada pelo assistente de pesquisa ou da planilha.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
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
                Criando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Criar Kit
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

interface Mission {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

function ImportJsonDialog({ onSuccess }: { onSuccess: () => void }) {
  const [jsonInput, setJsonInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");
  const { toast } = useToast();

  // Fetch missions for the dropdown
  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ["/api/admin/missions"],
  });

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
      
      // Inject selected missionId into the kit data
      if (selectedMissionId && selectedMissionId !== "none") {
        parsed.kit = {
          ...parsed.kit,
          missionId: selectedMissionId
        };
      }
      
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
      setSelectedMissionId("");
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
    setSelectedMissionId("");
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

          <div className="space-y-2">
            <Label htmlFor="mission-select">Vincular a uma Missão (opcional)</Label>
            <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
              <SelectTrigger data-testid="select-mission">
                <SelectValue placeholder="Selecione uma missão..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma missão</SelectItem>
                {missions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title} {!mission.isPublished && "(Rascunho)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Ao vincular, os produtos deste Kit serão exibidos na página da missão selecionada.
            </p>
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

interface ParsedProduct {
  asin: string;
  title: string;
  price: number;
  originalPrice: number | null;
  rating: number | null;
  reviewCount: number | null;
  category: string;
  imageUrl: string;
  affiliateLink: string;
  isPrime: boolean;
  ageSegment: string | null;
  differential: string | null;
}

function parseMarkdownTable(tableText: string): ParsedProduct[] {
  let lines = tableText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const firstLine = lines[0];
  const isTabSeparated = firstLine.includes('\t') && !firstLine.includes('|');
  
  if (isTabSeparated) {
    lines = lines.map(line => '| ' + line.split('\t').join(' | ') + ' |');
  }
  
  const dataLines = lines.filter(line => !line.includes('---') && line.includes('|'));
  if (dataLines.length < 2) return [];
  
  const headerLine = dataLines[0];
  const headerParts = headerLine.split('|').map(h => h.trim().toLowerCase());
  const headers = headerParts[0] === '' ? headerParts.slice(1) : headerParts;
  if (headers[headers.length - 1] === '') headers.pop();
  
  const products: ParsedProduct[] = [];
  
  for (let i = 1; i < dataLines.length; i++) {
    // Parse cells: split by | and trim, keeping empty cells for alignment
    const cellParts = dataLines[i].split('|').map(c => c.trim());
    // If line starts/ends with |, first/last will be empty - skip them
    const cells = cellParts[0] === '' ? cellParts.slice(1) : cellParts;
    if (cells[cells.length - 1] === '') cells.pop();
    
    if (cells.length < 5) continue;
    
    const getCell = (index: number) => cells[index] || '';
    
    const parsePrice = (priceStr: string): number => {
      const cleaned = priceStr.replace(/[R$\s.]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    };
    
    const parseRating = (ratingStr: string): number | null => {
      const match = ratingStr.match(/(\d+[,.]?\d*)/);
      return match ? parseFloat(match[1].replace(',', '.')) : null;
    };
    
    const parseReviews = (reviewStr: string): number | null => {
      const cleaned = reviewStr.replace(/[.\s]/g, '');
      const num = parseInt(cleaned);
      return isNaN(num) ? null : num;
    };
    
    const segmentIdx = headers.findIndex(h => h.includes('segmenta') || h.includes('segment'));
    const asinIdx = headers.findIndex(h => h === 'asin');
    const titleIdx = headers.findIndex(h => h.includes('tulo') || h === 'title');
    const diffIdx = headers.findIndex(h => h.includes('por que') || h.includes('diferencial') || h.includes('ajuda'));
    const priceIdx = headers.findIndex(h => h.includes('atual') || h === 'price');
    const origPriceIdx = headers.findIndex(h => h.includes('original'));
    const ratingIdx = headers.findIndex(h => h === 'rating');
    const reviewIdx = headers.findIndex(h => h.includes('avalia'));
    const catIdx = headers.findIndex(h => h.includes('categ'));
    const imgIdx = headers.findIndex(h => h.includes('imagem') || h.includes('image'));
    const linkIdx = headers.findIndex(h => h.includes('link') || h.includes('afil'));
    const primeIdx = headers.findIndex(h => h === 'prime');
    
    const asin = getCell(asinIdx >= 0 ? asinIdx : 2);
    if (!asin || asin.length < 5) continue;
    
    const ageSegmentValue = segmentIdx >= 0 ? getCell(segmentIdx).trim() : null;
    const differentialValue = diffIdx >= 0 ? getCell(diffIdx).trim() : null;
    
    products.push({
      asin,
      title: getCell(titleIdx >= 0 ? titleIdx : 1),
      price: parsePrice(getCell(priceIdx >= 0 ? priceIdx : 4)),
      originalPrice: origPriceIdx >= 0 ? parsePrice(getCell(origPriceIdx)) : null,
      rating: parseRating(getCell(ratingIdx >= 0 ? ratingIdx : 6)),
      reviewCount: parseReviews(getCell(reviewIdx >= 0 ? reviewIdx : 7)),
      category: getCell(catIdx >= 0 ? catIdx : 8),
      imageUrl: getCell(imgIdx >= 0 ? imgIdx : 9),
      affiliateLink: `https://www.amazon.com.br/dp/${asin}?tag=karoom-20`,
      isPrime: getCell(primeIdx >= 0 ? primeIdx : 10).toLowerCase() === 'sim' || getCell(primeIdx >= 0 ? primeIdx : 10).toLowerCase() === 'yes',
      ageSegment: ageSegmentValue || null,
      differential: differentialValue || null
    });
  }
  
  return products;
}

function EditKitDialog({ kit, onSuccess }: { kit: KitWithProducts; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(kit.title);
  const [shortDescription, setShortDescription] = useState(kit.shortDescription);
  const [status, setStatus] = useState(kit.status);
  const [selectedMissionId, setSelectedMissionId] = useState(kit.missionId || "");
  const [paapiEnabled, setPaapiEnabled] = useState(kit.paapiEnabled || false);
  const [productsTableText, setProductsTableText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const parsedProducts = parseMarkdownTable(productsTableText);

  // Reset form state when dialog opens or kit data changes
  const resetForm = () => {
    setTitle(kit.title);
    setShortDescription(kit.shortDescription);
    setStatus(kit.status);
    setSelectedMissionId(kit.missionId || "");
    setPaapiEnabled(kit.paapiEnabled || false);
    setProductsTableText("");
  };

  // Reset when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ["/api/admin/missions"],
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/kits/${kit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          shortDescription,
          status,
          paapiEnabled,
          missionId: selectedMissionId && selectedMissionId !== "none" ? selectedMissionId : null,
          manualProducts: parsedProducts.length > 0 ? parsedProducts : undefined
        })
      });
      
      if (!response.ok) {
        const result = await response.json();
        toast({ 
          title: result.error || "Erro ao atualizar",
          variant: "destructive" 
        });
        return;
      }
      
      const message = parsedProducts.length > 0 
        ? `Kit atualizado com ${parsedProducts.length} produtos!`
        : "Kit atualizado com sucesso!";
      toast({ title: message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kits"] });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({ 
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" data-testid={`btn-edit-${kit.id}`}>
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-500" />
            Editar Kit
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do kit "{kit.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-edit-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição Curta</Label>
            <Textarea
              id="edit-description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="h-20 resize-none"
              data-testid="textarea-edit-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONCEPT_ONLY">Conceitual</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="NEEDS_REVIEW">Precisa Revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-mission">Vincular a Missão</Label>
            <Select value={selectedMissionId || "none"} onValueChange={setSelectedMissionId}>
              <SelectTrigger data-testid="select-edit-mission">
                <SelectValue placeholder="Selecione uma missão..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma missão</SelectItem>
                {missions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title} {!mission.isPublished && "(Rascunho)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Produtos deste Kit aparecerão na página da missão selecionada.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>PA-API Ativa</Label>
              <Switch
                checked={paapiEnabled}
                onCheckedChange={setPaapiEnabled}
                data-testid="switch-paapi-enabled"
              />
            </div>
            <p className="text-xs text-gray-500">
              {paapiEnabled 
                ? "Cards exibem preços e badges Prime (dados atualizados via API)."
                : "Cards exibem apenas título, imagem e avaliação (modo compliance)."}
            </p>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Produtos do Kit</Label>
              <Badge variant="outline">{parsedProducts.length} produtos</Badge>
            </div>
            <Textarea
              value={productsTableText}
              onChange={(e) => setProductsTableText(e.target.value)}
              placeholder={`Cole a tabela markdown com os produtos:

| ASIN | Título | Preço atual | Preço original | Rating | Avaliações | Categoria | URL Imagem | Link Afiliado | Prime |
|------|--------|-------------|----------------|--------|------------|-----------|------------|---------------|-------|
| B09NCKR24R | Vaporizador... | R$ 186,90 | R$ 224,14 | 4,2/5 | 239 | Casa | https://... | https://... | Sim |`}
              className="h-40 resize-none font-mono text-xs"
              data-testid="textarea-products-table"
            />
            {parsedProducts.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {parsedProducts.length} produtos reconhecidos:
                </p>
                <div className="flex flex-wrap gap-1">
                  {parsedProducts.slice(0, 5).map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {p.asin}
                    </Badge>
                  ))}
                  {parsedProducts.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{parsedProducts.length - 5} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Cole a tabela de produtos coletada pelo assistente de pesquisa. Os dados de preço só serão exibidos se a PA-API estiver ativa.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={isUpdating || !title.trim() || !shortDescription.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-500"
            data-testid="btn-save-kit"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal for replacing a product with a new ASIN
function ReplaceProductModal({ 
  product, 
  onClose, 
  onSuccess 
}: { 
  product: { id: string; asin: string; title: string; kitTitle: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newAsin, setNewAsin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [searchUrl, setSearchUrl] = useState("");
  const { toast } = useToast();

  // Fetch search URL and open in new tab
  const handleSearchAmazon = async () => {
    if (!product) return;
    try {
      const response = await fetch(`/api/admin/kits/products/${product.id}/search-similar`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSearchUrl(data.searchUrl);
        window.open(data.searchUrl, '_blank');
      }
    } catch (error) {
      console.error("Error fetching search URL:", error);
      toast({ title: "Erro ao buscar link de pesquisa", variant: "destructive" });
    }
  };

  // Preview new ASIN
  const handlePreview = async () => {
    if (!newAsin.trim()) return;
    setIsSearching(true);
    setPreview(null);
    try {
      const response = await fetch(`/api/admin/kits/products/preview-asin/${newAsin.trim()}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      } else {
        toast({ title: "ASIN não encontrado", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro ao buscar produto", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Replace product
  const handleReplace = async () => {
    if (!product || !preview?.product) return;
    setIsReplacing(true);
    try {
      const response = await fetch(`/api/admin/kits/products/${product.id}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newAsin: newAsin.trim(),
          ...preview.product
        })
      });
      
      if (response.ok) {
        toast({ title: "Produto substituído com sucesso!" });
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        toast({ title: data.error || "Erro ao substituir", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro ao substituir produto", variant: "destructive" });
    } finally {
      setIsReplacing(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            Substituir Produto
          </DialogTitle>
          <DialogDescription>
            Substituir "{product.title}" no kit "{product.kitTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Product Info */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Produto atual (indisponível):</p>
            <p className="text-xs text-red-600 dark:text-red-400">ASIN: {product.asin}</p>
          </div>

          {/* Search Link */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleSearchAmazon}
              data-testid="btn-search-amazon"
            >
              <Search className="w-4 h-4" />
              Buscar produtos similares na Amazon
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <p className="text-xs text-gray-500">
              Abra a Amazon, encontre um produto substituto e copie o ASIN da URL.
            </p>
          </div>

          {/* New ASIN Input */}
          <div className="space-y-2">
            <Label>Novo ASIN</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: B09NCKR24R"
                value={newAsin}
                onChange={(e) => setNewAsin(e.target.value.toUpperCase())}
                data-testid="input-new-asin"
              />
              <Button 
                variant="secondary" 
                onClick={handlePreview}
                disabled={!newAsin.trim() || isSearching}
                data-testid="btn-preview-asin"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {preview?.product && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                Preview do novo produto:
              </p>
              <div className="flex gap-3">
                {preview.product.imageUrl && (
                  <img 
                    src={preview.product.imageUrl} 
                    alt={preview.product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{preview.product.title}</p>
                  <p className="text-xs text-gray-500">ASIN: {preview.product.asin}</p>
                  {preview.product.currentPrice && (
                    <p className="text-sm font-medium text-green-600">
                      R$ {preview.product.currentPrice.toFixed(2)}
                    </p>
                  )}
                  {!preview.paapiEnabled && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      PA-API inativa - dados básicos
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReplace}
            disabled={!preview?.product || isReplacing}
            className="bg-gradient-to-r from-orange-500 to-amber-500"
            data-testid="btn-confirm-replace"
          >
            {isReplacing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Substituindo...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Confirmar Substituição
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KitRow({ kit, onDelete, onEdit }: { kit: KitWithProducts; onDelete: (id: string) => void; onEdit: () => void }) {
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
              <EditKitDialog kit={kit} onSuccess={onEdit} />
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

interface UnavailableProduct {
  id: string;
  asin: string;
  title: string;
  kitId: string;
  availabilityStatus: string;
  kit: { id: string; title: string };
}

export default function AdminKits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productToReplace, setProductToReplace] = useState<{ id: string; asin: string; title: string; kitTitle: string } | null>(null);
  const { toast } = useToast();

  const { data: kits = [], isLoading, refetch } = useQuery<KitWithProducts[]>({
    queryKey: ["/api/admin/kits"],
  });

  // Fetch unavailable products
  const { data: unavailableData } = useQuery<{ products: UnavailableProduct[] }>({
    queryKey: ["/api/admin/kits/products/unavailable"],
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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 pt-20 md:pt-24 px-6 pb-6">
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

        {/* Unavailable Products Alert */}
        {unavailableData?.products && unavailableData.products.length > 0 && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  {unavailableData.products.length} Produto(s) Indisponível(is)
                </h4>
              </div>
              <div className="grid gap-2">
                {unavailableData.products.slice(0, 5).map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-100 dark:border-red-900"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        ASIN: {product.asin} • Kit: {product.kit.title}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="ml-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => setProductToReplace({
                        id: product.id,
                        asin: product.asin,
                        title: product.title,
                        kitTitle: product.kit.title
                      })}
                      data-testid={`btn-replace-${product.id}`}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Substituir
                    </Button>
                  </div>
                ))}
                {unavailableData.products.length > 5 && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    + {unavailableData.products.length - 5} mais produtos indisponíveis
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Replace Product Modal */}
        <ReplaceProductModal 
          product={productToReplace}
          onClose={() => setProductToReplace(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/kits/products/unavailable"] });
            refetch();
          }}
        />

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
              <KitRow key={kit.id} kit={kit} onDelete={handleDelete} onEdit={() => refetch()} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
