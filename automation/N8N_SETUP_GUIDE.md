# 🤖 N8N AUTOMATION - KAROOMA

## Instalação e Configuração

### 1. Importar Workflow
1. **Abrir n8n** (local ou cloud)
2. **Criar novo workflow**
3. **Importar JSON** → Copiar conteúdo de `n8n-workflow.json`
4. **Salvar** como "Karooma Amazon Product Sync"

### 2. Configurar URLs dos Produtos
No nó **"Prepare URLs"**, editar a lista:

```javascript
const amazonUrls = [
  "https://amzn.to/44TPsu4",  // Balance Bike Nathor
  "https://amzn.to/seu-link-2",  // Adicionar mais produtos
  "https://amzn.to/seu-link-3",
  // Adicione quantos quiser
];
```

### 3. Configurar API do Karooma
No mesmo nó, alterar a URL:

```javascript
const KAROOMA_API_BASE = "https://seu-projeto.replit.app";
```

## Como Funciona o Workflow

### Fluxo Automatizado
```
⏰ Schedule (6h) → 📋 Prepare URLs → 🌐 Fetch Amazon → 
📊 Extract Data → ✅ Validate → 📝 Format → 
🔄 Sync API → 📈 Report
```

### Nós Detalhados

#### 1. **Daily Sync at 6AM**
- **Tipo**: Schedule Trigger
- **Função**: Executa automaticamente todos os dias às 6h
- **Cron**: `0 6 * * *`

#### 2. **Prepare URLs**
- **Tipo**: Function
- **Função**: Prepara lista de URLs da Amazon para processamento
- **Configurável**: Lista de produtos para monitorar

#### 3. **Fetch Amazon Page**
- **Tipo**: HTTP Request
- **Função**: Busca página HTML da Amazon
- **Headers**: User-Agent realista para evitar bloqueios

#### 4. **Extract Product Data**
- **Tipo**: Function
- **Função**: Extrai dados da página HTML
- **Extrai**:
  - Título do produto
  - Preço atual
  - Avaliações (rating + contagem)
  - URL da imagem
  - Categoria (mapeamento automático)

#### 5. **Validate Data**
- **Tipo**: IF Condition
- **Validações**:
  - Título não vazio
  - Preço entre R$ 10 - R$ 5.000
  - Dados essenciais presentes

#### 6. **Format for Karooma**
- **Tipo**: Function
- **Função**: Formata dados para API do Karooma
- **Limita**: Título (255 chars), Descrição (500 chars)

#### 7. **Sync to Karooma**
- **Tipo**: HTTP Request POST
- **Endpoint**: `/api/automation/products/sync`
- **Função**: Envia produto para API

#### 8. **Log Success/Error**
- **Tipo**: Function
- **Função**: Registra resultados detalhados

#### 9. **Final Report**
- **Tipo**: Function
- **Função**: Consolida relatório final com estatísticas

## Mapeamento de Categorias

```javascript
function mapCategory(title, url) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('bicicleta') || titleLower.includes('bike') || 
      titleLower.includes('brinquedo') || titleLower.includes('infantil')) {
    return 'familia';
  }
  
  if (titleLower.includes('casa') || titleLower.includes('cozinha') || 
      titleLower.includes('organiz')) {
    return 'casa';
  }
  
  if (titleLower.includes('beleza') || titleLower.includes('cuidado') || 
      titleLower.includes('cosmétic')) {
    return 'autocuidado';
  }
  
  if (titleLower.includes('saúde') || titleLower.includes('vitamina') || 
      titleLower.includes('supplement')) {
    return 'saude';
  }
  
  if (titleLower.includes('eletrônic') || titleLower.includes('computador') || 
      titleLower.includes('celular')) {
    return 'tecnologia';
  }
  
  return 'casa'; // default
}
```

## Extração de Dados da Amazon

### Título
```javascript
const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
const title = titleMatch ? cleanText(titleMatch[1].replace(' : Amazon.com.br', '')) : '';
```

### Preço
```javascript
const priceMatches = html.match(/R\$\s*([\d,\.]+)/g) || [];
const currentPrice = priceMatches.length > 0 ? 
  parseFloat(priceMatches[0].replace('R$', '').replace(',', '.').trim()) : null;
```

### Avaliação
```javascript
const ratingMatch = html.match(/(\d+[,\.]\d+)\s*de\s*5\s*estrelas/i);
const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : null;
```

### Imagem
```javascript
const imageMatch = html.match(/"hiRes"\s*:\s*"([^"]+)"/i) || 
                  html.match(/"large"\s*:\s*"([^"]+)"/i);
const imageUrl = imageMatch ? imageMatch[1] : null;
```

## Configuração Avançada

### Horários Alternativos
Para executar em horários diferentes, alterar o cron no Schedule Trigger:

```javascript
// Executar a cada 6 horas
"0 */6 * * *"

// Executar às 6h e 18h
"0 6,18 * * *"

// Executar apenas dias úteis às 8h
"0 8 * * 1-5"
```

### Headers Customizados
No nó **Fetch Amazon Page**, adicionar headers:

```json
{
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate",
  "DNT": "1",
  "Connection": "keep-alive"
}
```

## Monitoramento e Logs

### Console Logs
O workflow gera logs detalhados:

```
✅ Produto sincronizado com sucesso:
Título: Bicicleta Infantil Balance Bike sem Pedal Masculina 03, Nathor
Preço: 215.9
Rating: 4.8
Categoria: familia

📊 RELATÓRIO FINAL - Karooma Product Sync
==================================================
Total de produtos processados: 3
Sucessos: 2
Erros: 1
Taxa de sucesso: 66.7%
Data/Hora: 2025-07-31T06:00:00.000Z
==================================================
```

### Execuções Manuais
Para testar:
1. **Clicar "Execute Workflow"**
2. **Acompanhar logs** em tempo real
3. **Verificar dados** no Karooma

### Histórico
n8n mantém histórico completo:
- **Executions** → Ver todas as execuções
- **Success/Error rates** 
- **Dados processados**

## Tratamento de Erros

### Erros Comuns
1. **Página não carregou**: Timeout ou bloqueio
2. **Dados não extraídos**: Mudança na estrutura da Amazon  
3. **Preço inválido**: Produto fora de estoque
4. **API Karooma offline**: Servidor indisponível

### Soluções
- **Retry automático** em caso de falha
- **Logs detalhados** para debugging
- **Validação rigorosa** antes de enviar
- **Fallback graceful** para erros

## Vantagens do N8N

✅ **Interface Visual** - Fluxo fácil de entender  
✅ **Execução Local** - Não depende de serviços externos  
✅ **Logs Completos** - Debugging facilitado  
✅ **Flexibilidade** - Fácil customização  
✅ **Gratuito** - Self-hosted sem custos  
✅ **Escalável** - Adicionar produtos facilmente  

## Próximos Passos

1. **Importar workflow** no n8n
2. **Configurar URLs** dos produtos
3. **Testar execução manual**
4. **Ativar schedule automático**
5. **Monitorar primeiros dias**
6. **Expandir lista de produtos**

---

**🔧 Suporte Técnico**: Para dúvidas sobre n8n, consulte a [documentação oficial](https://docs.n8n.io/) ou os arquivos de automação no projeto.