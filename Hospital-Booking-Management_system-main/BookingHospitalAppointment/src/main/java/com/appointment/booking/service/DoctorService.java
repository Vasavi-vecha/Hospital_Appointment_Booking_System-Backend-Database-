package com.appointment.booking.service;

import com.appointment.booking.model.Doctor;
import com.appointment.booking.repository.DoctorRepository;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository repo;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public Doctor addDoctor(Doctor doctor) {
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        return repo.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return repo.findAll();
    }

    public ResponseEntity<?> login(String email, String password) {

        Doctor doctor = repo.findByEmail(email).orElse(null);

        if (doctor == null || !passwordEncoder.matches(password, doctor.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        return ResponseEntity.ok(doctor);
    }

}
