const Course = require('../models/Course');
const Feedback = require('../models/Feedback'); // For cascading deletes

// Retrieve all courses. Supports query parameters for filtering (e.g. ?branch=CS&year=2)
const getCourses = async (req, res) => {
  try {
    const filters = {};
    if (req.query.branch) filters.branch = req.query.branch;
    if (req.query.year) filters.year = req.query.year;
    if (req.query.semester) filters.semester = req.query.semester;
    
    // Faculty dashboard might want to see ONLY their courses
    if (req.query.faculty) filters.faculty = req.query.faculty;

    const courses = await Course.find(filters).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Insert a new course to the database
const createCourse = async (req, res) => {
  try {
    const { name, faculty, branch, year, semester } = req.body;
    
    // Construct and save the new course
    const newCourse = await Course.create({ 
      name, 
      faculty, 
      branch, 
      year, 
      semester 
    });
    
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin uses this to remove courses and cleanup associated feedback
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    
    if (!deletedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Cascading deletion
    await Feedback.deleteMany({ course: courseId });

    res.status(200).json({ message: 'Course and its feedback removed successfully', deletedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCourses, createCourse, deleteCourse };
