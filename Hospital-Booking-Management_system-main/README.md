# Hospital Appointment Booking System

A hospital appointment booking system with a Spring Boot backend and a plain HTML/CSS/JS frontend.

## Features

- Patient signup/login, doctor login, admin login — all JWT-based
- Patients book appointments into fixed daily time slots (per doctor, per date)
- Double-booking prevention (application check + DB unique constraint)
- Appointment status workflow: Scheduled → Completed / Cancelled, with doctor/patient ownership rules
- Voice-based appointment booking (Web Speech API) that finds a real free doctor slot
- Doctor medical reports (add/view)
- Admin can add doctors and view all doctors/patients/reports
- "Aarogya" AI chatbot (Spring AI + OpenAI) for basic how-to-use questions
- Role-based access control (PATIENT / DOCTOR / ADMIN) enforced by Spring Security

## Project structure

- `BookingHospitalAppointment/` — Spring Boot 4 backend (Java 17), package `com.appointment.booking`
- `gdg/` — frontend (plain HTML/CSS/JS), talks to the backend at `http://localhost:8080`

## Running locally

### Backend

1. Create a MySQL database (default name `hospital_db_`).
2. Set environment variables (see table below) — at minimum `DB_PASSWORD` for your local MySQL.
3. From `BookingHospitalAppointment/`, run:
   ```
   mvn spring-boot:run
   ```
   The API starts on `http://localhost:8080` by default.
4. On first startup, one ADMIN account is seeded automatically (see `ADMIN_EMAIL`/`ADMIN_PASSWORD` below).

### Frontend

Serve the `gdg/` folder with any static file server (e.g. VS Code "Live Server") on `http://localhost:5500`, then open `index.html`. The frontend calls the backend at `http://localhost:8080` (see `BASE_URL` in `gdg/api.js`).

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/hospital_db_` | MySQL JDBC URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | *(empty)* | MySQL password — **must be set locally**, no real default is committed |
| `PORT` | `8080` | Backend HTTP port |
| `OPENAI_API_KEY` | `demo-key-replace-me` | API key for the Aarogya chatbot (Spring AI / OpenAI) |
| `JWT_SECRET` | `dev-only-insecure-secret-change-me-please` | HMAC signing secret for JWTs — **set a real secret in production** |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5500,http://127.0.0.1:5500` | Comma-separated list of origins allowed to call the API |
| `ADMIN_EMAIL` | `admin@hospital.com` | Email of the auto-seeded admin account (local default only) |
| `ADMIN_PASSWORD` | `admin123` | Password of the auto-seeded admin account (local default only) |

`booking.slots` (in `application.properties`) configures the bookable times: `09:00,10:00,11:00,12:00,14:00,15:00,16:00`.

## Authentication

Login endpoints (`/patients/login`, `/doctors/login`, `/admin/login`) return:
```json
{ "success": true, "token": "<jwt>", "user": { "id": 1, "name": "...", "email": "..." } }
```
The frontend stores the token in `localStorage` and sends it as `Authorization: Bearer <token>` on every subsequent request via `gdg/api.js`'s `apiFetch` helper. A `401` response clears local storage and redirects to `login.html`.

## Access rules

| Endpoint | Who |
|---|---|
| `POST /patients/signup` | Public |
| `POST /patients/login` | Public |
| `POST /doctors/login` | Public |
| `POST /admin/login` | Public |
| `POST /doctors/add` | ADMIN |
| `GET /doctors/all` | Any authenticated user |
| `GET /appointments/slots` | Any authenticated user |
| `POST /chatbot/ask` | Any authenticated user |
| `POST /appointments/book` | PATIENT (patient name is taken from the token, not the request body) |
| `GET /appointments/patient/{name}` | That patient, or ADMIN |
| `GET /appointments/doctor/{email}` | That doctor, or ADMIN |
| `PUT /appointments/{id}/status` | DOCTOR (their own appointments, any status) or PATIENT (their own appointment, Cancel only, only while Scheduled) |
| `POST /reports/add` | DOCTOR (doctor email is taken from the token, not the request body) |
| `GET /reports/patient/{name}` | That patient, any DOCTOR, or ADMIN |
| `GET /reports/doctor/{email}` | That doctor, or ADMIN |

## Known limitation

The unique constraint on appointments is `(doctor_email, date, time)` with no status column, matching the exact requirement it was built to. In practice this means once a given doctor/date/time slot has ever been booked, it can't be reused for a *different* appointment row even after the original is Cancelled — the `/appointments/slots` endpoint will show it as free again (since it only counts `Scheduled` rows), but the booking attempt will fail with a 409 from the database constraint. If you want cancelled slots to become truly reusable, the fix is to widen the unique constraint to `(doctor_email, date, time, status)`.
