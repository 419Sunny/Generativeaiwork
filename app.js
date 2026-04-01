const express = require('express');
const path = require('path');
const courseController = require('./controllers/courseController');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Routes for CRUD operations on courses
// POST /api/courses - Add a new course
app.post('/api/courses', courseController.createCourse);

// GET /api/courses - Get all courses
app.get('/api/courses', courseController.getAllCourses);

// GET /api/courses/:id - Get a specific course by ID
app.get('/api/courses/:id', courseController.getCourseById);

// PUT /api/courses/:id - Update a course by ID
app.put('/api/courses/:id', courseController.updateCourse);

// DELETE /api/courses/:id - Delete a course by ID
app.delete('/api/courses/:id', courseController.deleteCourse);

// Start the server
app.listen(PORT, () => {
    console.log('- CodeCraftHub API is starting...');
    console.log(`- Data will be stored in: ${path.join(__dirname, 'data', 'courses.json')}`);
    console.log('- API is available at: http://localhost:5000');
});