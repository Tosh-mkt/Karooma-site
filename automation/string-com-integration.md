# Sistema de Automação String.com - Karooma

## Visão Geral
Sistema automatizado para extrair dados reais de produtos da Amazon via String.com e sincronizar com a plataforma Karooma, garantindo informações 100% autênticas.

## Workflow de Automação

### 1. Configuração String.com
```json
{
  "workflow_name": "karooma_product_sync",
  "trigger": "api_webhook",
  "frequency": "daily_at_6am",
  "source": "amazon_affiliate_api"
}
```

### 2. Estrutura de Dados Esperada
```json
{
  "product": {
    "id": "string",
    "title": "string",
    "description": "string", 
    "category": "casa|autocuidado|familia|saude|tecnologia",
    "imageUrl": "string",
    "currentPrice": "number",
    "originalPrice": "number|null",
    "discount": "number|null",
    "rating": "number",
    "reviewCount": "number",
    "affiliateLink": "string",
    "specifications": ["array_of_strings"],
    "inStock": "boolean",
    "featured": "boolean"
  }
}
```

### 3. Endpoints API Karooma
```javascript
// Endpoint para receber dados do String.com
POST /api/automation/products/sync
Headers: {
  "Authorization": "Bearer ${STRING_COM_API_KEY}",
  "Content-Type": "application/json"
}

// Endpoint para verificar sincronização
GET /api/automation/products/status
```

### 4. Validação de Dados
```javascript
// Campos obrigatórios
const requiredFields = [
  'title',
  'currentPrice', 
  'affiliateLink',
  'category'
];

// Validação de preço
const priceValidation = {
  min: 10.00,
  max: 5000.00,
  currency: 'BRL'
};
```

### 5. Mapeamento de Categorias
```javascript
const categoryMapping = {
  'Home & Kitchen': 'casa',
  'Beauty & Personal Care': 'autocuidado',
  'Baby & Child Care': 'familia',
  'Health & Wellness': 'saude',
  'Electronics': 'tecnologia',
  'Sports & Outdoors': 'familia'
};
```

## String.com Automation Script

### Configuração do Workflow
```python
# String.com Automation Script
import requests
import json
from datetime import datetime

class KaroomaProductSync:
    def __init__(self):
        self.api_base = "https://seu-site.replit.app"
        self.auth_token = "${KAROOMA_API_TOKEN}"
        
    def extract_amazon_data(self, amazon_url):
        """Extrai dados reais da Amazon"""
        # String.com irá implementar a extração via API oficial
        return {
            "title": "produto_real_da_amazon",
            "currentPrice": 199.90,
            "originalPrice": 249.90,
            "rating": 4.5,
            "reviewCount": 1250,
            "description": "descrição_real_do_produto",
            "imageUrl": "url_real_da_imagem",
            "affiliateLink": "link_afiliado_real"
        }
    
    def format_for_karooma(self, raw_data):
        """Formata dados para o padrão Karooma"""
        return {
            "title": raw_data["title"],
            "description": raw_data["description"][:500],
            "category": self.map_category(raw_data.get("category", "")),
            "imageUrl": raw_data["imageUrl"],
            "currentPrice": str(raw_data["currentPrice"]),
            "originalPrice": str(raw_data.get("originalPrice")) if raw_data.get("originalPrice") else None,
            "discount": self.calculate_discount(raw_data),
            "rating": str(raw_data["rating"]),
            "affiliateLink": raw_data["affiliateLink"],
            "featured": raw_data.get("rating", 0) >= 4.5,
            "inStock": True
        }
    
    def sync_to_karooma(self, product_data):
        """Sincroniza com API Karooma"""
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.api_base}/api/automation/products/sync",
            json=product_data,
            headers=headers
        )
        
        return response.json()

# Execução do workflow
def main():
    sync = KaroomaProductSync()
    
    # Lista de URLs para monitorar
    amazon_urls = [
        "https://amzn.to/44TPsu4",  # Balance Bike
        # Adicionar mais URLs conforme necessário
    ]
    
    for url in amazon_urls:
        raw_data = sync.extract_amazon_data(url)
        formatted_data = sync.format_for_karooma(raw_data)
        result = sync.sync_to_karooma(formatted_data)
        print(f"Produto sincronizado: {result}")

if __name__ == "__main__":
    main()
```

### Configuração de Webhook
```json
{
  "webhook_url": "https://hooks.string.com/webhook/karooma-sync",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer ${STRING_COM_API_KEY}",
    "User-Agent": "KaroomaBot/1.0"
  },
  "schedule": {
    "frequency": "daily",
    "time": "06:00",
    "timezone": "America/Sao_Paulo"
  }
}
```

## Implementação no Karooma

### 1. Endpoint de Sincronização
```javascript
// server/routes/automation.js
app.post('/api/automation/products/sync', async (req, res) => {
  try {
    const productData = req.body;
    
    // Validar dados
    const validatedData = validateProductData(productData);
    
    // Verificar se produto já existe
    const existingProduct = await storage.getProductByAffiliateLink(
      validatedData.affiliateLink
    );
    
    if (existingProduct) {
      // Atualizar produto existente
      await storage.updateProduct(existingProduct.id, validatedData);
    } else {
      // Criar novo produto
      await storage.createProduct(validatedData);
    }
    
    res.json({ success: true, message: 'Produto sincronizado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 2. Validação de Dados
```javascript
function validateProductData(data) {
  const required = ['title', 'currentPrice', 'affiliateLink', 'category'];
  
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Campo obrigatório: ${field}`);
    }
  }
  
  // Validar preço
  const price = parseFloat(data.currentPrice);
  if (price < 10 || price > 5000) {
    throw new Error('Preço inválido');
  }
  
  // Validar categoria
  const validCategories = ['casa', 'autocuidado', 'familia', 'saude', 'tecnologia'];
  if (!validCategories.includes(data.category)) {
    throw new Error('Categoria inválida');
  }
  
  return data;
}
```

## Próximos Passos

### Para String.com:
1. **Criar conta** em string.com
2. **Configurar workflow** com o script Python acima
3. **Definir URLs** para monitoramento automático
4. **Configurar webhook** para sincronização em tempo real
5. **Testar automação** com produtos piloto

### Para Karooma:
1. **Implementar endpoints** de automação
2. **Configurar autenticação** API
3. **Adicionar validação** de dados
4. **Criar logs** de sincronização
5. **Implementar interface** de monitoramento

## Benefícios

✅ **Dados 100% Autênticos** - Direto da Amazon  
✅ **Sincronização Automática** - Sem intervenção manual  
✅ **Preços Atualizados** - Monitoramento em tempo real  
✅ **Validação Rigorosa** - Apenas dados válidos  
✅ **Rastreabilidade** - Logs completos de sincronização  

## Monitoramento

- **Dashboard** para acompanhar sincronizações
- **Alertas** para produtos fora de estoque
- **Relatórios** de performance dos produtos
- **Logs** detalhados de todas as operações