package com.appointment.booking.repository;

import com.appointment.booking.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByPatientName(String patientName);
    List<Report> findByDoctorEmail(String doctorEmail);
}
