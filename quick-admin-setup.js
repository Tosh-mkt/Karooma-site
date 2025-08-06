// Script para criar usuário admin de teste
const userId = "admin-user";

// Primeiro criar o usuário no sistema
fetch('http://localhost:5000/api/test/create-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: userId,
    email: "admin@karooma.com",
    firstName: "Admin",
    lastName: "Karooma",
    isAdmin: true
  })
})
.then(response => response.json())
.then(data => {
  console.log("Usuário criado:", data);
  
  // Agora tentar tornar admin
  return fetch(`http://localhost:5000/api/admin/make-admin/${userId}`, {
    method: 'POST'
  });
})
.then(response => response.json())
.then(data => {
  console.log("Status admin:", data);
})
.catch(error => {
  console.error("Erro:", error);
});