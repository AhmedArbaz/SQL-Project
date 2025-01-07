// Import required packages
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create MySQL connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'universitydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test database connection
(async () => {
    try {
        await db.getConnection();
        console.log('Connected to database');
    } catch (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
})();

// Helper function to build dynamic update queries
function buildUpdateQuery(table, data, idField, id) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }
    values.push(id);
    return {
        query: `UPDATE ${table} SET ${fields.join(', ')} WHERE ${idField} = ?`,
        values
    };
}

// CRUD Operations for Classrooms
// Get all classrooms
app.get('/classrooms', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM classrooms');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Add a classroom
app.post('/classrooms', async (req, res) => {
    const { RoomNumber, Building, Capacity, FloorNumber, HasProjector, IsLab, DepartmentID } = req.body;

    if (!RoomNumber || !Building || !Capacity) {
        return res.status(400).json({ error: 'Missing required fields: RoomNumber, Building, Capacity are mandatory.' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO classrooms (RoomNumber, Building, Capacity, FloorNumber, HasProjector, IsLab, DepartmentID) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [RoomNumber, Building, Capacity, FloorNumber || null, HasProjector || 0, IsLab || 0, DepartmentID || null]
        );
        res.status(201).json({ message: 'Classroom added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update a classroom
app.put('/classrooms/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        const { query, values } = buildUpdateQuery('classrooms', updateData, 'ClassroomID', id);
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        res.json({ message: 'Classroom updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Delete a classroom
app.delete('/classrooms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM classrooms WHERE ClassroomID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Classroom not found' });
        }
        res.json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// CRUD Operations for Courses
// Get all courses
app.get('/courses', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM courses');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.post('/courses', async (req, res) => {
    const { CourseName, DepartmentID, Credits } = req.body;

    // Validate input fields
    if (!CourseName || !DepartmentID || !Credits) {
        return res.status(400).json({
            error: 'Missing required fields: CourseName, DepartmentID, and Credits are mandatory.',
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO courses (CourseName, DepartmentID, Credits) 
             VALUES (?, ?, ?)`,
            [CourseName, DepartmentID, Credits]
        );
        res.status(201).json({ message: 'Course added successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update a course
app.put('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        const { query, values } = buildUpdateQuery('courses', updateData, 'CourseID', id);
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Delete a course
app.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM courses WHERE CourseID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// CRUD Operations for Departments
// Get all departments
app.get('/departments', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM departments');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Add a department
app.post('/departments', async (req, res) => {
    const { DepartmentName } = req.body;

    if (!DepartmentName) {
        return res.status(400).json({
            error: 'Missing required fields: DepartmentName is mandatory.',
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO departments (DepartmentName) 
             VALUES (?)`,
            [DepartmentName]
        );
        res.status(201).json({ message: 'Department added successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update a department
app.put('/departments/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        const { query, values } = buildUpdateQuery('departments', updateData, 'DepartmentID', id);
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json({ message: 'Department updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Delete a department
app.delete('/departments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM departments WHERE DepartmentID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


// CRUD Operations for Enrollments
app.get('/enrollments', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM enrollments');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.post('/enrollments', async (req, res) => {
    const { StudentID, CourseID, Grade } = req.body;
    console.log(req.body);

    if (!StudentID || !CourseID || !Grade) {
        return res.status(400).json({ error: 'Missing required fields: StudentID, CourseID and Grade are mandatory.' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO enrollments (StudentID, CourseID, Grade) VALUES (?, ?,?)`,
            [StudentID, CourseID,Grade]
        );
        res.status(201).json({ message: 'Enrollment added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.put('/enrollments/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        const { query, values } = buildUpdateQuery('enrollments', updateData, 'EnrollmentID', id);
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        res.json({ message: 'Enrollment updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.delete('/enrollments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM enrollments WHERE EnrollmentID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json({ message: 'Enrollment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


// CRUD Operations for Students
app.get('/students', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM students');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.post('/students', async (req, res) => {
    const { FirstName, LastName, EnrollmentDate, Major } = req.body;

    if (!FirstName || !LastName || !EnrollmentDate || !Major) {
        return res.status(400).json({ error: 'Missing required fields: FirstName, LastName, EnrollmentDate, and Major are mandatory.' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO students (FirstName, LastName, EnrollmentDate, Major) VALUES (?, ?, ?, ?)`,
            [FirstName, LastName, EnrollmentDate, Major]
        );
        res.status(201).json({ message: 'Student added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        const { query, values } = buildUpdateQuery('students', updateData, 'StudentID', id);
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM students WHERE StudentID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// CRUD Operations for Professors
app.get('/professors', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM professors');
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.post('/professors', async (req, res) => {
    const {  FirstName, LastName, HireDate, DepartmentID } = req.body;

    if (!FirstName || !LastName || !HireDate || !DepartmentID) {
        return res.status(400).json({ error: 'Missing required field: FirstName, LastName, HireDate and Department is mandatory.' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO professors (FirstName, LastName, HireDate, DepartmentID) VALUES (?, ?, ?, ?)`,
            [FirstName, LastName, HireDate, DepartmentID || null]
        );
        res.status(201).json({ message: 'Professor added successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.put('/professors/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        const { query, values } = buildUpdateQuery('professors', updateData, 'ProfessorID', id);
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Professor not found' });
        }

        res.json({ message: 'Professor updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.delete('/professors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM professors WHERE ProfessorID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Professor not found' });
        }
        res.json({ message: 'Professor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


// chart API
// API endpoint
app.get('/api/students', async (req, res) => {
    try {
        const query = `
            SELECT d.DepartmentName AS department, COUNT(s.StudentID) AS student_count
            FROM students s
            INNER JOIN enrollments e ON s.StudentID = e.StudentID
            INNER JOIN courses c ON e.CourseID = c.CourseID
            INNER JOIN departments d ON c.DepartmentID = d.DepartmentID
            GROUP BY d.DepartmentName
        `;

        // Execute the corrected query
        const [results] = await db.execute(query);

        res.json(results); // Send the results as a JSON response
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error fetching data', details: err.message });
    }
});

  
// Define Port
const port = 3010;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

