package com.amar.sms.service.impl;

import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.amar.sms.entity.Student;
import com.amar.sms.exception.DuplicateEmailException;
import com.amar.sms.exception.ResourceNotFoundException;
import com.amar.sms.repository.StudentRepository;
import com.amar.sms.service.StudentService;

@Service
public class StudentServiceImpl implements StudentService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "firstName", "lastName", "email", "phone", "course", "gender", "address");
    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
    	
        this.studentRepository = studentRepository;
    }

    @Override
    public Student saveStudent(Student student) {

        normalize(student);

        if (studentRepository.existsByEmail(student.getEmail())) {
        	
            throw new DuplicateEmailException("Student with email already exists: " + student.getEmail());
        }

        return studentRepository.save(student);
    }

    @Override
    public List<Student> getAllStudents() {
    	
        return studentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @Override
    public Page<Student> getStudentsWithPagination(int page, int size) {
    	
        validatePage(page, size);
        Pageable pageable = PageRequest.of(page, size);
        
        return studentRepository.findAll(pageable);
    }

    @Override
    public Page<Student> getStudentsWithPaginationAndSorting(int page, int size, String sortBy) {
    	
        validatePage(page, size);
        String field = sortBy == null ? "id" : sortBy.trim();
        
        if (!ALLOWED_SORT_FIELDS.contains(field)) {
        	
            throw new IllegalArgumentException("Invalid sort field: " + field);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, field));
        
        return studentRepository.findAll(pageable);
    }

    @Override
    public List<Student> searchStudentsByFirstName(String name) {
    	
        String search = name == null ? "" : name.trim();
        if (search.isEmpty()) {
        	
            return getAllStudents();
        }
        
        return studentRepository.findByFirstNameContainingIgnoreCase(search);
    }

    @Override
    public Student getStudentById(Long id) {
    	
        validateId(id);
        
        return studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Override
    public Student updateStudent(Long id, Student student) {
    	
        validateId(id);
        normalize(student);

        Student existingStudent = studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (studentRepository.existsByEmailAndIdNot(student.getEmail(), id)) {
        	
            throw new DuplicateEmailException("Student with email already exists: " + student.getEmail());
        }

        existingStudent.setFirstName(student.getFirstName());
        existingStudent.setLastName(student.getLastName());
        existingStudent.setEmail(student.getEmail());
        existingStudent.setPhone(student.getPhone());
        existingStudent.setCourse(student.getCourse());
        existingStudent.setGender(student.getGender());
        existingStudent.setAddress(student.getAddress());

        return studentRepository.save(existingStudent);
    }

    @Override
    public void deleteStudent(Long id) {
    	
        validateId(id);

        if (!studentRepository.existsById(id)) {
        	
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }

        studentRepository.deleteById(id);
    }

    private void validatePage(int page, int size) {
        if (page < 0) {
        	
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
        	
            throw new IllegalArgumentException("Page size must be between 1 and " + MAX_PAGE_SIZE);
        }
    }

    private void validateId(Long id) {
    	
        if (id == null || id < 1) {
        	
            throw new IllegalArgumentException("Student ID must be a positive number");
        }
    }

    private void normalize(Student student) {
    	
        student.setFirstName(student.getFirstName().trim());
        student.setLastName(student.getLastName().trim());
        student.setEmail(student.getEmail().trim().toLowerCase());
        student.setPhone(student.getPhone().trim());
        student.setCourse(student.getCourse().trim());
        student.setGender(student.getGender().trim());
        student.setAddress(student.getAddress().trim());
    }
}