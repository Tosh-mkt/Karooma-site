// Script para testar criação de usuário admin
const userId = "test-user-123";

// Simular um usuário de teste no banco
console.log("Criando usuário de teste...");

fetch('http://localhost:5000/api/admin/make-admin/' + userId, {
  method: 'POST'
})
.then(response => response.json())
.then(data => {
  console.log("Resultado:", data);
})
.catch(error => {
  console.error("Erro:", error);
});