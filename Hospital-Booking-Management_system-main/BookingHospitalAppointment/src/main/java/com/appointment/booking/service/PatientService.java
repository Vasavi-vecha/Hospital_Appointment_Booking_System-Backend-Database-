package com.appointment.booking.service;

import com.appointment.booking.model.Patient;
import com.appointment.booking.repository.PatientRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository repo;

    public PatientService(PatientRepository repo) {
        this.repo = repo;
    }

    public ResponseEntity<?> signup(Patient patient) {
        if (repo.existsByEmail(patient.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Account already exists");
        }
        repo.save(patient);
        return ResponseEntity.ok("Signup successful");
    }

    public ResponseEntity<?> login(String email, String password) {
        Optional<Patient> patient =
                repo.findByEmailAndPassword(email, password);

        if (patient.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
        return ResponseEntity.ok(patient.get());
    }
}
