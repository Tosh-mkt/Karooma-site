import React from 'react';
import { PostFlipbookCapture, FloatingFlipbookButton } from '@/components/lead-capture/PostFlipbookCapture';

export default function DemoFlipbookCapture() {
  // Simular dados de um post
  const mockPost = {
    id: 'demo-post-organizacao',
    title: 'Como Organizar a Casa em 8 Passos Simples',
    category: 'organizacao',
    content: `
      <h1>Como Organizar a Casa em 8 Passos Simples</h1>
      
      <p>Você já teve aquele momento em que olha para a casa e pensa "por onde eu começo?" 
      Se a resposta for sim, você não está sozinha. A organização da casa é um dos maiores 
      desafios para mães ocupadas como nós.</p>
      
      <p>A verdade é que organizar não é sobre ter uma casa perfeita como no Instagram. 
      É sobre criar sistemas que funcionam para SUA família, com SUA rotina, e que você 
      consegue manter no dia a dia.</p>
      
      <h2>Por que a organização parece impossível?</h2>
      
      <p>Antes de partir para as dicas práticas, preciso te falar uma coisa: o problema 
      não é você. O problema é que ninguém nos ensinou que organização é uma habilidade 
      que se aprende, como andar de bicicleta.</p>
      
      <p>Hoje vou compartilhar 8 passos que funcionaram para centenas de famílias:</p>
      
      <ol>
        <li><strong>Defina uma zona por vez</strong> - Não tente organizar a casa toda de uma vez</li>
        <li><strong>Use a regra do "uma coisa entra, uma sai"</strong> - Controle o acúmulo</li>
        <li><strong>Crie "casas" para cada objeto</strong> - Tudo tem seu lugar</li>
        <li><strong>Invista 15 minutos diários</strong> - Consistência vence perfeição</li>
        <li><strong>Envolva a família toda</strong> - Organização não é trabalho só seu</li>
        <li><strong>Use etiquetas visuais</strong> - Especialmente útil com crianças</li>
        <li><strong>Simplifique as categorias</strong> - Quanto mais simples, mais funciona</li>
        <li><strong>Celebre os pequenos progressos</strong> - Reconheça cada vitória</li>
      </ol>
      
      <p>Estes passos são apenas o começo. No guia completo, você encontra:</p>
      <ul>
        <li>Checklist detalhado para cada cômodo</li>
        <li>Planilhas de organização prontas</li>
        <li>Templates de etiquetas para imprimir</li>
        <li>Cronograma de 30 dias para transformar sua casa</li>
        <li>Dicas para manter a organização com crianças pequenas</li>
      </ul>
      
      <p>Lembre-se: organização é um processo, não um destino. Cada pequeno passo conta!</p>
    `
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header da Demo */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 mb-8">
            <h1 className="font-fredoka text-3xl mb-2">
              🎯 Demo: Sistema de Captura para Flipbooks
            </h1>
            <p className="font-poppins">
              Este é um exemplo de como o sistema funciona em um post real. 
              O modal aparecerá automaticamente após 10 segundos ou quando você rolar 50% da página.
            </p>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-blue-900 mb-2">Como testar:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• <strong>Automático:</strong> Aguarde 10 segundos ou role até 50% da página</li>
              <li>• <strong>Manual:</strong> Clique no botão "Baixar Guia" abaixo do post</li>
              <li>• <strong>Flutuante:</strong> Use o botão flutuante no canto inferior direito</li>
              <li>• <strong>Teste diferentes emails:</strong> O sistema identifica o tema automaticamente</li>
            </ul>
          </div>

          {/* Conteúdo do Post Simulado */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: mockPost.content }}
              />
              
              {/* Captura Inline */}
              <PostFlipbookCapture
                postId={mockPost.id}
                postCategory={mockPost.category}
                postTitle={mockPost.title}
                showInlineButton={true}
                inlineButtonText="Baixar Guia Completo de Organização"
                config={{ triggerDelay: 10, triggerScrollPercent: 50 }}
              />
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Para desenvolvedores:</strong> Este é um post de categoria "{mockPost.category}" 
                  que automaticamente mapeia para o tema "organizacao" do flipbook. 
                  O sistema detecta o tema e aplica as cores e conteúdo corretos.
                </p>
              </div>
            </div>
          </article>

          {/* Botão Flutuante */}
          <FloatingFlipbookButton
            postId={mockPost.id}
            postCategory={mockPost.category}
            postTitle={mockPost.title}
          />

          {/* Informações Técnicas */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="font-fredoka text-xl mb-4">
              ⚙️ Configurações Técnicas
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Triggers Automáticos:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Tempo:</strong> 10 segundos na página</li>
                  <li>• <strong>Scroll:</strong> 50% da página visualizada</li>
                  <li>• <strong>Saída:</strong> Movimento do mouse para fora (futuro)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Analytics Coletados:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Triggers do modal (tempo/scroll)</li>
                  <li>• Conversões por tema</li>
                  <li>• Performance por post</li>
                  <li>• Taxa de conversão por fonte</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Configuração de Teste */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">🧪 Configuração de Teste</h4>
            <p className="text-yellow-800 text-sm">
              Esta demo usa um timer reduzido (10s) e scroll reduzido (50%) para facilitar os testes. 
              Em produção, recomendamos 45-60 segundos e 70% de scroll para não ser intrusivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}