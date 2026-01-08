package com.appointment.booking.service;

import com.appointment.booking.model.Doctor;
import com.appointment.booking.repository.DoctorRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository repo;

    public DoctorService(DoctorRepository repo) {
        this.repo = repo;
    }

    public Doctor addDoctor(Doctor doctor) {
        return repo.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return repo.findAll();
    }

    public ResponseEntity<?> login(String email, String password) {

        Doctor doctor = repo.findByEmailAndPassword(email, password).orElse(null);

        if (doctor == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        return ResponseEntity.ok(doctor);
    }

}
