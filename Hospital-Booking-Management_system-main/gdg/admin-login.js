function adminLogin() {
  apiFetch("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: adminUser.value.trim(),
      password: adminPass.value
    })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok || !result.data.success) {
        throw new Error(result.data.message || "Invalid admin credentials");
      }
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("loggedAdmin", JSON.stringify(result.data.user));
      location.href = "admin-dashboard.html";
    })
    .catch(error => alert(error.message));
}
