import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProductAnalysis {
  productName: string;
  introduction: string;
  productLink: string;
  affiliateLink: string;
  selectedExperts: string[];
  expertEvaluations: { [expert: string]: string };
  karoomaEvaluation: string;
  categoryTags: string[];
  filterTags: string[];
}

export function AdminCuradoriaKarooma() {
  const [productLink, setProductLink] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const { toast } = useToast();

  const generateAnalysisMutation = useMutation({
    mutationFn: async (data: { productLink: string; affiliateLink: string }) => {
      const response = await fetch('/api/admin/curadoria-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze product');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Análise Concluída",
        description: "A Curadoria KAROOMA analisou o produto com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductAnalysis) => {
      const response = await fetch('/api/admin/products-from-curadoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto Criado",
        description: "Card de produto criado com sucesso no sistema!",
      });
      handleReset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao Criar Produto",
        description: "Não foi possível criar o card do produto.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!productLink || !affiliateLink) {
      toast({
        title: "Links Obrigatórios",
        description: "Insira tanto o link do produto quanto o link afiliado.",
        variant: "destructive",
      });
      return;
    }

    generateAnalysisMutation.mutate({ productLink, affiliateLink });
  };

  const handleCreateProduct = () => {
    if (!analysis) return;
    createProductMutation.mutate(analysis);
  };

  const handleReset = () => {
    setProductLink('');
    setAffiliateLink('');
    setAnalysis(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-fredoka text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Curadoria KAROOMA
            </h1>
          </div>
          <p className="text-gray-600 font-poppins">
            Assistente especializado para análise automatizada de produtos
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Links do Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productLink">Link do Produto (Amazon/Loja)</Label>
              <Input
                id="productLink"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="https://www.amazon.com.br/produto..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="affiliateLink">Link Afiliado</Label>
              <Input
                id="affiliateLink"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                placeholder="https://amzn.to/..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={generateAnalysisMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {generateAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analisar Produto
                  </>
                )}
              </Button>
              
              {(productLink || affiliateLink) && (
                <Button variant="outline" onClick={handleReset}>
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Análise Concluída</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Pronto
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold">Nome do Produto:</Label>
                  <p className="mt-1">{analysis.productName}</p>
                </div>
                
                <div>
                  <Label className="font-semibold">Introdução:</Label>
                  <p className="mt-1 text-sm">{analysis.introduction}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(analysis.introduction)}
                    className="mt-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Expert Evaluations */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações dos Especialistas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold">Especialistas Selecionados:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.selectedExperts.map((expert, index) => (
                      <Badge key={index} variant="outline">
                        {expert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {Object.entries(analysis.expertEvaluations).map(([expert, evaluation]) => (
                  <div key={expert} className="border-l-4 border-purple-200 pl-4">
                    <Label className="font-semibold text-purple-700">{expert}:</Label>
                    <Textarea
                      value={evaluation}
                      readOnly
                      className="mt-2 min-h-[100px]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(evaluation)}
                      className="mt-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Karooma Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliação da Curadoria KAROOMA</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={analysis.karoomaEvaluation}
                  readOnly
                  className="min-h-[120px]"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(analysis.karoomaEvaluation)}
                  className="mt-2"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </Button>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags Geradas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold">Tags de Categorias e Benefícios:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.categoryTags.map((tag, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Tags de Filtros de Pesquisa:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.filterTags.map((tag, index) => (
                      <Badge key={index} className="bg-green-100 text-green-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Product Button */}
            <div className="text-center">
              <Button
                onClick={handleCreateProduct}
                disabled={createProductMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando Card...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Criar Card do Produto
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default AdminCuradoriaKarooma;