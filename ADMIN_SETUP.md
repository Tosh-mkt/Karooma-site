# Configuração do Administrador

## Como criar o primeiro usuário administrador

### Passo 1: Fazer Login via Replit
1. **Acesse o site e faça login:**
   - Vá para `/api/login` diretamente no navegador
   - Ou clique em "Admin" no menu se aparecer
   - Faça login com sua conta Replit quando solicitado
   - Você será redirecionado para a página inicial após o login

### Passo 2: Obter seu ID de usuário
**Opção A - Via Console do Navegador:**
   - Abra o console do navegador (F12)
   - Vá para a aba Network
   - Atualize a página
   - Procure pela requisição para `/api/auth/user`
   - Na resposta, você verá um campo `id` - anote esse valor

**Opção B - Via Banco de Dados:**
   - Use o terminal do Replit
   - Execute: `SELECT id, email FROM users;`
   - Localize seu email e anote o ID correspondente

### Passo 3: Tornar-se Administrador

**Opção A - Usuário de Teste (Para desenvolvimento):**
   ```bash
   # Criar usuário admin de teste
   curl -X POST http://localhost:5000/api/test/create-user \
     -H "Content-Type: application/json" \
     -d '{"id":"admin-user","email":"admin@karooma.com","firstName":"Admin","lastName":"User","isAdmin":true}'
   ```

**Opção B - Via API com seu ID (Recomendado):**
   ```bash
   curl -X POST http://localhost:5000/api/admin/make-admin/SEU_ID_AQUI
   ```
   
**Em Produção:**
   ```bash
   curl -X POST https://SEU_DOMINIO.replit.app/api/admin/make-admin/SEU_ID_AQUI
   ```

**Opção C - Diretamente no Banco (Emergência):**
   ```sql
   INSERT INTO users (id, email, first_name, is_admin) 
   VALUES ('seu-id', 'seu-email@gmail.com', 'Seu Nome', true);
   ```

### Passo 4: Verificar Acesso Admin
1. **Atualize a página** - o botão "Admin" deve aparecer no menu
2. **Clique no botão Admin** para acessar o painel completo
3. **Verifique se consegue ver todas as funcionalidades**

## Recursos do Painel Administrativo

### Dashboard
- Estatísticas em tempo real
- Status da automação N8N
- Atividade recente via SSE

### Gestão de Produtos
- Visualizar todos os produtos
- Marcar/desmarcar como destaque
- Editar informações
- Deletar produtos
- Links diretos para produtos afiliados

### Funcionalidades Futuras
- Gestão de conteúdo (blog/vídeos)
- Analytics detalhado
- Configurações do site
- Gestão de usuários

## Segurança

- Apenas usuários autenticados via Replit podem acessar
- Apenas usuários com flag `isAdmin` podem gerenciar conteúdo
- Todas as operações administrativas são protegidas
- Sessions são armazenadas no PostgreSQL

## Troubleshooting

**Problema**: Não consigo acessar o painel
**Solução**: Verifique se você fez login e se é administrador

**Problema**: O botão Admin não aparece
**Solução**: Faça logout e login novamente após ser promovido a admin

**Problema**: Erro 401/403 no painel
**Solução**: Verifique se sua sessão não expirou, faça login novamente