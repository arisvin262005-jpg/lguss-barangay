fetch("http://localhost:5000/api/auth/register", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    firstName: "Test",
    lastName: "User",
    email: "test.fetch@example.com",
    password: "password123",
    role: "User",
    barangay: "Barangay 1"
  })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);
