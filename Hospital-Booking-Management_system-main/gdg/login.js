/* ================= DOCTOR LOGIN ================= */
function doctorLogin() {
  apiFetch("/doctors/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: doctorEmail.value,
      password: doctorPassword.value
    })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok || !result.data.success) {
        throw new Error(result.data.message || "Doctor not authorized");
      }
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("loggedDoctor", JSON.stringify(result.data.user));
      location.href = "doctor-dashboard.html";
    })
    .catch(error => alert(error.message));
}

/* ================= PATIENT LOGIN ================= */
function patientLogin() {
  apiFetch("/patients/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: patientEmail.value.trim(),
      password: patientPassword.value
    })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok || !result.data.success) {
        throw new Error(result.data.message || "Invalid email or password");
      }
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("loggedPatient", JSON.stringify(result.data.user));
      location.href = "patient-dashboard.html";
    })
    .catch(error => alert(error.message));
}
