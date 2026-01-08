/* ================= AUTH ================= */
if (localStorage.getItem("adminLoggedIn") !== "true") {
  alert("Admin login required");
  window.location.href = "admin-login.html";
}

/* ================= BASE URL ================= */
const BASE_URL = "http://localhost:8080";

/* ================= SECTION SWITCH ================= */
function showSection(id, el) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".menu li").forEach(li =>
    li.classList.remove("active")
  );
  el.classList.add("active");

  if (id === "doctors") loadDoctors();
}

/* ================= CREATE DOCTOR ================= */
function createDoctor() {

  if (!dname.value || !demail.value || !dpass.value || !ddept.value) {
    alert("Please fill all required fields");
    return;
  }

  const doctor = {
    name: dname.value,
    email: demail.value,
    password: dpass.value,
    department: ddept.value,
    specialization: dspec.value || ""
  };

  fetch(`${BASE_URL}/doctors/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doctor)
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      alert("Doctor added successfully");
      loadDoctors();
    })
    .catch(() => alert("Error adding doctor"));
}

/* ================= LOAD DOCTORS ================= */
function loadDoctors() {
  fetch(`${BASE_URL}/doctors/all`)
    .then(res => res.json())
    .then(doctors => {

      doctorTable.innerHTML = `
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Specialization</th>
        </tr>
      `;

      if (doctors.length === 0) {
        doctorTable.innerHTML += `
          <tr>
            <td colspan="4">No doctors added yet</td>
          </tr>
        `;
        return;
      }

      doctors.forEach(d => {
        doctorTable.innerHTML += `
          <tr>
            <td>${d.name}</td>
            <td>${d.email}</td>
            <td>${d.department}</td>
            <td>${d.specialization || "-"}</td>
          </tr>
        `;
      });
    })
    .catch(() => alert("Failed to load doctors"));
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin-login.html";
}

/* ================= INIT ================= */
loadDoctors();
