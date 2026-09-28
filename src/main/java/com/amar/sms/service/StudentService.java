package com.amar.sms.service;

import java.util.List;
import org.springframework.data.domain.Page;
import com.amar.sms.entity.Student;

public interface StudentService {

    Student saveStudent(Student student);

    List<Student> getAllStudents();

    Page<Student> getStudentsWithPagination(int page, int size);

    Page<Student> getStudentsWithPaginationAndSorting(int page, int size, String sortBy);

    List<Student> searchStudentsByFirstName(String name);

    Student getStudentById(Long id);

    Student updateStudent(Long id, Student student);

    void deleteStudent(Long id);
}