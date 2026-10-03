package com.example.students_management;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // GET ALL STUDENTS + FILTER
    @GetMapping
    public List<Student> getStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester) {

        if (department != null && year != null && semester != null) {
            return studentRepository
                    .findByDepartmentIgnoreCaseAndYearAndSemester(
                            department, year, semester);
        }

        if (department != null && year != null) {
            return studentRepository
                    .findByDepartmentIgnoreCaseAndYear(
                            department, year);
        }

        if (department != null && semester != null) {
            return studentRepository
                    .findByDepartmentIgnoreCaseAndSemester(
                            department, semester);
        }

        if (year != null && semester != null) {
            return studentRepository
                    .findByYearAndSemester(year, semester);
        }

        if (department != null) {
            return studentRepository
                    .findByDepartmentIgnoreCase(department);
        }

        if (year != null) {
            return studentRepository.findByYear(year);
        }

        if (semester != null) {
            return studentRepository.findBySemester(semester);
        }

        return studentRepository.findAll();
    }

    // GET STUDENT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {

        if (studentRepository.existsById(id)) {

            Student student = studentRepository.findById(id).get();

            return ResponseEntity.ok(student);
        }

        Map<String, Object> error = new HashMap<>();

        error.put("status", 404);
        error.put("message", "Student not found");

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }

    // SEARCH STUDENT
    @GetMapping("/search")
    public List<Student> searchStudents(
            @RequestParam String keyword) {

        return studentRepository
                .findByNameContainingIgnoreCaseOrRegisterNoContainingIgnoreCase(
                        keyword,
                        keyword);
    }

    // ADD STUDENT
    @PostMapping
    public ResponseEntity<?> addStudent(
            @Valid @RequestBody Student student) {

        if (studentRepository.existsByRegisterNo(
                student.getRegisterNo())) {

            Map<String, Object> error = new HashMap<>();

            error.put("status", 409);
            error.put("message", "Register number already exists");

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(error);
        }

        Student savedStudent =
                studentRepository.save(student);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedStudent);
    }

    // UPDATE STUDENT
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student student) {

        if (!studentRepository.existsById(id)) {

            Map<String, Object> error = new HashMap<>();

            error.put("status", 404);
            error.put("message", "Student not found");

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(error);
        }

        if (studentRepository.existsByRegisterNoAndIdNot(
                student.getRegisterNo(), id)) {

            Map<String, Object> error = new HashMap<>();

            error.put("status", 409);
            error.put("message", "Register number already exists");

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(error);
        }

        student.setId(id);

        Student updatedStudent =
                studentRepository.save(student);

        return ResponseEntity.ok(updatedStudent);
    }

    // DELETE STUDENT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long id) {

        if (!studentRepository.existsById(id)) {

            Map<String, Object> error = new HashMap<>();

            error.put("status", 404);
            error.put("message", "Student not found");

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(error);
        }

        studentRepository.deleteById(id);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Student deleted successfully");

        return ResponseEntity.ok(response);
    }
}