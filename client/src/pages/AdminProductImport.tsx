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
  const [jsonData, setJsonData] = useState("");
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("csv");
  
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
      const response = await apiRequest("POST", "/api/admin/load-google-sheets", { sheetsUrl });
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

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCsvFormat], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formato-exemplo-produtos.csv';
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importação CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Google Sheets JSON
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
                      <li>2. Cada linha deve ter um produto completo em formato JSON</li>
                      <li>3. Cole a URL da planilha abaixo</li>
                      <li>4. Clique em "Carregar Dados" para preview</li>
                      <li>5. Confirme a importação</li>
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