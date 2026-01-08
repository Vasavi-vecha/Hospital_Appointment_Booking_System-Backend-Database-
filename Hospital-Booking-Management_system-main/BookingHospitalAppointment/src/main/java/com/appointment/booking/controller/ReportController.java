package com.appointment.booking.controller;

import com.appointment.booking.model.Report;
import com.appointment.booking.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@CrossOrigin("*")
public class ReportController {

    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Report add(@RequestBody Report report) {
        return service.save(report);
    }

    @GetMapping("/patient/{name}")
    public List<Report> patient(@PathVariable String name) {
        return service.byPatient(name);
    }

    @GetMapping("/doctor/{email}")
    public List<Report> doctor(@PathVariable String email) {
        return service.byDoctor(email);
    }
}
