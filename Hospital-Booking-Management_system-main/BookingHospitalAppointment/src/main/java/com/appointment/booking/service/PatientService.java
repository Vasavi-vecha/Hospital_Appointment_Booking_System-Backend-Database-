package com.appointment.booking.service;

import com.appointment.booking.model.Patient;
import com.appointment.booking.repository.PatientRepository;
import com.appointment.booking.security.JwtUtil;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public PatientService(PatientRepository repo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public ResponseEntity<?> signup(Patient patient) {
        if (repo.existsByEmail(patient.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Account already exists");
        }
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        repo.save(patient);
        return ResponseEntity.ok("Signup successful");
    }

    public ResponseEntity<?> login(String email, String password) {
        Optional<Patient> found = repo.findByEmail(email);

        if (found.isEmpty() || !passwordEncoder.matches(password, found.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid email or password"));
        }

        Patient patient = found.get();
        String token = jwtUtil.generateToken(patient.getEmail(), "PATIENT", patient.getName());

        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", patient.getId());
        user.put("name", patient.getName());
        user.put("email", patient.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }
}
