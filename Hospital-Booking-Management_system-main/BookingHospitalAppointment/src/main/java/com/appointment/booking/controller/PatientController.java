package com.appointment.booking.controller;

import com.appointment.booking.model.Patient;
import com.appointment.booking.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/patients")
@CrossOrigin("*")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Patient patient) {
        return service.signup(patient);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> data) {
        return service.login(
                data.get("email"),
                data.get("password")
        );
    }
}
