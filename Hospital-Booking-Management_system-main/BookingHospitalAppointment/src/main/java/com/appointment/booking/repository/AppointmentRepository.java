package com.appointment.booking.repository;

import com.appointment.booking.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientName(String patientName);
    List<Appointment> findByDoctorEmail(String doctorEmail);
}
