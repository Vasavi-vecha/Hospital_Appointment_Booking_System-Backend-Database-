package com.appointment.booking.controller;

import com.appointment.booking.exception.ForbiddenException;
import com.appointment.booking.model.Appointment;
import com.appointment.booking.security.CurrentUser;
import com.appointment.booking.service.AppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping("/book")
    public Appointment book(@RequestBody Appointment appointment, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        return service.book(appointment, currentUser.getName());
    }

    @GetMapping("/slots")
    public List<String> slots(@RequestParam String doctorEmail, @RequestParam String date) {
        return service.getFreeSlots(doctorEmail, date);
    }

    @PutMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestParam String status, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        return service.updateStatus(id, status, currentUser);
    }

    @GetMapping("/patient/{name}")
    public List<Appointment> patient(@PathVariable String name, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        if (currentUser.getRole().equals("PATIENT") && !currentUser.getName().equals(name)) {
            throw new ForbiddenException("You can only view your own appointments");
        }
        return service.byPatient(name);
    }

    @GetMapping("/doctor/{email}")
    public List<Appointment> doctor(@PathVariable String email, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        if (currentUser.getRole().equals("DOCTOR") && !currentUser.getEmail().equals(email)) {
            throw new ForbiddenException("You can only view your own appointments");
        }
        return service.byDoctor(email);
    }
}
