/* ================= AUTH ================= */
const doctor = JSON.parse(localStorage.getItem("loggedDoctor"));
if (!doctor || !localStorage.getItem("token")) {
  alert("Doctor login required");
  window.location.href = "login.html";
}

/* ================= GREETING ================= */
greet.innerText = "Hello Dr. " + doctor.name;

/* ================= SECTION TOGGLE ================= */
function showSection(id) {
  document.querySelectorAll(".section")
    .forEach(s => s.classList.add("hidden"));

  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".sidebar li")
    .forEach(li => li.classList.remove("active"));

  event.target.classList.add("active");

  if (id === "appointments") loadAppointments();
  if (id === "reports") loadReports();
  if (id === "profile") loadProfile();
}

/* ================= LOAD APPOINTMENTS ================= */
function loadAppointments() {
  apiFetch(`/appointments/doctor/${doctor.email}`)
    .then(res => res.json())
    .then(apps => {
      appTable.innerHTML = `
        <tr>
          <th>Patient</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      `;

      apps.forEach(a => {
        let statusButtons = "";
        if (a.status === "Scheduled") {
          statusButtons = `
            <button onclick="updateAppointmentStatus(${a.id}, 'Completed')">Complete</button>
            <button onclick="updateAppointmentStatus(${a.id}, 'Cancelled')">Cancel</button>
          `;
        }

        appTable.innerHTML += `
          <tr>
            <td>${a.patientName}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.status}</td>
            <td>
              <button onclick="prepareReport('${a.patientName}', '${a.date}')">
                Add Report
              </button>
              ${statusButtons}
            </td>
          </tr>
        `;
      });
    });
}

/* ================= UPDATE APPOINTMENT STATUS ================= */
function updateAppointmentStatus(id, status) {
  apiFetch(`/appointments/${id}/status?status=${status}`, { method: "PUT" })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok) {
        throw new Error(result.data.message || "Could not update appointment");
      }
      loadAppointments();
    })
    .catch(error => alert(error.message));
}

/* ================= PREPARE REPORT ================= */
function prepareReport(patientName, date) {
  showSection("reports");
  document.getElementById("rPatient").value = patientName;
  document.getElementById("rDate").value = date;
}

/* ================= ADD REPORT ================= */
function submitReport() {
  const patientName = document.getElementById("rPatient").value;
  const date = document.getElementById("rDate").value;
  const diagnosis = document.getElementById("diagnosis").value;
  const prescription = document.getElementById("prescription").value;

  if (!diagnosis) {
    alert("Diagnosis is required");
    return;
  }

  apiFetch("/reports/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientName: patientName,
      date: date,
      diagnosis: diagnosis,
      prescription: prescription
    })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      alert("Report added successfully");
      document.getElementById("diagnosis").value = "";
      document.getElementById("prescription").value = "";
      loadReports();
    })
    .catch(() => alert("Error adding report"));
}

/* ================= LOAD REPORTS ================= */
function loadReports() {
  apiFetch(`/reports/doctor/${doctor.email}`)
    .then(res => res.json())
    .then(reports => {
      reportTable.innerHTML = `
        <tr>
          <th>Patient</th>
          <th>Date</th>
          <th>Diagnosis</th>
          <th>Prescription</th>
        </tr>
      `;

      reports.forEach(r => {
        reportTable.innerHTML += `
          <tr>
            <td>${r.patientName}</td>
            <td>${r.date}</td>
            <td>${r.diagnosis}</td>
            <td>${r.prescription || "-"}</td>
          </tr>
        `;
      });
    });
}

/* ================= LOAD PROFILE ================= */
function loadProfile() {
  pName.innerText = doctor.name;
  pEmail.innerText = doctor.email;
  pDept.innerText = doctor.department;
  pSpec.innerText = doctor.specialization || "-";

  apiFetch(`/appointments/doctor/${doctor.email}`)
    .then(res => res.json())
    .then(apps => {
      pAppointments.innerText = apps.length;
    });
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("loggedDoctor");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadAppointments();

/* ================= AAROGYA CHATBOT ================= */
function toggleChat() {
  chatPanel.classList.toggle("hidden");
}

function appendChatMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-msg ${sender}`;
  bubble.innerText = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  appendChatMessage(message, "user");
  chatInput.value = "";

  apiFetch("/chatbot/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => appendChatMessage(data.reply, "bot"))
    .catch(() => appendChatMessage("Sorry, Aarogya is unavailable right now.", "bot"));
}
