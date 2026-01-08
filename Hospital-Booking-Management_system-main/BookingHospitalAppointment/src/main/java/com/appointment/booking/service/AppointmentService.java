package com.appointment.booking.service;

import com.appointment.booking.model.Appointment;
import com.appointment.booking.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repo;

    public AppointmentService(AppointmentRepository repo) {
        this.repo = repo;
    }

    public Appointment book(Appointment appointment) {
        appointment.setStatus("Scheduled");
        return repo.save(appointment);
    }

    public List<Appointment> byPatient(String name) {
        return repo.findByPatientName(name);
    }

    public List<Appointment> byDoctor(String email) {
        return repo.findByDoctorEmail(email);
    }
}
