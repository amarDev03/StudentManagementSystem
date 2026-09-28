package com.amar.sms.mapper;

import com.amar.sms.dto.StudentRequestDTO;
import com.amar.sms.dto.StudentResponseDTO;
import com.amar.sms.entity.Student;

public class StudentMapper {

    public static Student toEntity(StudentRequestDTO dto) {

        Student student = new Student();

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        student.setCourse(dto.getCourse());
        student.setGender(dto.getGender());
        student.setAddress(dto.getAddress());

        return student;
    }

    public static StudentResponseDTO toResponseDTO(Student student) {

        return new StudentResponseDTO(
        		student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhone(),
                student.getCourse(),
                student.getGender(),
                student.getAddress()
        );
    }
}