# Guia de Login para Acessar o Admin - Karooma

## Status Atual
- ✅ Sistema de autenticação Replit Auth configurado
- ✅ Usuários administradores criados no banco
- ✅ Painel administrativo protegido e funcional

## Passo a Passo para Login

### 1. Acessar a Página de Login
**Clique neste link ou cole no navegador:**
```
http://localhost:5000/api/login
```

### 2. Fazer Login com Replit
- Você será redirecionado para a página de login do Replit
- Use suas credenciais da conta Replit
- Autorize o acesso quando solicitado

### 3. Obter seu ID de Usuário
Após o login, você precisa descobrir seu ID para se tornar administrador:

**Opção A - Console do Navegador:**
1. Pressione F12 para abrir as ferramentas de desenvolvedor
2. Vá para a aba "Network" (Rede)
3. Atualize a página (F5)
4. Procure pela requisição `/api/auth/user`
5. Clique nela e veja a resposta - anote o campo `id`

**Opção B - Verificar no banco:**
```sql
SELECT id, email FROM users ORDER BY created_at DESC LIMIT 5;
```

### 4. Tornar-se Administrador
Com seu ID em mãos, execute no terminal:
```bash
curl -X POST http://localhost:5000/api/admin/make-admin/SEU_ID_AQUI
```

### 5. Acessar o Painel Admin
1. Atualize a página no navegador
2. O botão "Admin" aparecerá no menu superior
3. Clique no botão para acessar o painel completo

## Usuários de Teste Disponíveis
Se você quiser usar um usuário já configurado como admin:
- **ID**: admin-karooma
- **Email**: admin@karooma.com
- **Status**: Já é administrador

## Troubleshooting

**Problema**: Não consigo fazer login
**Solução**: Verifique se você tem uma conta Replit ativa

**Problema**: Botão Admin não aparece
**Solução**: Verifique se você executou o comando make-admin com sucesso

**Problema**: Erro 401/403 no painel
**Solução**: Faça logout e login novamente

## Próximos Passos Após Login
1. Gerenciar produtos (editar, deletar, marcar como destaque)
2. Visualizar estatísticas em tempo real
3. Monitorar automação N8N
4. Configurar novos administradores