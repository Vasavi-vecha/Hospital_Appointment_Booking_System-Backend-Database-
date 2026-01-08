/* ================= AUTH GUARD ================= */
const BASE_URL = "http://localhost:8080";

let voiceDepartment = "";
let voiceTime = "";

const patient = JSON.parse(localStorage.getItem("loggedPatient"));
if (!patient) {
  alert("Please login first");
  window.location.href = "login.html";
}

/* ================= BASIC INFO ================= */
patientName.innerText = patient.name;
greeting.innerText = `Hello, ${patient.name}!`;

/* ================= SECTION TOGGLE ================= */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".sidebar li").forEach(li =>
    li.classList.remove("active")
  );

  event.target.classList.add("active");

  if (id === "reports") loadReports();
}

/* ================= LOAD APPOINTMENT STATS ================= */
function loadAppointmentStats() {
  fetch(`${BASE_URL}/appointments/patient/${patient.name}`)
    .then(res => res.json())
    .then(apps => {
      scheduledCount.innerText =
        apps.filter(a => a.status === "Scheduled").length;
      completedCount.innerText =
        apps.filter(a => a.status === "Completed").length;
      cancelledCount.innerText =
        apps.filter(a => a.status === "Cancelled").length;
    });
}

/* ================= BOOK APPOINTMENT ================= */
function bookAppointment() {
  if (!deptSelect.value || !doctorSelect.value ||
      !appDate.value || !appTime.value) {
    alert("All fields required");
    return;
  }

  fetch(`${BASE_URL}/appointments/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientName: patient.name,
      doctorEmail: doctorSelect.value,
      date: appDate.value,
      time: appTime.value,
      status: "Scheduled"
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Appointment booked successfully");
      loadAppointmentStats();
      loadMyAppointments();
    })
    .catch(() => alert("Error booking appointment"));
}

/* ================= LOAD DEPARTMENTS ================= */
function loadDepartments() {
  fetch(`${BASE_URL}/doctors/all`)
    .then(res => res.json())
    .then(doctors => {
      const depts = [...new Set(doctors.map(d => d.department))];
      deptSelect.innerHTML = `<option value="">Select Department</option>`;
      depts.forEach(d =>
        deptSelect.innerHTML += `<option>${d}</option>`
      );
    });
}

/* ================= LOAD DOCTORS ================= */
function loadDoctorsByDept() {
  fetch(`${BASE_URL}/doctors/all`)
    .then(res => res.json())
    .then(doctors => {
      doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;
      doctors
        .filter(d => d.department === deptSelect.value)
        .forEach(d => {
          doctorSelect.innerHTML +=
            `<option value="${d.email}">Dr. ${d.name}</option>`;
        });
    });
}

/* ================= LOAD MY APPOINTMENTS ================= */
function loadMyAppointments() {
  fetch(`${BASE_URL}/appointments/patient/${patient.name}`)
    .then(res => res.json())
    .then(apps => {
      myAppTable.innerHTML = `
        <tr>
          <th>Doctor</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      `;

      apps.forEach(a => {
        myAppTable.innerHTML += `
          <tr>
            <td>${a.doctorEmail}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.status}</td>
          </tr>
        `;
      });
    });
}

/* ================= LOAD REPORTS ================= */
function loadReports() {
  fetch(`${BASE_URL}/reports/patient/${patient.name}`)
    .then(res => res.json())
    .then(reports => {
      reportTable.innerHTML = `
        <tr>
          <th>Doctor</th>
          <th>Date</th>
          <th>Diagnosis</th>
          <th>Prescription</th>
        </tr>
      `;

      reports.forEach(r => {
        reportTable.innerHTML += `
          <tr>
            <td>${r.doctorEmail}</td>
            <td>${r.date}</td>
            <td>${r.diagnosis}</td>
            <td>${r.prescription || "-"}</td>
          </tr>
        `;
      });
    });
}

/* ================= VOICE BOOKING ================= */
function startVoiceBooking() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = e =>
    processVoiceCommand(e.results[0][0].transcript.toLowerCase());
}

function processVoiceCommand(text) {
  if (text.includes("cardiology")) voiceDepartment = "Cardiology";
  else if (text.includes("neurology")) voiceDepartment = "Neurology";
  else if (text.includes("orthopedic")) voiceDepartment = "Orthopedic";
  else if (text.includes("general")) voiceDepartment = "General";

  if (!voiceDepartment) {
    speak("Department not recognized");
    return;
  }

  speak("Tell preferred time");
  setTimeout(startTimeRecognition, 2000);
}

function startTimeRecognition() {
  const recognition =
    new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = e => {
    voiceTime = parseTime(e.results[0][0].transcript);
    if (!voiceTime) return speak("Time not understood");
    autoBookAppointment();
  };
}

function parseTime(text) {
  if (text.includes("10")) return "10:00";
  if (text.includes("11")) return "11:00";
  if (text.includes("12")) return "12:00";
  if (text.includes("1")) return "13:00";
  if (text.includes("2")) return "14:00";
  if (text.includes("3")) return "15:00";
  return "";
}

/* ================= AUTO BOOK ================= */
function autoBookAppointment() {
  fetch(`${BASE_URL}/appointments/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientName: patient.name,
      doctorEmail: "voice@hospital.com",
      date: new Date().toISOString().split("T")[0],
      time: voiceTime,
      status: "Scheduled"
    })
  }).then(() => {
    speak("Appointment booked successfully");
    loadAppointmentStats();
    loadMyAppointments();
  });
}

/* ================= VOICE RESPONSE ================= */
function speak(msg) {
  const speech = new SpeechSynthesisUtterance(msg);
  speech.lang = "en-IN";
  speechSynthesis.speak(speech);
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("loggedPatient");
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadDepartments();
loadAppointmentStats();
loadMyAppointments();
