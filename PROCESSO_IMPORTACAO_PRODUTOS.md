# Processo Padronizado de Importação de Produtos - Karooma

## Visão Geral
Este documento estabelece o processo padronizado para importação de dados de produtos com avaliações completas de especialistas, garantindo consistência e qualidade sem necessidade de ajustes manuais.

## Formato de Dados Padronizado

### Template CSV Obrigatório
```csv
Campo,Conteúdo
Nome do Produto,"[Nome completo do produto]"
Link do Produto,"[URL da Amazon/loja oficial]"
Link Afiliado,"[URL do link afiliado - obrigatório]"
Descrição,"[Descrição técnica detalhada do produto]"
Preço,"[Formato: 'R$ X a R$ Y' ou 'R$ X' para preço único]"
Pontuação Geral,"[Formato: 'X.Y de 5 estrelas' ou número decimal]"
Introdução,"[Texto introdutório da equipe multidisciplinar]"
Seleção da Equipe de Avaliadores,"[Lista com <br> entre especialistas]"
Benefícios (por avaliador),"[Avaliações completas separadas por <br><br>]"
Avaliação Geral da Equipe KAROOMA,"[Avaliação final da equipe]"
Tags,"[Tags organizadas por categorias com <br> entre grupos]"
```

### Regras de Formatação

#### 1. **Especialistas** (campo obrigatório)
```
- Nutricionista<br>- Organizadora Profissional<br>- Planejadora de Experiências Familiares<br>- Especialista em Design (Usabilidade)<br>- Especialista em Bem-Estar e Autocuidado
```

#### 2. **Avaliações** (formato obrigatório)
```
Nutricionista: Prós: [texto dos prós]. Contras: [texto dos contras].<br><br>Organizadora Profissional: Prós: [texto]. Contras: [texto].<br><br>[continua para todos os 5 especialistas]
```

#### 3. **Preços** (formatos aceitos)
- `R$ 125 a R$ 150` → currentPrice: 125.00, originalPrice: 150.00
- `R$ 99,90` → currentPrice: 99.90, originalPrice: null
- `Varia em torno de R$ 125` → currentPrice: 125.00

#### 4. **Pontuação** (formatos aceitos)
- `4.7 de 5 estrelas` → rating: "4.7"
- `4.5` → rating: "4.5"
- `Excelente (4.8/5)` → rating: "4.8"

#### 5. **Tags** (formato obrigatório)
```
Benefícios:<br>#Tag1<br>#Tag2<br>Locais e Segmentos:<br>#Tag3<br>#Tag4
```

## Processo de Importação

### Passo 1: Validação Automática
O sistema valida automaticamente:
- ✅ Presença de todos os campos obrigatórios
- ✅ Formato correto de preços e pontuação
- ✅ Link afiliado válido (obrigatório)
- ✅ Mínimo de 3 especialistas nas avaliações
- ✅ Estrutura correta de tags

### Passo 2: Processamento Automático
- **Categorização**: Automática baseada em palavras-chave
- **Parsing de Preços**: Extração automática de valores numéricos
- **Formatação**: Conversão automática de quebras de linha
- **Validação de Links**: Verificação de URLs válidas

### Passo 3: Criação do Card
- **ID único**: Gerado automaticamente
- **Timestamp**: Adicionado automaticamente
- **Dados estruturados**: Organizados para o modal de recomendações

## Endpoint de Importação

### URL: `/api/products/import`
### Método: `POST`
### Headers: `Content-Type: application/json`

### Exemplo de Uso
```bash
curl -X POST http://localhost:5000/api/products/import \
  -H "Content-Type: application/json" \
  -d @produto.json
```

## Garantias de Qualidade

### 1. **Validação Rigorosa**
- Campos obrigatórios sempre validados
- Formatos de dados consistentes
- Links funcionais verificados

### 2. **Processamento Robusto**
- Tratamento de diferentes formatos de preço
- Parsing inteligente de avaliações
- Categorização automática

### 3. **Consistência Visual**
- Modal sempre com mesmo layout
- Fontes padronizadas (text-base para títulos, text-sm para conteúdo)
- Botões "Ver mais/menos" automáticos para textos longos

### 4. **Dados Sempre Completos**
- 5 especialistas obrigatórios
- Avaliações com prós e contras
- Tags organizadas por categorias
- Links afiliados funcionais

## Checklist de Qualidade Pré-Importação

### ✅ Dados Obrigatórios
- [ ] Nome do produto completo
- [ ] Link da Amazon/loja oficial
- [ ] **Link afiliado (OBRIGATÓRIO)**
- [ ] Descrição técnica detalhada
- [ ] Preço formatado corretamente
- [ ] Pontuação com formato válido

### ✅ Especialistas (5 obrigatórios)
- [ ] Nutricionista com prós e contras
- [ ] Organizadora Profissional com prós e contras  
- [ ] Planejadora de Experiências Familiares com prós e contras
- [ ] Especialista em Design/Usabilidade com prós e contras
- [ ] Especialista em Bem-Estar com prós e contras

### ✅ Conteúdo de Qualidade
- [ ] Introdução contextualizada para mães ocupadas
- [ ] Avaliação geral da equipe KAROOMA
- [ ] Tags organizadas por benefícios e segmentos
- [ ] Textos humanizados e empáticos

## Resultado Garantido

Seguindo este processo padronizado, **TODOS** os produtos importados terão:

1. **Modal completo** com 5 avaliações de especialistas
2. **Textos legíveis** com fontes adequadas
3. **Botões funcionais** para textos longos
4. **Links afiliados** sempre presentes
5. **Dados estruturados** prontos para uso
6. **Experiência consistente** para o usuário final

## Manutenção Zero

Este processo foi projetado para:
- ❌ **Eliminar ajustes manuais** após importação
- ❌ **Eliminar correções** de formatação
- ❌ **Eliminar problemas** de dados faltantes
- ✅ **Garantir qualidade** automática
- ✅ **Padronizar experiência** do usuário
- ✅ **Acelerar processo** de criação de conteúdo

---

**Data de Criação**: 19 de agosto de 2025
**Status**: Implementado e testado com sucesso
**Responsável**: Sistema automatizado Karooma