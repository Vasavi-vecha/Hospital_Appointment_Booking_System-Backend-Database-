package com.appointment.booking.controller;

import com.appointment.booking.model.Doctor;
import com.appointment.booking.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/doctors")
@CrossOrigin("*")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Doctor addDoctor(@RequestBody Doctor doctor) {
        return service.addDoctor(doctor);
    }

    @GetMapping("/all")
    public List<Doctor> getAllDoctors() {
        return service.getAllDoctors();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> data) {
        return service.login(
                data.get("email"),
                data.get("password")
        );
    }
}
