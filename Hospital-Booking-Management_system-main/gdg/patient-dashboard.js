/* ================= AUTH GUARD ================= */
let voiceDepartment = "";

const patient = JSON.parse(localStorage.getItem("loggedPatient"));
if (!patient || !localStorage.getItem("token")) {
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
  apiFetch(`/appointments/patient/${patient.name}`)
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

  apiFetch(`/appointments/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doctorEmail: doctorSelect.value,
      date: appDate.value,
      time: appTime.value,
      status: "Scheduled"
    })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok) {
        throw new Error(result.data.message || "Error booking appointment");
      }
      alert("Appointment booked successfully");
      loadAppointmentStats();
      loadMyAppointments();
      loadSlots();
    })
    .catch(error => alert(error.message));
}

/* ================= LOAD DEPARTMENTS ================= */
function loadDepartments() {
  apiFetch(`/doctors/all`)
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
  apiFetch(`/doctors/all`)
    .then(res => res.json())
    .then(doctors => {
      doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;
      doctors
        .filter(d => d.department === deptSelect.value)
        .forEach(d => {
          doctorSelect.innerHTML +=
            `<option value="${d.email}">Dr. ${d.name}</option>`;
        });
      loadSlots();
    });
}

/* ================= LOAD FREE SLOTS ================= */
function loadSlots() {
  appTime.innerHTML = "";

  if (!doctorSelect.value || !appDate.value) {
    return;
  }

  apiFetch(`/appointments/slots?doctorEmail=${encodeURIComponent(doctorSelect.value)}&date=${appDate.value}`)
    .then(res => res.json())
    .then(slots => {
      if (slots.length === 0) {
        appTime.innerHTML = `<option value="">No slots available</option>`;
        return;
      }

      appTime.innerHTML = `<option value="">Select Time</option>`;
      slots.forEach(slot => {
        appTime.innerHTML += `<option value="${slot}">${slot}</option>`;
      });
    });
}

/* ================= LOAD MY APPOINTMENTS ================= */
function loadMyAppointments() {
  apiFetch(`/appointments/patient/${patient.name}`)
    .then(res => res.json())
    .then(apps => {
      myAppTable.innerHTML = `
        <tr>
          <th>Doctor</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      `;

      apps.forEach(a => {
        const cancelButton = a.status === "Scheduled"
          ? `<button onclick="cancelAppointment(${a.id})">Cancel</button>`
          : "-";

        myAppTable.innerHTML += `
          <tr>
            <td>${a.doctorEmail}</td>
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.status}</td>
            <td>${cancelButton}</td>
          </tr>
        `;
      });
    });
}

/* ================= CANCEL APPOINTMENT ================= */
function cancelAppointment(id) {
  apiFetch(`/appointments/${id}/status?status=Cancelled`, { method: "PUT" })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok) {
        throw new Error(result.data.message || "Could not cancel appointment");
      }
      loadAppointmentStats();
      loadMyAppointments();
    })
    .catch(error => alert(error.message));
}

/* ================= LOAD REPORTS ================= */
function loadReports() {
  apiFetch(`/reports/patient/${patient.name}`)
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
    const anchorMinutes = parseSpokenTimeToMinutes(e.results[0][0].transcript);
    if (anchorMinutes === null) return speak("Time not understood");
    findAndBookNearestSlot(anchorMinutes);
  };
}

/* Rough spoken-time-to-minutes guess; longer/more specific matches first
   so "10"/"11"/"12" aren't swallowed by the "1" check. */
function parseSpokenTimeToMinutes(text) {
  if (text.includes("10")) return 10 * 60;
  if (text.includes("11")) return 11 * 60;
  if (text.includes("12")) return 12 * 60;
  if (text.includes("9")) return 9 * 60;
  if (text.includes("1")) return 13 * 60;
  if (text.includes("2")) return 14 * 60;
  if (text.includes("3")) return 15 * 60;
  if (text.includes("4")) return 16 * 60;
  return null;
}

function slotToMinutes(slot) {
  const parts = slot.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/* ================= FIND NEAREST FREE SLOT + BOOK ================= */
function findAndBookNearestSlot(anchorMinutes) {
  const today = new Date().toISOString().split("T")[0];

  apiFetch(`/doctors/all`)
    .then(res => res.json())
    .then(doctors => {
      const candidates = doctors.filter(d => d.department === voiceDepartment);

      if (candidates.length === 0) {
        speak("No slot available");
        return;
      }

      const slotLookups = candidates.map(doctor =>
        apiFetch(`/appointments/slots?doctorEmail=${encodeURIComponent(doctor.email)}&date=${today}`)
          .then(res => res.json())
          .then(slots => ({ doctorEmail: doctor.email, slots: slots }))
      );

      Promise.all(slotLookups).then(results => {
        let best = null;

        results.forEach(result => {
          result.slots.forEach(slot => {
            const diff = Math.abs(slotToMinutes(slot) - anchorMinutes);
            if (best === null || diff < best.diff) {
              best = { doctorEmail: result.doctorEmail, slot: slot, diff: diff };
            }
          });
        });

        if (best === null) {
          speak("No slot available");
          return;
        }

        autoBookAppointment(best.doctorEmail, today, best.slot);
      });
    });
}

/* ================= AUTO BOOK ================= */
function autoBookAppointment(doctorEmail, date, time) {
  apiFetch(`/appointments/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doctorEmail: doctorEmail,
      date: date,
      time: time,
      status: "Scheduled"
    })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data: data })))
    .then(result => {
      if (!result.ok) {
        speak(result.data.message || "Could not book the appointment");
        return;
      }
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
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadDepartments();
loadAppointmentStats();
loadMyAppointments();

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

  apiFetch(`/chatbot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => appendChatMessage(data.reply, "bot"))
    .catch(() => appendChatMessage("Sorry, Aarogya is unavailable right now.", "bot"));
}
