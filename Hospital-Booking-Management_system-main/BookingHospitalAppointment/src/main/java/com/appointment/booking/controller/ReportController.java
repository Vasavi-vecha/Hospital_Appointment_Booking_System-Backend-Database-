package com.appointment.booking.controller;

import com.appointment.booking.exception.ForbiddenException;
import com.appointment.booking.model.Report;
import com.appointment.booking.security.CurrentUser;
import com.appointment.booking.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Report add(@RequestBody Report report, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        report.setDoctorEmail(currentUser.getEmail());
        return service.save(report);
    }

    @GetMapping("/patient/{name}")
    public List<Report> patient(@PathVariable String name, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        if (currentUser.getRole().equals("PATIENT") && !currentUser.getName().equals(name)) {
            throw new ForbiddenException("You can only view your own reports");
        }
        return service.byPatient(name);
    }

    @GetMapping("/doctor/{email}")
    public List<Report> doctor(@PathVariable String email, HttpServletRequest request) {
        CurrentUser currentUser = (CurrentUser) request.getAttribute("currentUser");
        if (currentUser.getRole().equals("DOCTOR") && !currentUser.getEmail().equals(email)) {
            throw new ForbiddenException("You can only view your own reports");
        }
        return service.byDoctor(email);
    }
}
