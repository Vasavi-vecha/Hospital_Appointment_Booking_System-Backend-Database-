package com.appointment.booking.service;

import com.appointment.booking.model.Report;
import com.appointment.booking.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository repo;

    public ReportService(ReportRepository repo) {
        this.repo = repo;
    }

    public Report save(Report report) {
        return repo.save(report);
    }

    public List<Report> byPatient(String name) {
        return repo.findByPatientName(name);
    }

    public List<Report> byDoctor(String email) {
        return repo.findByDoctorEmail(email);
    }
}
