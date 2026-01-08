package com.appointment.booking.controller;

import com.appointment.booking.model.Appointment;
import com.appointment.booking.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@CrossOrigin("*")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping("/book")
    public Appointment book(@RequestBody Appointment appointment) {
        return service.book(appointment);
    }

    @GetMapping("/patient/{name}")
    public List<Appointment> patient(@PathVariable String name) {
        return service.byPatient(name);
    }

    @GetMapping("/doctor/{email}")
    public List<Appointment> doctor(@PathVariable String email) {
        return service.byDoctor(email);
    }
}
