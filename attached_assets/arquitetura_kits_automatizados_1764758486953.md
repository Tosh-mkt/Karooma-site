# Arquitetura Completa para Sistema de Kits Automatizados com PA-API + Curadoria Inteligente

## 📌 Objetivo Geral

Criar uma plataforma capaz de gerar, atualizar e publicar
automaticamente **Kits de Produtos da Amazon organizados por tarefas**,
utilizando: - PA-API (Product Advertising API) - Motor de curadoria
inteligente - Geração automática de conteúdo (LLM) - Enriquecimento de
atributos (compactação, facilidade de limpeza, manutenção, etc.) -
Front-end responsivo com páginas otimizadas para SEO

Este documento servirá como guia técnico para implementação pelo
assistente de coding (ou qualquer desenvolvedor).

------------------------------------------------------------------------

# 1. Visão Geral do Sistema

O sistema deve receber um **tema** (ex.: "kit limpeza banheiro", "kit
troca de fralda para passeios"), e automaticamente:

1.  Interpretar a intenção da tarefa\
2.  Gerar regras automáticas (keywords, roles, must-have, filtros)\
3.  Buscar produtos via PA-API\
4.  Enriquecer dados dos produtos\
5.  Aplicar scoring inteligente\
6.  Selecionar os melhores itens\
7.  Gerar título SEO, descrições, bullets e rationale\
8.  Criar capa visual automática\
9.  Gerar página do kit + JSON-LD (SEO)\
10. Armazenar no banco\
11. Atualizar automaticamente via scheduler

------------------------------------------------------------------------

# 2. Fluxo Completo do Sistema

    [Formulário - Tema do Kit]
               ↓
    [Interpretador de Tema - LLM]
               ↓
    [Geração Automática das Regras do Kit]
               ↓
    [Motor de Busca - PA-API]
               ↓
    [Enriquecimento de Atributos - NLP/LLM]
               ↓
    [Motor de Curadoria / Scoring]
               ↓
    [Assembler do Kit]
               ↓
    [Geração de Conteúdo Completa]
               ↓
    [Criação de Página e JSON-LD]
               ↓
    [Armazenamento + Publicação]
               ↓
    [Scheduler para Atualização Automática]

------------------------------------------------------------------------

# 3. Estrutura de Banco de Dados

## 3.1 Tabela: `ProductKit`

  Campo               Tipo       Descrição
  ------------------- ---------- --------------------------------------
  id                  uuid       PK
  title               string     Nome do kit
  slug                string     URL amigável
  theme               string     Tema original inserido no formulário
  task_intent         enum       Ex: CLEANING_PIA, BATHROOM_CLEAN
  short_description   text       Descrição curta
  long_description    text       Descrição longa
  image_url           string     Capa do kit
  rule_config_id      FK         Regras usadas na geração
  status              enum       DRAFT, ACTIVE, ERROR
  last_updated        datetime   Atualização via scheduler

------------------------------------------------------------------------

## 3.2 Tabela: `KitRules`

  Campo               Tipo     Descrição
  ------------------- -------- --------------------------------------
  id                  uuid     PK
  kit_id              FK       Referência do kit
  keyword_groups      json     Lista de grupos de keywords + pesos
  min_items           int      mínimo
  max_items           int      máximo
  rating_min          float    filtro
  price_range         json     {min, max}
  prime_only          bool     exige Prime
  must_have           json     itens obrigatórios
  type_weights        json     roles e pesos
  attribute_weights   json     pesos para facilidade de limpeza etc
  fallback_strategy   json     substituição
  update_frequency    string   cron

------------------------------------------------------------------------

## 3.3 Tabela: `KitProducts`

  Campo        Tipo     Descrição
  ------------ -------- -----------------------------
  id           uuid     PK
  kit_id       FK       referência
  asin         string   produto
  title        string   nome
  role         enum     MAIN, SECONDARY, COMPLEMENT
  score        float    score final
  attributes   json     atributos enriquecidos
  price        float    preço atual
  image_url    string   imagem
  added_via    enum     API, MANUAL, SUBSTITUTE

------------------------------------------------------------------------

# 4. Interpretação Automática do Tema (LLM)

Exemplos:

### Input:

    "kit limpeza de banheiro"

### Output:

``` json
{
  "intent": "BATHROOM_CLEAN",
  "keywords": ["desinfetante banheiro", "escova sanitária silicone", "esponja anti-mofo"],
  "must_have": ["escova sanitária"],
  "task_description": "Limpeza rápida de banheiro",
  "base_category": "Home & Kitchen"
}
```

------------------------------------------------------------------------

# 5. Geração Automática das Regras (RulesConfig)

Exemplo:

``` json
{
  "keyword_groups": [
    { "keywords": ["escova sanitária silicone"], "weight": 1.5 },
    { "keywords": ["desinfetante banheiro"], "weight": 1.2 },
    { "keywords": ["pano microfibra"], "weight": 0.7 }
  ],
  "must_have": ["escova sanitária"],
  "min_items": 3,
  "max_items": 7,
  "rating_min": 4.0,
  "prime_only": true,
  "attribute_weights": {
    "easy_cleaning": 1.2,
    "compact": 1.0,
    "low_maintenance": 0.8,
    "durable": 1.1
  },
  "fallback_strategy": {
    "use_manual_asins": true,
    "substitute_by_category": true
  }
}
```

------------------------------------------------------------------------

# 6. Motor de Enriquecimento de Atributos (NLP / LLM)

### Atributos inferidos:

-   easy_cleaning\
-   compact\
-   low_maintenance\
-   durable\
-   portable

### Métodos:

-   regex\
-   NLP keywords\
-   LLM com classificação contínua (0 a 1)

------------------------------------------------------------------------

# 7. Motor de Scoring

Score final:

    score = 
        base_score              # rating + BSR + preço + Prime
      + role_score              # MAIN, SECONDARY, COMPLEMENT
      + keyword_relevance       # match keywords
      + attribute_scores        # limpeza, compactação etc.

Cada atributo tem peso configurável no rules_config.

------------------------------------------------------------------------

# 8. Seleção e Montagem do Kit

### Etapas:

1.  Ordenar produtos por score\
2.  Remover duplicatas (marca, título, imagem parecida)\
3.  Garantir must-have\
4.  Preencher MAIN \> SECONDARY \> COMPLEMENT\
5.  Validar min_items / max_items\
6.  Validar coerência com categoria da tarefa\
7.  Se incoerente → flag NEEDS_REVIEW

------------------------------------------------------------------------

# 9. Geração Automática de Conteúdo (LLM)

### Geração:

-   Título SEO\
-   Short description\
-   Long description\
-   Bullets do kit\
-   Rationale por item\
-   FAQ do kit\
-   slug automático\
-   JSON-LD (schema.org ItemList + Product)

------------------------------------------------------------------------

# 10. Componente Visual

### Automação:

-   capa do kit: collage com 3--4 imagens dos principais itens\
-   grid ordenado por roles\
-   destaque visual para MAIN\
-   páginas totalmente responsivas

------------------------------------------------------------------------

# 11. Formulário para Geração de Kits

### Campos:

-   Tema do kit\
-   Min/max de itens\
-   Categoria opcional\
-   Intensidade da curadoria (strict/normal/loose)

### Fluxo:

Formulário → interpretTheme() → generateRules() → searchPAAPI() →
curateKit() → generateContent() → publish()

------------------------------------------------------------------------

# 12. Endpoint Exemplo (Node.js)

``` javascript
POST /api/generate-kit
{
  "theme": "kit organização da pia",
  "min_items": 3,
  "max_items": 6
}
```

------------------------------------------------------------------------

# 13. Scheduler

-   Atualizações diárias ou semanais\
-   Rebusca produtos\
-   Atualiza preços\
-   Substitui itens indisponíveis\
-   Regera capa se necessário\
-   Atualiza página automaticamente

------------------------------------------------------------------------

# 14. Flags do Sistema

  Flag           Significado
  -------------- -----------------------------------
  ACTIVE         Kit publicado
  DRAFT          Kit criado mas não publicado
  NEEDS_REVIEW   Automação não conseguiu coerência
  ERROR          Falha na busca ou montagem

------------------------------------------------------------------------

# 15. Exemplo de Kit Final (JSON)

``` json
{
  "kit_id": "kit-limpeza-banheiro-001",
  "title": "Kit Limpeza de Banheiro — Limpeza rápida sem esforço",
  "slug": "kit-limpeza-banheiro",
  "products": [
    {
      "asin": "B0XYZ123",
      "title": "Escova Sanitária de Silicone",
      "role": "MAIN",
      "score": 0.92,
      "attributes": {
        "easy_cleaning": 0.9,
        "compact": 0.8
      }
    }
  ],
  "short_description": "Tudo para manter o banheiro limpo em poucos minutos.",
  "cover_image": "/images/kits/limpeza-banheiro-capa.png",
  "json_ld": "<script> ... </script>"
}
```

------------------------------------------------------------------------

# 16. Conclusão

Essa arquitetura fornece: - automação completa\
- curadoria contextual\
- enriquecimento de atributos\
- SEO nativo\
- visual selling automático\
- páginas de alta conversão

Pronta para implementação pelo assistente de coding.
