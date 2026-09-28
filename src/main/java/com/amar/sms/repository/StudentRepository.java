package com.amar.sms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.amar.sms.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByFirstNameContainingIgnoreCase(String firstName);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}