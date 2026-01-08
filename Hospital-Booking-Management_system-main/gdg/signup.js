function signup() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !mobile || !password) {
    alert("All fields are required");
    return;
  }

  fetch("http://localhost:8080/patients/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      email: email,
      mobile: mobile,
      password: password
    })
  })
    .then(response => {
      if (response.status === 409) {
        throw new Error("Account already exists");
      }
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      return response.text();
    })
    .then(message => {
      alert(message);
      window.location.href = "login.html";
    })
    .catch(error => {
      alert(error.message);
    });
}
