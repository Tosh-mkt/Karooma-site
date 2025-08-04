# 🔌 SOLUÇÃO: Conexão N8N com Replit

## Problema Identificado
**Erro**: "The service refused the connection - perhaps it is offline"  
**Causa**: N8N tentando conectar em porta incorreta ou URL mal configurada

## ✅ Configuração Correta

### 1. URL do Seu Projeto Replit
```
https://seu-projeto-usuario.replit.app
```

**Como encontrar sua URL:**
1. No Replit, vá em **Webview** (aba ao lado do código)
2. Copie a URL que aparece na barra de endereços
3. Remova qualquer `/` no final

### 2. Configuração no N8N

#### No nó "Prepare URLs":
```javascript
// ✅ CORRETO - Usar a URL do Replit sem especificar porta
const KAROOMA_API_BASE = "https://seu-projeto-usuario.replit.app";

// ❌ INCORRETO - Não usar localhost ou portas específicas  
// const KAROOMA_API_BASE = "http://localhost:5000";
// const KAROOMA_API_BASE = "https://seu-projeto.replit.dev:5000";
```

#### No nó "Sync to Karooma":
```javascript
// URL completa para o endpoint
${KAROOMA_API_BASE}/api/automation/products/batch
```

### 3. Verificação da Conectividade

**Teste no navegador:**
1. Abra: `https://sua-url.replit.app/api/products`
2. Deve retornar JSON com produtos
3. Se funcionar, a API está acessível

**Teste no N8N:**
1. Criar nó HTTP Request simples
2. GET para: `https://sua-url.replit.app/api/products`
3. Executar para confirmar conectividade

## 🚨 Configurações que NÃO Funcionam

### ❌ URLs Incorretas:
```javascript
// Estas URLs NÃO funcionarão:
"http://localhost:5000"                    // Só funciona localmente
"https://seu-projeto.replit.dev:5000"      // Porta específica bloqueada  
"http://0.0.0.0:5000"                      // IP interno
"https://seu-projeto.replit.app:5000"      // Porta desnecessária
```

### ❌ Headers Incorretos:
```json
// Não usar headers de autorização desnecessários
{
  "Authorization": "Bearer token123",  // API não requer auth
  "X-API-Key": "key123"               // API não requer key
}
```

## ✅ Configuração Recomendada Completa

### No N8N Workflow:

#### 1. Nó "Prepare URLs"
```javascript
// Configuração correta da URL base
const KAROOMA_API_BASE = "https://seu-projeto-usuario.replit.app";

// Lista de produtos Amazon
const amazonUrls = [
  "https://amzn.to/44TPsu4",
  "https://amzn.to/seu-link-2",
  "https://amzn.to/seu-link-3"
];

return { KAROOMA_API_BASE, amazonUrls };
```

#### 2. Nó "Sync to Karooma" - HTTP Request
- **Method**: POST
- **URL**: `{{$node["Prepare URLs"].json["KAROOMA_API_BASE"]}}/api/automation/products/batch`
- **Headers**:
```json
{
  "Content-Type": "application/json"
}
```
- **Body**: 
```json
{
  "products": [{{$json}}]
}
```

## 🔍 Como Debugar Problemas de Conexão

### 1. Verificar Status do Replit
```bash
# No terminal do Replit, verificar se servidor está rodando
curl http://localhost:5000/api/products
```

### 2. Testar URL Externa
```bash
# Testar do seu computador
curl https://sua-url.replit.app/api/products
```

### 3. Logs no N8N
- Verificar **Console Logs** na execução
- Procurar por erros HTTP 404, 500, timeout
- Confirmar URL está sendo montada corretamente

### 4. Logs no Replit
- Verificar **Console** na aba inferior
- Procurar por requests chegando: `POST /api/automation/products/batch`
- Verificar erros de validação ou processamento

## 📝 Checklist de Configuração

- [ ] URL do Replit copiada corretamente (sem porta, sem `/` final)
- [ ] Endpoint `/api/automation/products/batch` existe e funciona
- [ ] Servidor Replit está rodando (workflow "Start application" ativo)
- [ ] N8N consegue acessar internet (não está em rede privada)
- [ ] Headers corretos no nó HTTP Request
- [ ] Payload JSON válido sendo enviado

## 🎯 Exemplo de Configuração Funcionando

### URL Completa no N8N:
```
https://karooma-principal-usuario.replit.app/api/automation/products/batch
```

### Request Body Exemplo:
```json
{
  "products": [
    {
      "title": "Bicicleta Infantil Balance Bike",
      "currentPrice": 215.9,
      "affiliateUrl": "https://amzn.to/44TPsu4",
      "imageUrl": "https://m.media-amazon.com/images/I/image.jpg",
      "category": "familia",
      "rating": 4.8,
      "reviewCount": 150,
      "description": "Bicicleta sem pedal para crianças"
    }
  ]
}
```

### Response Esperado:
```json
{
  "success": true,
  "processed": 1,
  "successful": 1,
  "failed": 0,
  "results": [
    {
      "success": true,
      "product": { "id": "uuid-gerado", ... }
    }
  ]
}
```

## 🚀 Próximos Passos

1. **Confirmar URL** do seu projeto Replit
2. **Atualizar N8N** com URL correta
3. **Testar conexão** com nó HTTP Request simples
4. **Executar workflow** completo
5. **Verificar logs** em ambos os lados

---

**💡 Dica**: Se ainda tiver problemas, compartilhe a URL exata do seu Replit e podemos verificar se a API está acessível externamente.