function createDoctor() {
  const name = document.getElementById("dname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const dept = document.getElementById("dept").value;

  if (!name || !email || !password || !dept) {
    alert("All fields required");
    return;
  }

  let doctors = JSON.parse(localStorage.getItem("doctors")) || [];

  const exists = doctors.find(d => d.email === email);
  if (exists) {
    alert("Doctor already exists");
    return;
  }

  doctors.push({
    name,
    email,
    password,
    dept,
    status: "ACTIVE"
  });

  localStorage.setItem("doctors", JSON.stringify(doctors));
  alert("Doctor account created successfully");
}
