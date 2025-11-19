# Checklist de QA/UX - Karooma.life

## Persona: Cláudia (Mãe de 3 filhos, 39 anos)
- Busca: Otimização de tempo, soluções práticas para o dia a dia
- Dispositivo preferencial: Mobile
- Necessidade: Navegação rápida, mensagens claras, sem jargões

---

## 1. TESTES CRÍTICOS DE NAVEGAÇÃO

### Cenário 1: Encontrar Conteúdo Recente
**Objetivo**: Encontrar conteúdo recente sobre "dicas de maternidade" e compartilhar

**Passos**:
1. [ ] Acessar homepage
2. [ ] Identificar seção de blog/missões em destaque
3. [ ] Filtrar ou buscar por termo relevante
4. [ ] Abrir conteúdo
5. [ ] Localizar botão de compartilhamento social
6. [ ] Simular compartilhamento

**Critérios de Sucesso**:
- Conteúdo recente está visível na homepage (sem necessidade de scroll excessivo)
- Busca retorna resultados relevantes
- Botão de compartilhamento é facilmente identificável
- Processo leva menos de 3 cliques da homepage ao share

---

### Cenário 2: Navegar para Produtos Afiliados
**Objetivo**: Encontrar produto de "organização doméstica" e simular compra

**Passos**:
1. [ ] Acessar menu de navegação
2. [ ] Clicar em "Nossa Loja" (anteriormente "Facilitam a Vida")
3. [ ] Identificar categoria "Resolvem"
4. [ ] Filtrar por subcategoria (casa, cozinha, etc.)
5. [ ] Abrir card de produto
6. [ ] Clicar no link de afiliado

**Critérios de Sucesso**:
- Menu de navegação claramente visível (mobile e desktop)
- Categorias de produtos são autoexplicativas
- Cards de produto mostram informação essencial (preço, rating)
- Link afiliado abre em nova aba
- Máximo 4 cliques da homepage ao produto

---

### Cenário 3: Assinar Newsletter
**Objetivo**: Localizar e preencher formulário de newsletter

**Passos**:
1. [ ] Acessar homepage
2. [ ] Scroll até footer ou CTA de newsletter
3. [ ] Identificar campo de email
4. [ ] Preencher e enviar
5. [ ] Verificar mensagem de confirmação

**Critérios de Sucesso**:
- Newsletter form está visível no footer ou seção dedicada
- Placeholder do input é claro ("Digite seu email" não "Email")
- Botão de envio tem texto acionável ("Receber Dicas" vs "Enviar")
- Feedback imediato após submit (toast ou mensagem)

---

### Cenário 4: Conhecer a História da Karooma
**Objetivo**: Encontrar informações sobre missão/valores e retornar à homepage

**Passos**:
1. [ ] Localizar link "Sobre" no menu
2. [ ] Acessar página Sobre
3. [ ] Ler conteúdo
4. [ ] Retornar à homepage via logo ou botão

**Critérios de Sucesso**:
- Link "Sobre" facilmente encontrado no menu principal
- Conteúdo usa linguagem empática e próxima
- Logo sempre clickable para voltar à home
- Não há "dead ends" (sempre há caminho de retorno)

---

## 2. AVALIAÇÃO DE ELEMENTOS UI/UX

### A. Navegabilidade e Fluxo

#### Clareza de Caminhos
- [ ] **Menu Principal**: Todos os itens são autoexplicativos?
  - Início, Sobre, Blog, Missões, Diagnóstico, Nossa Loja
- [ ] **Breadcrumbs**: Existe indicação clara de "onde estou"?
- [ ] **CTAs**: Próximos passos são óbvios em cada página?

#### Identificação de "Dead Ends"
- [ ] Todas as páginas têm pelo menos um CTA claro?
- [ ] Páginas de erro (404) oferecem caminho de volta?
- [ ] Páginas de missão/blog têm navegação para conteúdo relacionado?

#### Identificação de Loops
- [ ] Usuário não precisa clicar repetidamente no mesmo item?
- [ ] Formulários não exigem múltiplos envios para completar?
- [ ] Navegação entre categorias é fluida (sem recargas desnecessárias)?

---

### B. Coerência e Consistência

#### Consistência Visual
- [ ] **Cores**: Paleta beige/cream (#FAF8F5, #F5F3EE) aplicada consistentemente?
- [ ] **Tipografia**: Fontes (Fredoka One, Poppins, Inter) usadas de forma coerente?
- [ ] **Espaçamento**: Padding/margin seguem padrão em todas as páginas?
- [ ] **Componentes**: Botões, cards, badges mantêm estilo uniforme?

#### Linguagem Coerente
- [ ] **Tom de voz**: Empático, prático, sem jargões técnicos?
- [ ] **Termos consistentes**: "Missão" vs "Desafio", "Nossa Loja" vs "Produtos"?
- [ ] **CTAs**: Orientados à ação ("Começar Leve" vs "Clique aqui")?

#### Hierarquia Visual
- [ ] **Elementos principais**: Destacados visualmente (tamanho, cor, posição)?
- [ ] **Conversão**: Botões de ação primária se destacam?
- [ ] **Escanabilidade**: Títulos, subtítulos, listas facilitam leitura rápida?

---

### C. Inteligibilidade dos Elementos

#### Clareza dos CTAs
Verificar se cada CTA comunica claramente o resultado da ação:

- [ ] ❌ "Clique aqui" → ✅ "Baixe o Guia Gratuito"
- [ ] ❌ "Saiba mais" → ✅ "Ver Todas as Missões"
- [ ] ❌ "Enviar" → ✅ "Receber Dicas por Email"
- [ ] ❌ "Ver" → ✅ "Ver na Loja Amazon"

#### Reconhecimento de Ícones
- [ ] **Menu Hambúrguer**: Universalmente reconhecível (mobile)?
- [ ] **Busca**: Ícone de lupa é óbvio?
- [ ] **Social**: Ícones Instagram/Facebook são reconhecidos?
- [ ] **Carrinho/Favoritos**: Ícones fazem sentido sem label?

#### Conteúdo Sem Fricção
- [ ] **Parágrafos**: Curtos (2-3 linhas no mobile)?
- [ ] **Listas**: Informação essencial em bullets/números?
- [ ] **Formatação**: Negrito/itálico destacam pontos-chave?
- [ ] **Imagens**: Têm propósito claro (não apenas decorativas)?

---

## 3. VERIFICAÇÃO TÉCNICA

### Performance Mobile
- [ ] Página inicial carrega em < 3 segundos (3G)
- [ ] Imagens otimizadas (WebP/AVIF quando possível)
- [ ] Fontes carregam sem FOIT (Flash of Invisible Text)
- [ ] Touch targets > 44x44px (botões, links)

### Responsividade
- [ ] Layout mobile-first testado em:
  - [ ] iPhone SE (375px)
  - [ ] iPhone 12/13 (390px)
  - [ ] Samsung Galaxy (360px)
- [ ] Breakpoints funcionam corretamente:
  - [ ] Mobile (< 768px)
  - [ ] Tablet (768px - 1024px)
  - [ ] Desktop (> 1024px)

### Acessibilidade Básica
- [ ] Alt text em todas as imagens
- [ ] Contraste de cores WCAG AA compliant
- [ ] Navegação por teclado funcional
- [ ] Labels de formulário associados corretamente

### SEO Técnico
- [ ] Títulos únicos e descritivos em cada página
- [ ] Meta descriptions relevantes
- [ ] URLs amigáveis (slugs legíveis)
- [ ] Open Graph tags para compartilhamento social

---

## 4. TESTES ESPECÍFICOS DO KAROOMA

### Sistema de Missões
- [ ] Template `missao-template-dev` funciona corretamente
- [ ] Checklist de tarefas persiste no localStorage
- [ ] Barra de progresso atualiza conforme conclusão
- [ ] Audio narration funciona (quando suportado)
- [ ] Produtos Amazon carregam com ASINs corretos
- [ ] Fallback gracioso quando PA-API indisponível

### Sistema de Produtos
- [ ] Aba "Resolvem" exibe produtos Amazon
- [ ] Aba "Expressam" exibe produtos Montink (4 por linha desktop)
- [ ] Cards de produto mostram todas as informações:
  - [ ] Imagem, título, preço, rating
  - [ ] Botão "Ver Produto" ou "Veja na Loja Karooma"
  - [ ] Botão "Avisar Oferta"
- [ ] Filtros funcionam corretamente
- [ ] Busca retorna resultados relevantes

### Preview System (Novo)
- [ ] Botão "Pré-visualizar" aparece no admin ao editar missão
- [ ] Preview abre em nova aba
- [ ] Banner laranja indica "Modo Prévia"
- [ ] Preview mostra missões não publicadas (admin only)
- [ ] Preview exibe conteúdo idêntico ao que seria publicado

---

## 5. WORKFLOW DEV → QA → PROD

### Desenvolvimento
1. [ ] Desenvolver em template dedicado (`*-template-dev`)
2. [ ] Testar funcionalidade no template
3. [ ] Verificar responsividade (mobile, tablet, desktop)
4. [ ] Validar com este checklist

### Pré-visualização
1. [ ] Admin: Criar ou editar conteúdo no painel
2. [ ] Clicar em "Pré-visualizar" antes de publicar
3. [ ] Verificar layout, imagens, textos no preview
4. [ ] Confirmar que está tudo correto

### Publicação
1. [ ] Marcar `isPublished = true` no admin
2. [ ] Verificar URL pública funciona
3. [ ] Testar compartilhamento social
4. [ ] Confirmar analytics/tracking ativo

---

## 6. CRITÉRIOS DE FALHA CRÍTICA

**Bloqueia publicação se:**
- [ ] Navegação quebrada (links 404, loops infinitos)
- [ ] Layout quebrado no mobile
- [ ] Imagens não carregam ou têm tamanho errado
- [ ] Formulários não submetem ou não validam
- [ ] Links afiliados quebrados ou sem tag correta
- [ ] Texto ilegível (contraste baixo, fonte muito pequena)
- [ ] Performance terrível (> 5s para carregar)

---

## 7. PONTUAÇÃO FINAL

### Navegabilidade (0-30 pontos)
- Clareza de caminhos: ___ / 10
- Ausência de dead ends: ___ / 10
- Fluxo sem loops: ___ / 10

### Consistência (0-30 pontos)
- Visual: ___ / 10
- Linguagem: ___ / 10
- Hierarquia: ___ / 10

### Clareza (0-30 pontos)
- CTAs inteligíveis: ___ / 10
- Ícones reconhecíveis: ___ / 10
- Conteúdo escaneável: ___ / 10

### Técnico (0-10 pontos)
- Performance + Responsividade: ___ / 5
- Acessibilidade + SEO: ___ / 5

**PONTUAÇÃO TOTAL**: ___ / 100

**Classificação**:
- 90-100: Excelente - Pronto para produção
- 75-89: Bom - Pequenos ajustes necessários
- 60-74: Satisfatório - Melhorias importantes
- < 60: Insuficiente - Revisão profunda necessária

---

## 8. TOP 3 RECOMENDAÇÕES

Após completar o checklist, listar as 3 ações de maior impacto:

1. **Ação 1**: _______________________
   - Impacto: [ ] Conversão [ ] Engajamento [ ] Usabilidade
   - Prioridade: [ ] Alta [ ] Média [ ] Baixa

2. **Ação 2**: _______________________
   - Impacto: [ ] Conversão [ ] Engajamento [ ] Usabilidade
   - Prioridade: [ ] Alta [ ] Média [ ] Baixa

3. **Ação 3**: _______________________
   - Impacto: [ ] Conversão [ ] Engajamento [ ] Usabilidade
   - Prioridade: [ ] Alta [ ] Média [ ] Baixa

---

**Data do Teste**: __________  
**Testador**: __________  
**Versão/Branch**: __________  
**Ambiente**: [ ] Dev [ ] Staging [ ] Prod
