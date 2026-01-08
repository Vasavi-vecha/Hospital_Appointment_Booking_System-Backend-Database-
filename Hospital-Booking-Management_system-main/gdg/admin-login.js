function adminLogin() {
  if (adminUser.value === "admin" && adminPass.value === "admin123") {
    localStorage.setItem("adminLoggedIn", "true");
    location.href = "admin-dashboard.html";
  } else {
    alert("Invalid admin credentials");
  }
}
