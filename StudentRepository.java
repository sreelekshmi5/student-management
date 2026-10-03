package com.example.students_management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByRegisterNo(String registerNo);

    boolean existsByRegisterNoAndIdNot(String registerNo, Long id);

    List<Student> findByNameContainingIgnoreCaseOrRegisterNoContainingIgnoreCase(
            String name,
            String registerNo
    );

    List<Student> findByDepartmentIgnoreCase(String department);

    List<Student> findByYear(Integer year);

    List<Student> findBySemester(Integer semester);

    List<Student> findByDepartmentIgnoreCaseAndYear(
            String department,
            Integer year
    );

    List<Student> findByDepartmentIgnoreCaseAndSemester(
            String department,
            Integer semester
    );

    List<Student> findByYearAndSemester(
            Integer year,
            Integer semester
    );

    List<Student> findByDepartmentIgnoreCaseAndYearAndSemester(
            String department,
            Integer year,
            Integer semester
    );
}