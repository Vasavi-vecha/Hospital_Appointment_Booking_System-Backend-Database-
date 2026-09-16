package com.appointment.booking.service;

import com.appointment.booking.exception.BadRequestException;
import com.appointment.booking.exception.ConflictException;
import com.appointment.booking.exception.ForbiddenException;
import com.appointment.booking.exception.ResourceNotFoundException;
import com.appointment.booking.model.Appointment;
import com.appointment.booking.repository.AppointmentRepository;
import com.appointment.booking.repository.DoctorRepository;
import com.appointment.booking.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository repo;
    private final DoctorRepository doctorRepo;
    private final List<String> configuredSlots;

    public AppointmentService(AppointmentRepository repo,
                               DoctorRepository doctorRepo,
                               @Value("${booking.slots}") String slotsConfig) {
        this.repo = repo;
        this.doctorRepo = doctorRepo;
        this.configuredSlots = Arrays.asList(slotsConfig.split(","));
    }

    public Appointment book(Appointment appointment, String patientName) {
        appointment.setPatientName(patientName);

        if (doctorRepo.findByEmail(appointment.getDoctorEmail()).isEmpty()) {
            throw new BadRequestException("Doctor not found");
        }

        LocalDate date;
        try {
            date = LocalDate.parse(appointment.getDate());
        } catch (DateTimeParseException | NullPointerException ex) {
            throw new BadRequestException("Invalid date");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }

        if (!configuredSlots.contains(appointment.getTime())) {
            throw new BadRequestException("Invalid time slot");
        }

        boolean alreadyBooked = repo.existsByDoctorEmailAndDateAndTimeAndStatus(
                appointment.getDoctorEmail(), appointment.getDate(), appointment.getTime(), "Scheduled");

        if (alreadyBooked) {
            throw new ConflictException("This slot is already booked");
        }

        appointment.setStatus("Scheduled");
        return repo.save(appointment);
    }

    public List<String> getFreeSlots(String doctorEmail, String date) {
        List<Appointment> booked = repo.findByDoctorEmailAndDateAndStatus(doctorEmail, date, "Scheduled");

        List<String> bookedTimes = new ArrayList<>();
        for (Appointment appointment : booked) {
            bookedTimes.add(appointment.getTime());
        }

        List<String> freeSlots = new ArrayList<>();
        for (String slot : configuredSlots) {
            if (!bookedTimes.contains(slot)) {
                freeSlots.add(slot);
            }
        }
        return freeSlots;
    }

    public Appointment updateStatus(Long id, String status, CurrentUser currentUser) {
        if (!status.equals("Completed") && !status.equals("Cancelled")) {
            throw new BadRequestException("Status must be Completed or Cancelled");
        }

        Appointment appointment = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (currentUser.getRole().equals("DOCTOR")) {
            if (!appointment.getDoctorEmail().equals(currentUser.getEmail())) {
                throw new ForbiddenException("You can only update your own appointments");
            }
        } else if (currentUser.getRole().equals("PATIENT")) {
            if (!appointment.getPatientName().equals(currentUser.getName())) {
                throw new ForbiddenException("You can only update your own appointments");
            }
            if (!status.equals("Cancelled")) {
                throw new ForbiddenException("Patients may only cancel appointments");
            }
            if (!appointment.getStatus().equals("Scheduled")) {
                throw new ConflictException("Only a scheduled appointment can be cancelled");
            }
        }

        appointment.setStatus(status);
        return repo.save(appointment);
    }

    public List<Appointment> byPatient(String name) {
        return repo.findByPatientName(name);
    }

    public List<Appointment> byDoctor(String email) {
        return repo.findByDoctorEmail(email);
    }
}
