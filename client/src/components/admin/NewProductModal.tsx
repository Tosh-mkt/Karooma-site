import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Plus, CloudUpload, CheckCircle, AlertCircle, Database, ExternalLink, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

const productSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória").max(1000, "Descrição muito longa"),
  category: z.string().min(1, "Categoria é obrigatória"),
  currentPrice: z.string().min(1, "Preço é obrigatório"),
  originalPrice: z.string().optional(),
  rating: z.string().optional(),
  affiliateLink: z.string().url("Link deve ser uma URL válida"),
  imageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  introduction: z.string().min(50, "Introdução deve ter pelo menos 50 caracteres").optional(),
  evaluators: z.string().min(20, "Especialistas obrigatórios").optional(),
  benefits: z.string().min(100, "Benefícios devem ter pelo menos 100 caracteres").optional(),
  teamEvaluation: z.string().min(50, "Avaliação da equipe obrigatória").optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface NewProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProductModal({ open, onOpenChange }: NewProductModalProps) {
  const [mode, setMode] = useState<"choice" | "upload" | "manual" | "import">("choice");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import states
  const [csvData, setCsvData] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [jsonColumn, setJsonColumn] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("csv");
  const [overwrite, setOverwrite] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  // ASIN Import states
  const [asinData, setAsinData] = useState("");
  const [asinPreview, setAsinPreview] = useState<any[]>([]);
  const [isImportingAsin, setIsImportingAsin] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      currentPrice: "",
      originalPrice: "",
      rating: "",
      affiliateLink: "",
      imageUrl: "",
      featured: false,
      introduction: "",
      evaluators: "",
      benefits: "",
      teamEvaluation: "",
      tags: "",
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Falha ao criar produto');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso!",
        description: "O card já está disponível no site",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      onOpenChange(false);
      setMode("choice");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      let requestBody = {};
      let endpoint = '/api/admin/import-products';
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        // Se for array de produtos, converter para CSV
        if (Array.isArray(jsonData)) {
          const csvData = convertJsonToCsv(jsonData);
          requestBody = { csvData, overwrite: false };
        } else {
          throw new Error('JSON deve conter um array de produtos');
        }
        
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const csvData = await file.text();
        requestBody = { csvData, overwrite: false };
        
      } else {
        throw new Error('Formato de arquivo não suportado. Use JSON ou CSV.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao importar produtos');
      }

      const result = await response.json();
      setUploadResult(result);
      
      toast({
        title: "Produtos importados com sucesso!",
        description: `${result.imported} produtos foram criados automaticamente`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      setTimeout(() => {
        onOpenChange(false);
        setMode("choice");
        setUploadResult(null);
        setUploadProgress(0);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Função para converter JSON array para CSV
  const convertJsonToCsv = (jsonArray: any[]) => {
    if (!jsonArray || jsonArray.length === 0) {
      throw new Error('Array JSON vazio');
    }

    const headers = ['Título', 'Descrição', 'Categoria', 'Preço Atual', 'Link Afiliado', 'Imagem', 'Avaliação', 'Destaque', 'Introdução', 'Benefícios', 'Avaliação Equipe', 'Tags'];
    const csvRows = [headers.join(',')];

    jsonArray.forEach(item => {
      const row = [
        item.title || item.titulo || '',
        item.description || item.descricao || '',
        item.category || item.categoria || '',
        item.currentPrice || item.precoAtual || item.preco || '',
        item.affiliateLink || item.linkAfiliado || '',
        item.imageUrl || item.imagem || '',
        item.rating || item.avaliacao || '',
        item.featured || item.destaque || 'false',
        item.introduction || item.introducao || '',
        item.benefits || item.beneficios || '',
        item.teamEvaluation || item.avaliacaoEquipe || '',
        item.tags || ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  };

  const onSubmit = (data: ProductFormData) => {
    createProduct.mutate(data);
  };

  // Import functions
  const loadFromGoogleSheets = async () => {
    if (!sheetsUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do Google Sheets.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingSheets(true);
    try {
      const response = await apiRequest("POST", "/api/admin/load-google-sheets", { 
        sheetsUrl, 
        sheetName: sheetName.trim() || undefined,
        jsonColumn: jsonColumn.trim() || undefined
      });
      const result = await response.json();
      
      setJsonData(JSON.stringify(result.data, null, 2));
      setJsonPreview(result.data.slice(0, 3));
      
      toast({
        title: "Dados carregados!",
        description: `${result.data.length} produtos encontrados na planilha.`,
      });
    } catch (error: any) {
      console.error("Erro ao carregar Google Sheets:", error);
      toast({
        title: "Erro ao carregar",
        description: error.message || "Erro ao conectar com Google Sheets.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleAsinImport = async () => {
    if (!asinData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole o JSON com os ASINs e análises.",
        variant: "destructive",
      });
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(asinData);
      if (!Array.isArray(parsedData)) {
        throw new Error("JSON deve ser um array de produtos");
      }
    } catch (error) {
      toast({
        title: "Erro de formato",
        description: "JSON inválido. Deve ser um array de objetos com ASIN e análises.",
        variant: "destructive",
      });
      return;
    }

    setIsImportingAsin(true);
    try {
      const response = await apiRequest("POST", "/api/admin/import-by-asin", { 
        products: parsedData 
      });
      const result = await response.json();

      toast({
        title: "Importação ASIN concluída!",
        description: `${result.created} produtos criados, ${result.updated} atualizados de ${result.total} processados.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      setTimeout(() => {
        onOpenChange(false);
        setMode("choice");
        setAsinData("");
        setAsinPreview([]);
      }, 2000);
    } catch (error: any) {
      console.error("Erro na importação ASIN:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar produtos por ASIN.",
        variant: "destructive",
      });
    } finally {
      setIsImportingAsin(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, carregue dados JSON ou cole manualmente.",
        variant: "destructive",
      });
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (error) {
      toast({
        title: "Erro de formato",
        description: "Os dados JSON são inválidos. Verifique a formatação.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiRequest("POST", "/api/admin/import-json-products", { 
        jsonData: parsedData, 
        overwrite 
      });
      const result = await response.json();

      setImportResult(result);
      
      toast({
        title: "Importação JSON concluída!",
        description: `${result.imported} produtos importados com sucesso de ${result.total} processados.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error: any) {
      console.error("Erro na importação JSON:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar produtos JSON.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados CSV no campo de texto.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiRequest("POST", "/api/admin/import-products", { 
        csvData, 
        overwrite 
      });
      const result = await response.json();

      setImportResult(result);
      
      toast({
        title: "Importação CSV concluída!",
        description: `${result.imported} produtos importados com sucesso de ${result.total} processados.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error: any) {
      console.error("Erro na importação CSV:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar produtos CSV.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setMode("choice");
    setUploadProgress(0);
    setUploadResult(null);
    setCsvData("");
    setSheetsUrl("");
    setSheetName("");
    setJsonColumn("");
    setJsonData("");
    setJsonPreview([]);
    setActiveTab("csv");
    setOverwrite(false);
    setIsImporting(false);
    setImportResult(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Novo Produto
          </DialogTitle>
        </DialogHeader>

        {mode === "choice" && (
          <div className="grid md:grid-cols-3 gap-6 py-6">
            <Card className="glassmorphism border-purple-200 hover:border-purple-400 transition-all cursor-pointer" onClick={() => setMode("upload")}>
              <CardContent className="p-6 text-center space-y-4">
                <CloudUpload className="w-12 h-12 mx-auto text-purple-500" />
                <h3 className="text-lg font-semibold">Upload de Arquivo</h3>
                <p className="text-sm text-muted-foreground">
                  Envie um arquivo JSON ou CSV com dados de múltiplos produtos
                </p>
                <div className="text-xs text-purple-600 space-y-1">
                  <p>• JSON: Array de objetos com dados dos produtos</p>
                  <p>• CSV: Planilha com colunas: Título, Categoria, Link Afiliado...</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/api/admin/download-template/csv', '_blank');
                    }}
                    className="text-xs"
                  >
                    ⬇️ Template CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/api/admin/download-template/json', '_blank');
                    }}
                    className="text-xs"
                  >
                    ⬇️ Template JSON
                  </Button>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-500">
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload
                </Button>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-pink-200 hover:border-pink-400 transition-all cursor-pointer" onClick={() => setMode("manual")}>
              <CardContent className="p-6 text-center space-y-4">
                <FileText className="w-12 h-12 mx-auto text-pink-500" />
                <h3 className="text-lg font-semibold">Formulário Manual</h3>
                <p className="text-sm text-muted-foreground">
                  Preencha manualmente todas as informações do produto
                </p>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Manual
                </Button>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism border-blue-200 hover:border-blue-400 transition-all cursor-pointer" onClick={() => setMode("import")}>
              <CardContent className="p-6 text-center space-y-4">
                <Database className="w-12 h-12 mx-auto text-blue-500" />
                <h3 className="text-lg font-semibold">Importar Produtos</h3>
                <p className="text-sm text-muted-foreground">
                  Google Sheets & CSV em massa com dados estruturados
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>• Google Sheets JSON</p>
                  <p>• CSV tradicional</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === "upload" && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setMode("choice")}
                className="mb-4"
              >
                ← Voltar às Opções
              </Button>
            </div>

            {!isUploading && !uploadResult && (
              <div
                className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center space-y-4 hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  if (files[0]) handleFileUpload(files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <CloudUpload className="w-16 h-16 mx-auto text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Arraste seu arquivo aqui</h3>
                  <p className="text-muted-foreground mb-4">
                    Ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suportado: JSON (template), CSV
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Selecionar Arquivo
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold">Processando arquivo...</h3>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Validando dados e criando produto...
                </p>
              </div>
            )}

            {uploadResult && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="text-lg font-semibold text-green-600">Produto Criado!</h3>
                <p className="text-muted-foreground">
                  {uploadResult.product?.title} foi adicionado com sucesso
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        )}

        {mode === "manual" && (
          <div className="py-6">
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={() => setMode("choice")}
                className="mb-4"
              >
                ← Voltar às Opções
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Liquidificador Mondial..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Eletrodomésticos">Eletrodomésticos</SelectItem>
                            <SelectItem value="Casa e Jardim">Casa e Jardim</SelectItem>
                            <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="Família">Família</SelectItem>
                            <SelectItem value="Autocuidado">Autocuidado</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva as características principais do produto..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="currentPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Atual *</FormLabel>
                        <FormControl>
                          <Input placeholder="189.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Original</FormLabel>
                        <FormControl>
                          <Input placeholder="229.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avaliação</FormLabel>
                        <FormControl>
                          <Input placeholder="4.6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="affiliateLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Afiliado *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://amzn.to/seu-link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="https://m.media-amazon.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Produto em Destaque</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Produto aparecerá na seção de destaques
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={createProduct.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-all"
                >
                  {createProduct.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Produto
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
        
        {mode === "import" && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setMode("choice")}
                className="mb-4"
              >
                ← Voltar às Opções
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Importação CSV
                </TabsTrigger>
                <TabsTrigger value="sheets" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Google Sheets JSON
                </TabsTrigger>
                <TabsTrigger value="asin" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Importar por ASIN
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-6">
                <Card className="glassmorphism border-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        Importação CSV
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open('/api/admin/download-template/csv', '_blank')}
                          className="text-xs"
                        >
                          ⬇️ CSV de exemplo com formato correto
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Importe produtos em massa a partir do Google Sheets com dados JSON estruturados ou arquivo CSV tradicional.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="csv-data">Cole seu CSV aqui:</Label>
                        <Textarea
                          id="csv-data"
                          placeholder="Título,Descrição,Categoria,Preço Atual,Link Afiliado..."
                          value={csvData}
                          onChange={(e) => setCsvData(e.target.value)}
                          className="min-h-[200px] font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="overwrite"
                          checked={overwrite}
                          onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                        />
                        <Label htmlFor="overwrite" className="text-sm">
                          Sobrescrever produtos existentes (limpar base de dados antes)
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleCsvImport}
                          disabled={isImporting || !csvData.trim()}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                        >
                          {isImporting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Importando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Importar CSV
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sheets" className="space-y-6">
                <Card className="glassmorphism border-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                        Google Sheets JSON
                      </h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Conecte-se diretamente ao Google Sheets e importe dados JSON estruturados.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sheets-url">URL do Google Sheets (compartilhado publicamente):</Label>
                        <Input
                          id="sheets-url"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={sheetsUrl}
                          onChange={(e) => setSheetsUrl(e.target.value)}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sheet-name">Nome da Aba (opcional):</Label>
                          <Input
                            id="sheet-name"
                            placeholder="Sheet1, Produtos..."
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="json-column">Coluna JSON (opcional):</Label>
                          <Input
                            id="json-column"
                            placeholder="B, C, dados..."
                            value={jsonColumn}
                            onChange={(e) => setJsonColumn(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={loadFromGoogleSheets}
                        disabled={isLoadingSheets || !sheetsUrl.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        {isLoadingSheets ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Carregando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Carregar do Google Sheets
                          </div>
                        )}
                      </Button>

                      {jsonPreview.length > 0 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Preview dos dados:</strong> {jsonPreview.length} produtos encontrados. 
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm font-medium">Ver primeiros produtos</summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(jsonPreview, null, 2)}
                              </pre>
                            </details>
                          </AlertDescription>
                        </Alert>
                      )}

                      {jsonData && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="json-data">Dados JSON carregados:</Label>
                            <Textarea
                              id="json-data"
                              value={jsonData}
                              onChange={(e) => setJsonData(e.target.value)}
                              className="min-h-[200px] font-mono text-xs"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="overwrite-json"
                              checked={overwrite}
                              onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                            />
                            <Label htmlFor="overwrite-json" className="text-sm">
                              Sobrescrever produtos existentes
                            </Label>
                          </div>

                          <Button
                            onClick={handleJsonImport}
                            disabled={isImporting}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            {isImporting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Importando...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Importar Produtos JSON
                              </div>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="asin" className="space-y-6">
                <Card className="glassmorphism border-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-blue-900">🚀 Importação Rápida por ASIN:</h4>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>✅ <strong>Formato Simples:</strong> Você pode colar apenas uma lista de ASINs (ou ASINs + categoria)</li>
                        <li>✅ <strong>Análises Opcionais:</strong> Adicione nutritionistEvaluation, designEvaluation, etc. depois se quiser</li>
                        <li>🤖 O sistema busca automaticamente: <strong>título, preço, imagem, rating</strong> da Amazon PA API</li>
                        <li>📦 Se o ASIN já existe: <strong>atualiza</strong>. Se não existe: <strong>cria</strong> novo produto</li>
                      </ol>
                    </div>

                    <div>
                      <Label htmlFor="asin-data">Cole o JSON (apenas ASINs ou com análises):</Label>
                      <Textarea
                        id="asin-data"
                        placeholder='FORMATO SIMPLES (só ASIN):
[
  { "asin": "B08N5WRWNW", "category": "Alimentação" },
  { "asin": "B09ABCDEFG", "category": "Casa e Jardim" },
  { "asin": "B07XYZ1234" }
]

FORMATO COMPLETO (com análises):
[
  {
    "asin": "B08N5WRWNW",
    "category": "Alimentação",
    "introduction": "Descrição...",
    "nutritionistEvaluation": "Análise nutricional...",
    "organizerEvaluation": "Avaliação...",
    "featured": true
  }
]'
                        value={asinData}
                        onChange={(e) => {
                          setAsinData(e.target.value);
                          try {
                            const parsed = JSON.parse(e.target.value);
                            if (Array.isArray(parsed)) {
                              setAsinPreview(parsed.slice(0, 3));
                            }
                          } catch (error) {
                            setAsinPreview([]);
                          }
                        }}
                        className="min-h-[250px] font-mono text-xs"
                      />
                    </div>

                    {asinPreview.length > 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Preview:</strong> {asinPreview.length} produtos detectados no JSON.
                          <div className="mt-2 space-y-1">
                            {asinPreview.map((product, index) => (
                              <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                                <strong>ASIN:</strong> {product.asin} | <strong>Categoria:</strong> {product.category || 'N/A'}
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Nota importante:</strong> Enquanto isso, a importação por ASIN ainda funciona para importar produtos novos - o sistema está bloqueado em massa que está esperando o bloqueio da Amazon expirar.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleAsinImport}
                      disabled={isImportingAsin || !asinData.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isImportingAsin ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Importando via Amazon PA API...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Importar por ASIN
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {importResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importação concluída!</strong> {importResult.imported} produtos importados de {importResult.total} processados.
                  {importResult.errors?.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Ver erros ({importResult.errors.length})</summary>
                      <ul className="mt-1 text-xs text-red-600 space-y-1">
                        {importResult.errors.slice(0, 5).map((error: any, index: number) => (
                          <li key={index}>Linha {error.line}: {error.message}</li>
                        ))}
                        {importResult.errors.length > 5 && <li>...e mais {importResult.errors.length - 5} erros</li>}
                      </ul>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}