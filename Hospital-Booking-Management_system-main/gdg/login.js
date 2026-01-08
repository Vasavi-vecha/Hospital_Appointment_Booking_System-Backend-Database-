const BASE_URL = "http://localhost:8080";

/* ================= DOCTOR LOGIN ================= */
function doctorLogin() {
  fetch(`${BASE_URL}/doctors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: doctorEmail.value,
      password: doctorPassword.value
    })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(doctor => {
      localStorage.setItem("loggedDoctor", JSON.stringify(doctor));
      location.href = "doctor-dashboard.html";
    })
    .catch(() => alert("Doctor not authorized"));
}

/* ================= PATIENT LOGIN ================= */
function patientLogin() {
  fetch(`${BASE_URL}/patients/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: patientEmail.value.trim(),
      password: patientPassword.value
    })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(patient => {
      localStorage.setItem("loggedPatient", JSON.stringify(patient));
      location.href = "patient-dashboard.html";
    })
    .catch(() => alert("Invalid email or password"));
}
