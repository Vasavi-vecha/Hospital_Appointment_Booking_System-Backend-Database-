package com.appointment.booking.repository;

import com.appointment.booking.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmailAndPassword(String email, String password);
}
