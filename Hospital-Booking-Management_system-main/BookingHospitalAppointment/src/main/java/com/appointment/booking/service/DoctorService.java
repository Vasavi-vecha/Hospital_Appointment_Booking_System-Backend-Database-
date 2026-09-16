package com.appointment.booking.service;

import com.appointment.booking.model.Doctor;
import com.appointment.booking.repository.DoctorRepository;
import com.appointment.booking.security.JwtUtil;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DoctorService {

    private final DoctorRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public DoctorService(DoctorRepository repo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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
                    .body(Map.of("success", false, "message", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(doctor.getEmail(), "DOCTOR", doctor.getName());

        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", doctor.getId());
        user.put("name", doctor.getName());
        user.put("email", doctor.getEmail());
        user.put("department", doctor.getDepartment());
        user.put("specialization", doctor.getSpecialization());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

}
