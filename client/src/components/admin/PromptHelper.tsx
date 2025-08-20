import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Wand2, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PromptHelperProps {
  trigger?: React.ReactNode;
}

export function PromptHelper({ trigger }: PromptHelperProps) {
  const [tema, setTema] = useState("");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      toast({
        title: "Copiado!",
        description: "Prompt copiado para a área de transferência",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt",
        variant: "destructive",
      });
    }
  };

  const generatePrompt = (theme: string) => {
    return `Você é uma especialista em conteúdo para mães ocupadas, escrevendo para o blog Karooma.

**PÚBLICO-ALVO:** Cláudia, 39 anos, mãe de 3 filhos (10, 6, 2 anos), trabalha, busca soluções práticas para o caos diário, valoriza conteúdo empático e transformacional.

**TEMA:** ${theme}

**FORMATO DE SAÍDA OBRIGATÓRIO:**
Organize sua resposta EXATAMENTE neste formato para facilitar cópia/cola no painel administrativo:

---
**TÍTULO (Hook Magnético):**
[Escreva uma pergunta ou situação reconhecível de 60-80 caracteres]

---
**DESCRIÇÃO (Chamada Empática):**
[Resuma o benefício principal em 150-200 caracteres, focando na transformação]

---
**CATEGORIA:**
[Escolha: Organização Familiar | Produtividade | Cuidados Pessoais | Família | Saúde e Bem-estar | Casa e Decoração | Economia Doméstica]

---
**CONTEÚDO COMPLETO:**
[Escreva aqui o post completo seguindo a estrutura de 5 partes abaixo]

**ESTRUTURA DO CONTEÚDO:**

**PARTE 1 - HOOK EMOCIONAL (100-150 palavras)**
- Comece com situação específica e reconhecível
- Use detalhes concretos (horários, ações, sensações)
- Conecte emocionalmente sem dramatizar

**PARTE 2 - VALIDAÇÃO COM DADOS (80-100 palavras)**
- Inclua estatística real sobre mães brasileiras
- Use formato: "**A verdade é que X% das mães brasileiras relatam [problema].** Você não está sozinha nessa."
- Adicione seção "## Eu Entendo Completamente Essa Realidade"

**PARTE 3 - 5 ESTRATÉGIAS PRÁTICAS (400-500 palavras)**
- Título: "## 5 Estratégias Que Realmente Funcionam (Testadas por Mães Reais)"
- Numere de 1 a 5 com emojis diferentes
- Cada estratégia: ### título + explicação prática

**PARTE 4 - REFLEXÃO PESSOAL (150-200 palavras)**
- Título: "## O Que Mudou na Minha Rotina (e Pode Mudar na Sua)"
- Experiência autêntica com exemplos concretos
- Termine com: "**Às vezes, facilitar a vida não é preguiça. É autocuidado.**"

**PARTE 5 - FECHAMENTO EMPÁTICO (100-150 palavras)**
- Título: "## Lembre-se Sempre:"
- Reforce autoestima e senso de comunidade
- Termine com: "**Porque juntas, a gente sempre encontra um jeito. ✨**"

**INSTRUÇÕES FINAIS:**
- Tom: Empático, prático, conversacional
- Use **negrito** para frases de impacto
- Parágrafos curtos (máximo 3 linhas)
- 800-1200 palavras no total

Agora escreva sobre: ${theme}`;
  };

  const promptSimplificado = (theme: string) => {
    return `Escreva um post para mães ocupadas sobre "${theme}" seguindo este FORMATO EXATO:

---
**TÍTULO (Hook Magnético):**
[Pergunta ou situação reconhecível]

---
**DESCRIÇÃO (Chamada Empática):**
[Benefício principal em 150-200 caracteres]

---
**CATEGORIA:**
[Organização Familiar | Produtividade | Cuidados Pessoais | Família | Saúde e Bem-estar]

---
**CONTEÚDO COMPLETO:**
1. Hook emocional situacional (100-150 palavras)
2. Validação com dados (X% das mães brasileiras...)
3. ## 5 Estratégias Que Realmente Funcionam (Testadas por Mães Reais)
   ### 🔸 1. [Estratégia com emoji]
   ### 🔸 2. [Estratégia com emoji]
   ### 🔸 3. [Estratégia com emoji]
   ### 🔸 4. [Estratégia com emoji]
   ### 🔸 5. [Estratégia com emoji]
4. ## O Que Mudou na Minha Rotina (e Pode Mudar na Sua)
5. ## Lembre-se Sempre: [termine com "Porque juntas, a gente sempre encontra um jeito. ✨"]

Tom: Empático, prático, conversacional. 800-1200 palavras.
Público: Cláudia, 39 anos, mãe de 3, trabalha, busca soluções simples.`;
  };

  const imagensRecomendadas = [
    { categoria: "Mães Organizadas", url: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
    { categoria: "Rotina Matinal", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
    { categoria: "Casa Organizada", url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
    { categoria: "Família Feliz", url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" },
    { categoria: "Autocuidado", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Gerar com IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Gerador de Prompts Karooma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input do Tema */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                1. Definir Tema do Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="tema">Tema do Post</Label>
              <Input
                id="tema"
                placeholder="Ex: organização da rotina matinal, gerenciamento do tempo, autocuidado para mães..."
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Prompts Gerados */}
          {tema && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Prompt Completo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      2. Prompt Completo (Detalhado)
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(generatePrompt(tema), 'completo')}
                            className="bg-gradient-to-r from-purple-500 to-pink-500"
                          >
                            {copiedStates['completo'] ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar prompt completo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatePrompt(tema)}
                    readOnly
                    rows={12}
                    className="text-sm font-mono"
                  />
                  <Badge className="mt-2 bg-blue-100 text-blue-700">
                    Recomendado para resultados detalhados
                  </Badge>
                </CardContent>
              </Card>

              {/* Prompt Simplificado */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      3. Prompt Simplificado (Rápido)
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(promptSimplificado(tema), 'simples')}
                            className="bg-gradient-to-r from-green-500 to-teal-500"
                          >
                            {copiedStates['simples'] ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar prompt simplificado</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={promptSimplificado(tema)}
                    readOnly
                    rows={8}
                    className="text-sm font-mono"
                  />
                  <Badge className="mt-2 bg-green-100 text-green-700">
                    Ideal para testes rápidos
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* URLs de Imagens Recomendadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                4. URLs de Imagens Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {imagensRecomendadas.map((imagem) => (
                  <div key={imagem.categoria} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{imagem.categoria}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{imagem.url}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(imagem.url, imagem.categoria)}
                          >
                            {copiedStates[imagem.categoria] ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar URL da imagem</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">🚀 Como usar (Cópia/Cola Simplificado):</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Defina o tema do post acima</li>
                <li>Copie o prompt (completo ou simplificado)</li>
                <li>Cole na sua LLM favorita (ChatGPT, Claude, etc.)</li>
                <li><strong>Cole cada seção da resposta nos campos correspondentes:</strong>
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside text-xs">
                    <li>"TÍTULO" → Campo "Título (Hook Magnético)"</li>
                    <li>"DESCRIÇÃO" → Campo "Descrição (Chamada Empática)"</li>
                    <li>"CATEGORIA" → Seletor "Categoria"</li>
                    <li>"CONTEÚDO COMPLETO" → Campo "Conteúdo (Markdown aceito)"</li>
                  </ul>
                </li>
                <li>Selecione uma URL de imagem recomendada</li>
                <li>Configure "Post em Destaque" se necessário e publique!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}