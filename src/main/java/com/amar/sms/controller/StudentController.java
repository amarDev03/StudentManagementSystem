package com.amar.sms.controller;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.amar.sms.dto.StudentRequestDTO;
import com.amar.sms.dto.StudentResponseDTO;
import com.amar.sms.entity.Student;
import com.amar.sms.mapper.StudentMapper;
import com.amar.sms.service.StudentService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
    	
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<StudentResponseDTO> saveStudent(@Valid @RequestBody StudentRequestDTO studentRequestDTO) {

        Student student = StudentMapper.toEntity(studentRequestDTO);
        Student savedStudent = studentService.saveStudent(student);

        return new ResponseEntity<>(StudentMapper.toResponseDTO(savedStudent), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<StudentResponseDTO>> getAllStudents() {

        List<StudentResponseDTO> response = studentService.getAllStudents()
        .stream()
        .map(StudentMapper::toResponseDTO)
        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<StudentResponseDTO>> getStudentsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<StudentResponseDTO> response = studentService.getStudentsWithPagination(page, size)
        .map(StudentMapper::toResponseDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/page-sort")
    public ResponseEntity<Page<StudentResponseDTO>> getStudentsWithPaginationAndSorting(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {

        Page<StudentResponseDTO> response = studentService
                .getStudentsWithPaginationAndSorting(page, size, sortBy)
                .map(StudentMapper::toResponseDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudentResponseDTO>> searchStudents(@RequestParam String name) {

        List<StudentResponseDTO> response = studentService.searchStudentsByFirstName(name)
                .stream()
                .map(StudentMapper::toResponseDTO)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Long id) {

        Student student = studentService.getStudentById(id);
        
        return ResponseEntity.ok(StudentMapper.toResponseDTO(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequestDTO studentRequestDTO) {

        Student student = StudentMapper.toEntity(studentRequestDTO);
        Student updatedStudent = studentService.updateStudent(id, student);

        return ResponseEntity.ok(StudentMapper.toResponseDTO(updatedStudent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {

        studentService.deleteStudent(id);
        
        return ResponseEntity.ok("Student deleted successfully");
    }
}
