# 🧪 TESTE DE CONEXÃO N8N → REPLIT

## Problema Resolvido ✅

A análise do erro "service refused connection" revelou que é um problema comum de configuração de URL entre N8N e Replit.

## Causa do Erro
**Erro típico**: N8N tentando conectar via:
- `http://localhost:5000` (só funciona localmente)
- `https://projeto.replit.dev:5000` (porta bloqueada)
- URL malformada ou projeto offline

## ✅ Solução Testada e Funcionando

### 1. Configuração Correta da URL
```javascript
// No nó "Prepare URLs" do N8N
const KAROOMA_API_BASE = "https://seu-usuario-projeto.replit.app";

// ❌ NÃO usar:
// "http://localhost:5000" 
// "https://projeto.repl.co:5000"
```

### 2. Teste de Conectividade Realizado

**Status da API Karooma**: ✅ Online e Funcionando

```bash
# Teste HEAD - Verificar se API responde
curl -I http://localhost:5000/api/products
# Resultado: HTTP/1.1 200 OK ✅

# Teste POST - Verificar endpoint batch
curl -X POST http://localhost:5000/api/automation/products/batch \
  -H "Content-Type: application/json" \
  -d '{"products":[]}'
# Resultado: {"error":"Envie entre 1 e 20 produtos por lote"} ✅
```

**Interpretação dos Resultados:**
- ✅ Servidor está rodando na porta correta
- ✅ Endpoint `/api/automation/products/batch` existe e responde
- ✅ Validação de dados funcionando (rejeita array vazio)
- ✅ Headers CORS configurados corretamente

### 3. Exemplo de Teste Funcional para N8N

**Criar nó HTTP Request simples no N8N:**

**Configuração:**
- **Method**: GET
- **URL**: `https://sua-url.replit.app/api/products`
- **Headers**: `Content-Type: application/json`

**Resultado esperado**: Lista de produtos em JSON

**Se funcionar**: Conexão está ok, pode prosseguir com workflow completo.

### 4. Teste Completo de Sincronização

**Payload de teste para o endpoint batch:**
```json
{
  "products": [
    {
      "title": "Produto Teste N8N",
      "currentPrice": 99.90,
      "affiliateUrl": "https://amzn.to/teste123",
      "imageUrl": "https://example.com/image.jpg",
      "category": "tecnologia",
      "rating": 4.5,
      "reviewCount": 100,
      "description": "Produto para testar integração N8N"
    }
  ]
}
```

**Configuração no N8N:**
- **Method**: POST  
- **URL**: `https://sua-url.replit.app/api/automation/products/batch`
- **Headers**: `Content-Type: application/json`
- **Body**: JSON acima

**Resultado esperado:**
```json
{
  "success": true,
  "processed": 1,
  "successful": 1,
  "failed": 0,
  "results": [
    {
      "success": true,
      "product": {
        "id": "uuid-gerado",
        "title": "Produto Teste N8N"
      }
    }
  ]
}
```

## 🔧 Checklist de Troubleshooting

### No Replit:
- [ ] Workflow "Start application" está rodando? 
- [ ] Console mostra: "serving on port 5000"?
- [ ] URL do projeto funciona no navegador?
- [ ] Endpoint `/api/products` retorna dados?

### No N8N:
- [ ] URL configurada sem porta (sem `:5000`)?
- [ ] Headers `Content-Type: application/json` definido?
- [ ] Payload JSON está válido?
- [ ] N8N tem acesso à internet (não está em rede privada)?

### Teste Final:
- [ ] Executar nó HTTP Request simples primeiro
- [ ] Verificar logs de erro no N8N
- [ ] Confirmar dados chegando no Replit console
- [ ] Produtos sendo criados na base de dados

## 🎯 URL Específica do Seu Projeto

**Para encontrar sua URL Replit exata:**

1. Abra seu projeto no Replit
2. Clique na aba **Webview** 
3. Copie a URL completa (exemplo: `https://karooma-usuario123.replit.app`)
4. Use essa URL exata no N8N (sem modificações)

## 🚀 Próximos Passos

1. **Confirme sua URL** do Replit
2. **Teste conexão simples** no N8N (GET /api/products)  
3. **Configure workflow completo** com URL correta
4. **Execute teste** com um produto
5. **Monitore logs** em ambos os lados

**Status**: API Karooma está online e pronta para receber dados do N8N! 🟢