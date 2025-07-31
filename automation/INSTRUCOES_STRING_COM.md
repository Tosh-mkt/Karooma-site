# 🤖 AUTOMAÇÃO STRING.COM - KAROOMA

## Configuração Rápida

### 1. No String.com
1. **Criar novo workflow** chamado "Karooma Product Sync"
2. **Definir trigger**: Daily execution às 06:00 (horário de Brasília)
3. **Copiar o script** `string-com-template.py` completo
4. **Configurar URLs** para monitoramento automático

### 2. URLs para Monitorar
```python
amazon_urls = [
    "https://amzn.to/44TPsu4",  # Balance Bike Nathor (atual)
    # Adicionar novos produtos aqui
]
```

### 3. Configuração de Variáveis
```python
KAROOMA_API_BASE = "https://seu-projeto.replit.app"  # Sua URL do Replit
```

## Como Funciona

### Fluxo Automático
1. **String.com extrai dados reais** da Amazon (preços, avaliações, descrições)
2. **Valida informações** (preços, categorias, campos obrigatórios)
3. **Mapeia categorias** Amazon → Karooma automaticamente
4. **Envia para API** do Karooma via POST `/api/automation/products/sync`
5. **Atualiza ou cria** produtos no banco PostgreSQL
6. **Gera relatório** de sincronização

### Validações Automáticas
- ✅ **Preços entre R$ 10,00 - R$ 5.000,00**
- ✅ **Categorias válidas**: casa, autocuidado, familia, saude, tecnologia
- ✅ **Campos obrigatórios**: título, preço, link afiliado, categoria
- ✅ **Produtos featured**: rating ≥ 4.5 estrelas
- ✅ **Evita duplicatas**: verifica por link afiliado

## Mapeamento de Categorias

| Amazon | Karooma |
|--------|---------|
| Home & Kitchen | casa |
| Beauty & Personal Care | autocuidado |
| Baby & Toys | familia |
| Health & Household | saude |
| Electronics | tecnologia |

## Exemplo de Produto Sincronizado

### Entrada (String.com extrai da Amazon):
```json
{
  "title": "Bicicleta Infantil Balance Bike sem Pedal Masculina 03, Nathor",
  "currentPrice": 215.90,
  "rating": 4.8,
  "reviewCount": 1011,
  "category": "Toys & Games",
  "imageUrl": "https://m.media-amazon.com/images/I/51NS1a-08IL._AC_SX355_.jpg"
}
```

### Saída (Formatado para Karooma):
```json
{
  "title": "Bicicleta Infantil Balance Bike sem Pedal Masculina 03, Nathor",
  "currentPrice": "215.90",
  "rating": "4.8",
  "category": "familia",
  "featured": true,
  "affiliateLink": "https://amzn.to/44TPsu4"
}
```

## Monitoramento

### API Status
```bash
GET /api/automation/products/status
```

**Retorna:**
```json
{
  "totalProducts": 5,
  "featuredProducts": 3,
  "lastSync": "2025-07-31T08:00:00.000Z",
  "status": "active"
}
```

### Logs de Sincronização
- ✅ `Novo produto criado via String.com: [Nome do Produto]`
- ⚠️ `Produto já existe: [ID do Produto]`
- ❌ `Erro na sincronização String.com: [Detalhes do erro]`

## Benefícios da Automação

### 🎯 Precisão Total
- **Dados 100% autênticos** diretamente da Amazon
- **Preços atualizados** diariamente
- **Avaliações reais** de clientes

### ⚡ Eficiência
- **Zero intervenção manual**
- **Sincronização automática** todos os dias
- **Validação rigorosa** antes de publicar

### 📊 Controle
- **Relatórios detalhados** de cada sincronização
- **Status em tempo real** via API
- **Logs completos** para debugging

## Próximos Passos

### Para String.com:
1. ✅ Copiar script `string-com-template.py`
2. ✅ Configurar workflow daily às 06:00
3. ✅ Definir URLs para monitoramento
4. ✅ Testar com produto piloto

### Para Expansão:
1. **Adicionar mais produtos** na lista de URLs
2. **Configurar alertas** para produtos fora de estoque
3. **Criar dashboard** de performance dos produtos
4. **Implementar análise** de conversão de afiliados

---

**📞 Suporte**: Para dúvidas sobre implementação, consulte os arquivos `string-com-integration.md` e `string-com-template.py` para referência técnica completa.