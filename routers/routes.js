//import { Router } from "express";
const express = require("express"); //  Remove "import { Router } from 'express'"
const router = express.Router();
const Course = require("../models/course");
const Student = require("../models/student");
const course = require("../models/course");

//const router = Router();

/* --- COURSES ROUTES --- */
// Create Course
router.post("/courses", async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//<<---------when course name is updated it change all the student course name-------------->>
// Update Course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name: newName, branch, HOD } = req.body;
    
    // First find the course to get the old name
    const oldCourse = await Course.findById(id);
    if (!oldCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { name: newName, branch, HOD },
      { new: true }
    );

    // Update all students who have this course
    const updateResult = await Student.updateMany(
      //Finds all student documents where courseName matches the old course name
      { courseName: oldCourse.name },
      //$set is a MongoDB update operator that replaces the value of a field with a specified value.
      //  It's commonly used to update specific fields in a document without affecting other fields.
      { $set: { courseName: newName } }
    );

    console.log(`Updated ${updateResult.modifiedCount} students`);

    res.json({
      course: updatedCourse,
      studentsUpdated: updateResult.modifiedCount
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: error.message });
  }
};

router.put("/courses/:id", updateCourse);
//<-------------------------------------------->>
// Delete Course
router.delete("/courses/:id", async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
/* --- STUDENTS ROUTES --- */
// Create Student
router.post("/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Student
router.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,//Returns the modified document rather than the original
      runValidators: true,//Ensures schema validations run on update
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Student
router.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;