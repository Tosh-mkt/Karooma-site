# Configuração do Administrador

## Como criar o primeiro usuário administrador

1. **Faça login no site usando Replit Auth:**
   - Clique em "Admin" no menu (se aparecer) ou acesse `/admin/dashboard`
   - Você será redirecionado para fazer login com sua conta Replit
   - Após o login, anote seu ID de usuário

2. **Obtenha seu ID de usuário:**
   - Após fazer login, abra o console do navegador (F12)
   - Vá para a aba Network
   - Procure pela requisição para `/api/auth/user`
   - Na resposta, você verá um campo `id` - esse é seu ID de usuário

3. **Torne-se administrador via API:**
   ```bash
   curl -X POST http://localhost:5000/api/admin/make-admin/SEU_ID_AQUI
   ```
   
   Ou use o terminal do Replit:
   ```bash
   curl -X POST https://SEU_DOMINIO.replit.app/api/admin/make-admin/SEU_ID_AQUI
   ```

4. **Acesse o painel administrativo:**
   - Atualize a página
   - O botão "Admin" aparecerá no menu
   - Clique para acessar o painel completo

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