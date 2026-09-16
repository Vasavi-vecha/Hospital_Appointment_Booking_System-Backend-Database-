package com.appointment.booking.config;

import com.appointment.booking.model.Admin;
import com.appointment.booking.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final AdminRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeeder(AdminRepository repo,
                        PasswordEncoder passwordEncoder,
                        @Value("${admin.email}") String adminEmail,
                        @Value("${admin.password}") String adminPassword) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (repo.existsByEmail(adminEmail)) {
            return;
        }

        Admin admin = new Admin();
        admin.setName("Administrator");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        repo.save(admin);
    }
}
