
# Kit Creator - PreASIN Documentation (Integration for Vibe Coding)

## Overview
This document consolidates all necessary materials for implementing the Kit Creation Pipeline using:
- IA Assistants (GPT / Google Gem) for conceptual & creative phases  
- Backend Module (Vibe Coding) for ASIN search, scoring, and publication  

The purpose is to provide a **shared understanding** between AI and development layers.

---

# 1. JSON Instruction for IA Assistant

```json
{
  "name": "KitCreator-PreASIN",
  "version": "1.0",
  "role": "assistant",
  "description": "Assistente especializado em criar a estrutura conceitual completa de kits de produtos organizados por tarefas, preparando regras, categorias e parâmetros para posterior busca de ASINs pelo módulo técnico.",
  "capabilities": {
    "fetch_asin": false,
    "fetch_real_products": false,
    "use_paapi": false,
    "generate_content": true,
    "generate_rules": true
  },
  "objectives": [
    "Interpretar temas e transformá-los em kits orientados a tarefas.",
    "Criar a lógica conceitual do kit, sem buscar produtos reais.",
    "Gerar keywords e regras necessárias para que o módulo realize buscas na PA-API.",
    "Definir itens ideais, roles, critérios de busca e estrutura geral do kit.",
    "Gerar conteúdo textual do kit: título SEO, descrições e bullets.",
    "Devolver um JSON final padronizado, pronto para uso pelo backend."
  ],
  "constraints": [
    "Nunca buscar produtos reais.",
    "Nunca retornar ASINs.",
    "Nunca consultar a PA-API.",
    "Sempre retornar JSON final bem formado.",
    "Os itens do kit devem ser conceituais (tipos de produtos).",
    "Os critérios devem permitir busca posterior por ASIN."
  ],
  "inputs_expected": {
    "theme": "Tema do kit fornecido pelo usuário."
  }
}
```

---

# 2. Example Output (Given Theme: Kit troca de fralda para passeio)

```json
{
  "theme": "Kit troca de fralda para passeio",
  "task_intent": "DIAPER_CHANGE_ON_THE_GO",
  "problem_to_solve": [
    "Realizar a troca de fraldas em locais públicos.",
    "Garantir higiene e organização.",
    "Manter compacidade para transporte.",
    "Descarte higiênico de fraldas sujas."
  ],
  "kit_structure": {
    "items": [
      {
        "name": "Trocador Portátil Compacto Impermeável",
        "role": "MAIN",
        "criteria": {
          "must_keywords": ["trocador portátil", "impermeável", "dobrável"],
          "category": "Baby/Diapering/Changing Mats",
          "price_min": 50,
          "price_max": 150
        }
      },
      {
        "name": "Bolsa Organizadora",
        "role": "SECONDARY",
        "criteria": {
          "must_keywords": ["organizador fralda", "necessaire bebê"],
          "category": "Baby/Diapering/Diaper Bags",
          "price_min": 30,
          "price_max": 80
        }
      }
    ]
  },
  "rules_config": {
    "min_items": 3,
    "max_items": 4,
    "filters": {
      "rating_min": 4.2,
      "prime_only": true,
      "price_max": 250
    }
  }
}
```

---

# 3. Mock Backend Output (ASIN Resolution Example)

```json
{
  "kit_id": "KIT_000412",
  "theme": "Kit troca de fralda para passeio",
  "products": [
    {
      "asin": "B0A12K9M4F",
      "title": "Trocador Portátil Impermeável",
      "price_current": 98.90,
      "rating": 4.7,
      "role": "MAIN",
      "score": 0.94
    },
    {
      "asin": "B09NTK2PFJ",
      "title": "Organizador de Fraldas",
      "price_current": 69.50,
      "rating": 4.6,
      "role": "SECONDARY",
      "score": 0.82
    }
  ]
}
```

---

# 4. Backend Pseudocode (Simplified)

```
function processKit(json_input):

    validate(json_input.rules_config)

    keywords = extract(json_input.rules_config.keyword_groups)

    raw = []
    for group in keywords:
        res = paapi.searchItems(group.keywords)
        raw.append(res.items)

    unique = dedupe(raw)

    final = []
    for item in json_input.kit_structure.items:
        candidates = filter(unique, item.criteria)
        best = rank(candidates)[0]
        final.append(best)

    ensure_must_have(final, json_input.rules_config.must_have)

    return build_output(json_input, final)
```

---

# 5. Database Model (PostgreSQL)

### **kits**
```sql
CREATE TABLE kits (
    id SERIAL PRIMARY KEY,
    theme VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    task_intent VARCHAR(100),
    rules_config JSONB,
    content JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **kit_items (conceptual)**
```sql
CREATE TABLE kit_items (
    id SERIAL PRIMARY KEY,
    kit_id INT REFERENCES kits(id),
    name VARCHAR(255),
    role VARCHAR(50),
    criteria JSONB
);
```

### **kit_products (ASINs)**

```sql
CREATE TABLE kit_products (
    id SERIAL PRIMARY KEY,
    kit_id INT REFERENCES kits(id),
    asin VARCHAR(20),
    title TEXT,
    role VARCHAR(50),
    score NUMERIC(5,4),
    price_current NUMERIC(10,2),
    rating NUMERIC(3,2),
    matched_criteria JSONB
);
```

---

# 6. Improvements for Stronger IA → Backend Integration

### Add weight for each conceptual item:
```json
"weight": 1.0
```

### Add search_languages:
```json
"search_languages": ["pt_BR", "en_US"]
```

### Add roles priority:
```json
"roles_priority": { "MAIN": 3, "SECONDARY": 2, "COMPLEMENT": 1 }
```

### Add max_candidates_per_item:
```json
"max_candidates_per_item": 20
```

---

# Final Notes

This `.md` file includes everything needed for Vibe Coding to:
- understand the pipeline  
- implement PA-API integration  
- map conceptual items → ASINs  
- build the backend logic  
- unify IA + automação  

Use this file as a **single source of truth** for the integration.
