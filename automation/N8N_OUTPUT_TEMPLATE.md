# 🤖 N8N OUTPUT TEMPLATE - KAROOMA

## Prompt de Output para N8N (Function Node)

### Template para Produto Individual
```javascript
// N8N Function Node - Output Template
const products = [];

// Para cada produto extraído
for (const item of $input.all()) {
  const product = {
    "title": item.json.product_title || "",
    "description": item.json.product_description || "",
    "category": mapCategory(item.json.product_title, item.json.product_url),
    "currentPrice": extractPrice(item.json.current_price),
    "originalPrice": extractPrice(item.json.original_price),
    "rating": extractRating(item.json.rating),
    "reviewCount": item.json.review_count || "",
    "affiliateLink": item.json.affiliate_url || item.json.product_url,
    "imageUrl": item.json.image_url || "",
    "featured": shouldBeFeatured(item.json.rating, item.json.review_count)
  };
  
  // Validar produto antes de adicionar
  if (validateProduct(product)) {
    products.push(product);
  }
}

// Funções auxiliares
function mapCategory(title, url) {
  const titleLower = (title || "").toLowerCase();
  
  if (titleLower.includes('bicicleta') || titleLower.includes('bike') || 
      titleLower.includes('brinquedo') || titleLower.includes('infantil') ||
      titleLower.includes('criança')) {
    return 'familia';
  }
  
  if (titleLower.includes('casa') || titleLower.includes('cozinha') || 
      titleLower.includes('organiz') || titleLower.includes('decoração')) {
    return 'casa';
  }
  
  if (titleLower.includes('beleza') || titleLower.includes('cuidado') || 
      titleLower.includes('cosmétic') || titleLower.includes('pele')) {
    return 'autocuidado';
  }
  
  if (titleLower.includes('saúde') || titleLower.includes('vitamina') || 
      titleLower.includes('supplement') || titleLower.includes('medicament')) {
    return 'saude';
  }
  
  if (titleLower.includes('eletrônic') || titleLower.includes('computador') || 
      titleLower.includes('celular') || titleLower.includes('tecnologia')) {
    return 'tecnologia';
  }
  
  return 'casa'; // categoria padrão
}

function extractPrice(priceString) {
  if (!priceString) return "";
  
  // Remove tudo exceto números, vírgulas e pontos
  const cleanPrice = priceString.toString()
    .replace(/[^\d,\.]/g, '')
    .replace(',', '.');
  
  const price = parseFloat(cleanPrice);
  return isNaN(price) ? "" : price.toFixed(2);
}

function extractRating(ratingString) {
  if (!ratingString) return "";
  
  const rating = parseFloat(ratingString.toString().replace(',', '.'));
  return isNaN(rating) ? "" : Math.min(5, Math.max(0, rating)).toFixed(1);
}

function shouldBeFeatured(rating, reviewCount) {
  const ratingNum = parseFloat(rating || "0");
  const reviewNum = parseInt(reviewCount || "0");
  
  // Featured se rating >= 4.5 E reviews >= 100
  return ratingNum >= 4.5 && reviewNum >= 100;
}

function validateProduct(product) {
  // Validações obrigatórias
  if (!product.title || product.title.length < 5) return false;
  if (!product.category) return false;
  if (!product.currentPrice || parseFloat(product.currentPrice) < 10) return false;
  if (!product.affiliateLink || !product.affiliateLink.includes('http')) return false;
  
  // Limite de preço máximo
  if (parseFloat(product.currentPrice) > 5000) return false;
  
  return true;
}

// Retornar array de produtos para próximo nó
return products.map((product, index) => ({
  json: {
    ...product,
    batch_id: Date.now(),
    product_index: index + 1,
    total_products: products.length
  }
}));
```

## Configuração do Nó HTTP Request (Batch)

### Para Lotes de 5-20 Produtos
```javascript
// N8N HTTP Request Node Configuration
{
  "method": "POST",
  "url": "http://localhost:5000/api/automation/products/batch",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "products": $json.products || [$json]
  }
}
```

## Exemplo de Output Esperado

### Produto Individual
```json
{
  "title": "Balance Bike Infantil Nathor Azul",
  "description": "Bicicleta sem pedal para crianças de 2 a 5 anos, desenvolve equilíbrio e coordenação motora",
  "category": "familia",
  "currentPrice": "215.90",
  "originalPrice": "299.90", 
  "rating": "4.8",
  "reviewCount": "1247",
  "affiliateLink": "https://amzn.to/44TPsu4",
  "imageUrl": "https://m.media-amazon.com/images/I/51NS1a-08IL._AC_SX355_.jpg",
  "featured": true
}
```

### Lote de Produtos (5-20)
```json
{
  "products": [
    {
      "title": "Balance Bike Infantil",
      "description": "Bicicleta sem pedal...",
      "category": "familia",
      "currentPrice": "215.90",
      "affiliateLink": "https://amzn.to/44TPsu4",
      "imageUrl": "https://m.media-amazon.com/images/I/51NS1a.jpg",
      "featured": true
    },
    {
      "title": "Organizador de Gavetas",
      "description": "Sistema modular...",
      "category": "casa",
      "currentPrice": "89.90",
      "affiliateLink": "https://amzn.to/organize123",
      "imageUrl": "https://m.media-amazon.com/images/I/71xyz.jpg",
      "featured": false
    }
  ]
}
```

## Validações Automáticas

### Campos Obrigatórios
- ✅ `title` (5-255 caracteres)
- ✅ `category` (casa, familia, tecnologia, autocuidado, saude)
- ✅ `currentPrice` (R$ 10,00 - R$ 5.000,00)
- ✅ `affiliateLink` (URL válida)

### Campos Opcionais
- `description` (máximo 500 caracteres)
- `originalPrice` (para calcular desconto)
- `rating` (0.0 - 5.0)
- `reviewCount` (número de avaliações)
- `imageUrl` (URL da imagem)
- `featured` (calculado automaticamente)

## Tratamento de Erros

### Logs de Debugging
```javascript
// Adicionar ao final do Function Node
console.log(`✅ Produtos válidos: ${products.length}`);
console.log(`📊 Categorias: ${[...new Set(products.map(p => p.category))]}`);
console.log(`💰 Preços: ${products.map(p => p.currentPrice).join(', ')}`);

return products.map(product => ({
  json: {
    ...product,
    debug_info: {
      processed_at: new Date().toISOString(),
      validation_passed: true
    }
  }
}));
```

### Produtos Rejeitados
```javascript
// Para produtos que falharam na validação
const rejectedProducts = [];

if (!validateProduct(product)) {
  rejectedProducts.push({
    title: product.title,
    reason: getValidationError(product),
    original_data: item.json
  });
}

// Log produtos rejeitados
if (rejectedProducts.length > 0) {
  console.log(`❌ Produtos rejeitados: ${rejectedProducts.length}`);
  rejectedProducts.forEach(p => console.log(`   - ${p.title}: ${p.reason}`));
}
```