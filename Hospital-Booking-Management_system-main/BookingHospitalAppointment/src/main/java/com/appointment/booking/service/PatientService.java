package com.appointment.booking.service;

import com.appointment.booking.model.Patient;
import com.appointment.booking.repository.PatientRepository;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository repo;
    private final PasswordEncoder passwordEncoder;

    public PatientService(PatientRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
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
        Optional<Patient> patient = repo.findByEmail(email);

        if (patient.isEmpty() || !passwordEncoder.matches(password, patient.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
        return ResponseEntity.ok(patient.get());
    }
}
