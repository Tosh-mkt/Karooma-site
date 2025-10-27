import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, ExternalLink, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

export function AdminProductImport() {
  // Estados existentes para CSV
  const [csvData, setCsvData] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  // Novos estados para Google Sheets JSON
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [jsonColumn, setJsonColumn] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("csv");
  
  // Estados para importação por ASIN
  const [asinData, setAsinData] = useState("");
  const [asinPreview, setAsinPreview] = useState<any[]>([]);
  const [isImportingAsin, setIsImportingAsin] = useState(false);
  
  const { toast } = useToast();

  const sampleCsvFormat = `Título,Descrição,Categoria,Imagem,Preço Atual,Preço Original,Link Afiliado,Avaliação,Desconto,Destaque,Avaliação Especialista,Benefícios,Tags
"Produto Exemplo","Descrição do produto","Casa e Jardim","https://exemplo.com/imagem.jpg","29.90","39.90","https://amazon.com/produto","4.5","25","true","Excelente qualidade","Duradouro, Funcional","casa, jardim, útil"`;

  const sampleJsonFormat = {
    title: "Produto Exemplo",
    description: "Descrição detalhada do produto",
    category: "Casa e Jardim",
    imageUrl: "https://exemplo.com/imagem.jpg",
    currentPrice: "29.90",
    affiliateLink: "https://amazon.com/produto",
    introduction: "Introdução sobre o produto...",
    nutritionistEvaluation: "Avaliação da nutricionista...",
    organizerEvaluation: "Avaliação da organizadora...",
    designEvaluation: "Avaliação de design...",
    featured: true
  };

  const sampleAsinFormat = [
    {
      asin: "B08N5WRWNW",
      category: "Alimentação",
      introduction: "Descrição introdutória do produto...",
      nutritionistEvaluation: "Análise nutricional detalhada...",
      organizerEvaluation: "Avaliação sobre organização e praticidade...",
      designEvaluation: "Análise de design e usabilidade...",
      benefits: "Benefício 1, Benefício 2, Benefício 3",
      featured: true
    },
    {
      asin: "B09ABCDEFG",
      category: "Casa e Jardim",
      introduction: "Outro produto...",
      featured: false
    }
  ];

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
      setJsonPreview(result.data.slice(0, 3)); // Preview dos primeiros 3 produtos
      
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

      if (result.imported > 0) {
        setJsonData("");
        setJsonPreview([]);
      }

    } catch (error: any) {
      console.error("Erro na importação JSON:", error);
      toast({
        title: "Erro na importação JSON",
        description: error.message || "Erro ao importar produtos JSON.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados CSV para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await apiRequest("POST", "/api/admin/import-products", { csvData, overwrite });
      const result = await response.json();

      setImportResult(result);
      
      toast({
        title: "Importação concluída!",
        description: `${result.imported} produtos importados com sucesso de ${result.total} processados.`,
      });

      // Limpar dados após sucesso
      if (result.imported > 0) {
        setCsvData("");
      }

    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar produtos.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
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
        throw new Error("Dados devem ser um array");
      }
    } catch (error) {
      toast({
        title: "Erro de formato",
        description: "Os dados JSON são inválidos. Verifique a formatação.",
        variant: "destructive",
      });
      return;
    }

    setIsImportingAsin(true);
    try {
      const response = await apiRequest("POST", "/api/admin/import-by-asin", { 
        productsData: parsedData
      });
      const result = await response.json();

      setImportResult(result);
      
      toast({
        title: "Importação ASIN concluída!",
        description: `${result.imported} novos produtos, ${result.updated} atualizados, ${result.failed} falharam de ${result.total} processados.`,
      });

      if (result.imported > 0 || result.updated > 0) {
        setAsinData("");
        setAsinPreview([]);
      }

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

  const previewAsinData = () => {
    try {
      const parsed = JSON.parse(asinData);
      if (Array.isArray(parsed)) {
        setAsinPreview(parsed.slice(0, 3));
        toast({
          title: "Preview gerado",
          description: `Mostrando preview de ${Math.min(3, parsed.length)} produtos.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar preview",
        description: "Verifique se o JSON está formatado corretamente.",
        variant: "destructive",
      });
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCsvFormat], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formato-exemplo-produtos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadSampleAsin = () => {
    const blob = new Blob([JSON.stringify(sampleAsinFormat, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formato-asin-exemplo.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Importar Produtos - Google Sheets & CSV
          </h1>
          <p className="text-gray-600">
            Importe produtos em massa a partir do Google Sheets com dados JSON estruturados ou arquivos CSV tradicionais.
          </p>
        </div>

        {/* Tabs para métodos de importação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importação CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Google Sheets JSON
            </TabsTrigger>
            <TabsTrigger value="asin" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Importar por ASIN
            </TabsTrigger>
          </TabsList>

          {/* Tab CSV - Funcionalidade existente */}
          <TabsContent value="csv" className="space-y-6">
            {/* Instruções CSV */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Como usar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">📊 Para Google Sheets:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Abra sua planilha no Google Sheets</li>
                  <li>2. Vá em <strong>Arquivo &gt; Fazer download &gt; CSV</strong></li>
                  <li>3. Abra o arquivo CSV baixado em um editor de texto</li>
                  <li>4. Copie e cole o conteúdo na caixa abaixo</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💡 Dica importante:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use os nomes das colunas em português ou inglês</li>
                  <li>• Campos obrigatórios: Título, Categoria, Link Afiliado</li>
                  <li>• Preços podem usar vírgula ou ponto decimal</li>
                  <li>• Para "Destaque" use: true/false</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={downloadSampleCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar formato de exemplo
              </Button>
              <Badge variant="secondary">CSV de exemplo com formato correto</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Área de importação */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Dados CSV para Importação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole aqui os dados CSV da sua planilha...&#10;&#10;Título,Descrição,Categoria,Imagem,Preço Atual,Link Afiliado&#10;&quot;Produto Exemplo&quot;,&quot;Descrição do produto&quot;,&quot;Casa&quot;,&quot;https://exemplo.com/img.jpg&quot;,&quot;29.90&quot;,&quot;https://amazon.com/produto&quot;"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              data-testid="textarea-csv-data"
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="overwrite" 
                checked={overwrite}
                onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                data-testid="checkbox-overwrite"
              />
              <label htmlFor="overwrite" className="text-sm font-medium">
                Substituir todos os produtos existentes (limpar banco antes da importação)
              </label>
            </div>

            {overwrite && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Esta opção irá apagar TODOS os produtos existentes antes da importação. 
                  Esta ação não pode ser desfeita.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleImport}
              disabled={!csvData.trim() || isImporting}
              className="w-full"
              data-testid="button-import"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Produtos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Tab JSON - Nova funcionalidade Google Sheets */}
          <TabsContent value="json" className="space-y-6">
            {/* Instruções Google Sheets JSON */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Google Sheets com Dados JSON
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">🔗 Como usar:</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Configure sua planilha com uma coluna contendo dados JSON</li>
                      <li>2. Cole a URL da planilha (obrigatório)</li>
                      <li>3. Especifique o nome da aba (ex: "SELEÇÃO DE PRODUTOS")</li>
                      <li>4. Especifique a coluna JSON (nome ou número da coluna)</li>
                      <li>5. Clique em "Carregar Dados" para preview</li>
                      <li>6. Confirme a importação</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📋 Formato JSON esperado:</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{JSON.stringify(sampleJsonFormat, null, 1)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URL do Google Sheets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  URL do Google Sheets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sheets-url">URL da Planilha</Label>
                    <Input
                      id="sheets-url"
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                      data-testid="input-sheets-url"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sheet-name">Nome da Aba <span className="text-sm text-gray-500">(opcional)</span></Label>
                    <Input
                      id="sheet-name"
                      type="text"
                      placeholder="Ex: SELEÇÃO DE PRODUTOS"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      data-testid="input-sheet-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="json-column">Coluna JSON <span className="text-sm text-gray-500">(opcional)</span></Label>
                    <Input
                      id="json-column"
                      type="text"
                      placeholder="Ex: dados_json ou 5"
                      value={jsonColumn}
                      onChange={(e) => setJsonColumn(e.target.value)}
                      data-testid="input-json-column"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={loadFromGoogleSheets}
                  disabled={!sheetsUrl.trim() || isLoadingSheets}
                  className="w-full"
                  data-testid="button-load-sheets"
                >
                  {isLoadingSheets ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Carregar Dados
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview dos dados JSON */}
            {jsonPreview.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Preview dos Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {jsonPreview.map((product, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Badge variant="secondary">{product.category || 'Sem categoria'}</Badge>
                        <span className="text-sm font-medium">{product.title || 'Sem título'}</span>
                        {product.featured && <Badge variant="default">Destaque</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Área de importação JSON */}
            {jsonData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Dados JSON para Importação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Dados JSON serão carregados automaticamente..."
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    data-testid="textarea-json-data"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="overwrite-json" 
                      checked={overwrite}
                      onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                      data-testid="checkbox-overwrite-json"
                    />
                    <label htmlFor="overwrite-json" className="text-sm font-medium">
                      Substituir todos os produtos existentes (limpar banco antes da importação)
                    </label>
                  </div>

                  {overwrite && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Atenção:</strong> Esta opção irá apagar TODOS os produtos existentes antes da importação. 
                        Esta ação não pode ser desfeita.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleJsonImport}
                    disabled={!jsonData.trim() || isImporting}
                    className="w-full"
                    data-testid="button-import-json"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importando JSON...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Produtos JSON
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab ASIN - Nova funcionalidade */}
          <TabsContent value="asin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Importação por ASIN + Análises Karooma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-900">🚀 Importação Rápida por ASIN:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>✅ <strong>Formato Simples:</strong> Você pode colar apenas uma lista de ASINs (ou ASINs + categoria)</li>
                    <li>✅ <strong>Análises Opcionais:</strong> Adicione nutritionistEvaluation, designEvaluation, etc. depois se quiser</li>
                    <li>🤖 O sistema busca automaticamente: <strong>título, preço, imagem, rating</strong> da Amazon PA API</li>
                    <li>📦 Se o ASIN já existe: <strong>atualiza</strong>. Se não existe: <strong>cria</strong> novo produto</li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">📋 Formato JSON:</h4>
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(sampleAsinFormat, null, 2)}</pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={downloadSampleAsin}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar formato de exemplo
                  </Button>
                  <Badge variant="secondary">JSON com ASIN + Análises</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Cole o JSON com ASINs e Análises
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`FORMATO SIMPLES (só ASIN + categoria opcional):
[
  { "asin": "B08N5WRWNW", "category": "Alimentação" },
  { "asin": "B09ABCDEFG", "category": "Casa e Jardim" },
  { "asin": "B07XYZ1234" }
]

FORMATO COMPLETO (com análises Karooma):
[
  {
    "asin": "B08N5WRWNW",
    "category": "Alimentação",
    "introduction": "Descrição...",
    "nutritionistEvaluation": "Análise nutricional...",
    "organizerEvaluation": "Análise de organização...",
    "designEvaluation": "Análise de design...",
    "featured": true
  }
]`}
                  value={asinData}
                  onChange={(e) => setAsinData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-asin-data"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={previewAsinData}
                    disabled={!asinData.trim()}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Gerar Preview
                  </Button>
                </div>

                {asinPreview.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Preview dos produtos:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {asinPreview.map((product, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Badge variant="secondary">ASIN: {product.asin}</Badge>
                          <Badge variant="outline">{product.category || 'Geral'}</Badge>
                          {product.featured && <Badge variant="default">Destaque</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Verificação automática de duplicatas:</strong> Se um produto com o mesmo ASIN já existir, 
                    ele será atualizado. Caso contrário, será criado um novo produto.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleAsinImport}
                  disabled={!asinData.trim() || isImportingAsin}
                  className="w-full"
                  data-testid="button-import-asin"
                >
                  {isImportingAsin ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Buscando na Amazon e Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar por ASIN
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resultado da importação */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                    <div className="text-sm text-gray-600">Importados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                    <div className="text-sm text-gray-600">Processados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {importResult.total - importResult.imported}
                    </div>
                    <div className="text-sm text-gray-600">Ignorados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((importResult.imported / importResult.total) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Taxa Sucesso</div>
                  </div>
                </div>

                {importResult.products && importResult.products.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Produtos importados recentemente:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {importResult.products.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Badge variant="secondary">{product.category}</Badge>
                          <span className="text-sm font-medium">{product.title}</span>
                          {product.featured && <Badge variant="default">Destaque</Badge>}
                        </div>
                      ))}
                      {importResult.products.length > 5 && (
                        <div className="text-sm text-gray-500 text-center">
                          +{importResult.products.length - 5} produtos adicionais
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}