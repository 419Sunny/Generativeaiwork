const fs = require('fs').promises;
const path = require('path');

// Path to the courses.json file
const dataPath = path.join(__dirname, '../data/courses.json');

// Helper function to read data from courses.json
// If the file doesn't exist, it creates it with initial structure
async function readData() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File doesn't exist, create it with initial data
            const initialData = { courses: [], nextId: 1 };
            await fs.writeFile(dataPath, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        throw err;
    }
}

// Helper function to write data to courses.json
async function writeData(data) {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const data = await readData();
        res.json(data.courses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read courses' });
    }
};

// Get a specific course by ID
exports.getCourseById = async (req, res) => {
    try {
        const data = await readData();
        const course = data.courses.find(c => c.id === parseInt(req.params.id));
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read courses' });
    }
};

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const { name, description, target_date, status } = req.body;

        // Check for required fields
        if (!name || !description || !target_date || !status) {
            return res.status(400).json({ error: 'Missing required fields: name, description, target_date, status' });
        }

        // Validate status
        const validStatuses = ['Not Started', 'In Progress', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: Not Started, In Progress, or Completed' });
        }

        // Validate target_date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(target_date)) {
            return res.status(400).json({ error: 'Invalid target_date format. Use YYYY-MM-DD' });
        }

        const data = await readData();

        // Create new course with auto-generated id and created_at
        const newCourse = {
            id: data.nextId,
            name,
            description,
            target_date,
            status,
            created_at: new Date().toISOString()
        };

        // Add to courses array and increment nextId
        data.courses.push(newCourse);
        data.nextId++;

        // Save to file
        await writeData(data);

        res.status(201).json(newCourse);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create course' });
    }
};

// Update an existing course
exports.updateCourse = async (req, res) => {
    try {
        const { name, description, target_date, status } = req.body;

        // Validate status if provided
        if (status && !['Not Started', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: Not Started, In Progress, or Completed' });
        }

        // Validate target_date format if provided
        if (target_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(target_date)) {
                return res.status(400).json({ error: 'Invalid target_date format. Use YYYY-MM-DD' });
            }
        }

        const data = await readData();

        // Find the course by ID
        const courseIndex = data.courses.findIndex(c => c.id === parseInt(req.params.id));
        if (courseIndex === -1) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Update only provided fields
        if (name) data.courses[courseIndex].name = name;
        if (description) data.courses[courseIndex].description = description;
        if (target_date) data.courses[courseIndex].target_date = target_date;
        if (status) data.courses[courseIndex].status = status;

        // Save to file
        await writeData(data);

        res.json(data.courses[courseIndex]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update course' });
    }
};

// Delete a course by ID
exports.deleteCourse = async (req, res) => {
    try {
        const data = await readData();

        // Find the course by ID
        const courseIndex = data.courses.findIndex(c => c.id === parseInt(req.params.id));
        if (courseIndex === -1) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Remove the course from the array
        data.courses.splice(courseIndex, 1);

        // Save to file
        await writeData(data);

        res.status(204).send(); // No content
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course' });
    }
};
