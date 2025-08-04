# 🎯 ESTRATÉGIA N8N: LOTES PEQUENOS (5-20 PRODUTOS)

## Configuração do Workflow N8N

### 1. Estrutura do Workflow
```
📥 Manual Trigger → 🔍 Extract Products → 🎨 Format Output → 📤 Batch Send → ✅ Report
```

### 2. Nó "Format Output" (Function)
Copie o código do `N8N_OUTPUT_TEMPLATE.md`:

```javascript
// Processar produtos extraídos
const products = [];

for (const item of $input.all()) {
  const product = {
    "title": item.json.product_title,
    "description": item.json.product_description,
    "category": mapCategory(item.json.product_title),
    "currentPrice": extractPrice(item.json.current_price),
    "originalPrice": extractPrice(item.json.original_price),
    "rating": extractRating(item.json.rating),
    "affiliateLink": item.json.affiliate_url,
    "imageUrl": item.json.image_url,
    "featured": shouldBeFeatured(item.json.rating, item.json.review_count)
  };
  
  if (validateProduct(product)) {
    products.push(product);
  }
}

// Enviar como lote único
return [{
  json: {
    products: products,
    batch_size: products.length,
    timestamp: new Date().toISOString()
  }
}];
```

### 3. Nó "Batch Send" (HTTP Request)
```json
{
  "method": "POST",
  "url": "http://localhost:5000/api/automation/products/batch",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "={{ JSON.stringify($json) }}"
}
```

## Exemplo Prático: 5 Produtos

### Input do N8N
```json
[
  {
    "product_title": "Organizador de Gavetas Modular",
    "product_description": "Sistema organizador para cozinha",
    "current_price": "R$ 89,90",
    "original_price": "R$ 129,90",
    "rating": "4,6 de 5 estrelas",
    "affiliate_url": "https://amzn.to/organize001",
    "image_url": "https://m.media-amazon.com/images/I/71example1.jpg"
  },
  {
    "product_title": "Kit Beleza Natural Facial",
    "product_description": "Cuidados faciais naturais",
    "current_price": "R$ 79,90",
    "rating": "4,8 de 5 estrelas",
    "affiliate_url": "https://amzn.to/beauty002"
  }
]
```

### Output Formatado
```json
{
  "products": [
    {
      "title": "Organizador de Gavetas Modular",
      "description": "Sistema organizador para cozinha",
      "category": "casa",
      "currentPrice": "89.90",
      "originalPrice": "129.90",
      "rating": "4.6",
      "affiliateLink": "https://amzn.to/organize001",
      "imageUrl": "https://m.media-amazon.com/images/I/71example1.jpg",
      "featured": false
    },
    {
      "title": "Kit Beleza Natural Facial", 
      "description": "Cuidados faciais naturais",
      "category": "autocuidado",
      "currentPrice": "79.90",
      "rating": "4.8",
      "affiliateLink": "https://amzn.to/beauty002",
      "featured": true
    }
  ]
}
```

## Vantagens dos Lotes Pequenos

### ✅ Performance Otimizada
- **1 requisição** para 5-20 produtos
- **Processamento rápido** (< 5 segundos)
- **Menor chance de timeout**

### ✅ Controle de Qualidade
- **Validação individual** de cada produto
- **Relatório detalhado** de sucessos/falhas
- **Rollback fácil** se necessário

### ✅ Facilidade de Debug
- **Logs específicos** por produto
- **Identificação clara** de erros
- **Reprocessamento simples**

## Configuração Recomendada

### Para 5-10 Produtos
```javascript
// N8N Schedule: A cada 2 horas
"0 */2 * * *"

// Timeout: 30 segundos
timeout: 30000
```

### Para 10-20 Produtos  
```javascript
// N8N Schedule: A cada 4 horas
"0 */4 * * *"

// Timeout: 60 segundos
timeout: 60000
```

## Monitoramento e Logs

### Response de Sucesso
```json
{
  "success": true,
  "message": "Lote processado: 8 criados, 1 ignorados, 1 falhas",
  "results": {
    "successful": [
      {"index": 1, "title": "Produto A", "id": "uuid-123"},
      {"index": 2, "title": "Produto B", "id": "uuid-456"}
    ],
    "failed": [
      {"index": 3, "title": "Produto C", "reason": "Preço inválido"}
    ],
    "skipped": [
      {"index": 4, "title": "Produto D", "reason": "Produto já existe"}
    ],
    "total": 10
  }
}
```

### Logs do Servidor
```
📊 RELATÓRIO BATCH N8N
=======================
Total processados: 10
✅ Sucessos: 8
⏭️ Ignorados: 1  
❌ Falhas: 1
Taxa de sucesso: 80.0%
```

## Tratamento de Erros

### Produtos Rejeitados
```javascript
// Validações automáticas
- Título: 5-255 caracteres
- Categoria: válida (casa, familia, etc.)
- Preço: R$ 10,00 - R$ 5.000,00
- Link: URL válida
```

### Produtos Duplicados
```javascript
// Verifica por affiliate_link
- Se existe: marca como "skipped"
- Se novo: cria produto normalmente
```

## Fluxo Completo N8N

### 1. Trigger Manual
```javascript
// Clique "Execute Workflow"
// Ou agende execução automática
```

### 2. Extração (Web Scraper/API)
```javascript
// Extrai dados de 5-20 produtos
// Formata campos básicos
```

### 3. Transformação (Function)
```javascript
// Aplica template de output
// Valida e formata dados
```

### 4. Envio (HTTP Request)
```javascript
// POST /api/automation/products/batch
// Recebe resposta com relatório
```

### 5. Relatório (Function)
```javascript
// Log resultados no console N8N
// Salva estatísticas de execução
```