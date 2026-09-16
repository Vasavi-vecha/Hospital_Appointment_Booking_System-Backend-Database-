package com.appointment.booking.service;

import com.appointment.booking.model.Admin;
import com.appointment.booking.repository.AdminRepository;
import com.appointment.booking.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AdminService {

    private final AdminRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminService(AdminRepository repo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public ResponseEntity<?> login(String email, String password) {
        Admin admin = repo.findByEmail(email).orElse(null);

        if (admin == null || !passwordEncoder.matches(password, admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getName());

        Map<String, Object> user = new LinkedHashMap<>();
        user.put("id", admin.getId());
        user.put("name", admin.getName());
        user.put("email", admin.getEmail());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }
}
