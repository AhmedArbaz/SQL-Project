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
app.put('/classrooms/:id', async (req, res) => {
    const { id } = req.params;
    const { RoomNumber, Building, Capacity, FloorNumber, HasProjector, IsLab, DepartmentID } = req.body;

    if (!RoomNumber && !Building && !Capacity && !FloorNumber && !HasProjector && !IsLab && !DepartmentID) {
        return res.status(400).json({ error: 'At least one field is required to update.' });
    }

    try {
        console.log('Request ID:', id);
        console.log('Request Body:', req.body);

        const fields = [];
        const values = [];
        if (RoomNumber) { fields.push('RoomNumber = ?'); values.push(RoomNumber); }
        if (Building) { fields.push('Building = ?'); values.push(Building); }
        if (Capacity) { fields.push('Capacity = ?'); values.push(Capacity); }
        if (FloorNumber !== undefined) { fields.push('FloorNumber = ?'); values.push(FloorNumber); }
        if (HasProjector !== undefined) { fields.push('HasProjector = ?'); values.push(HasProjector); }
        if (IsLab !== undefined) { fields.push('IsLab = ?'); values.push(IsLab); }
        if (DepartmentID) { fields.push('DepartmentID = ?'); values.push(DepartmentID); }

        values.push(id);

        console.log('SQL Query:', `UPDATE classrooms SET ${fields.join(', ')} WHERE ClassroomID = ?`);
        console.log('Values:', values);

        const [result] = await db.execute(
            `UPDATE classrooms SET ${fields.join(', ')} WHERE ClassroomID = ?`,
            values
        );

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
app.get('/courses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/courses', (req, res) => {
    const { CourseName, DepartmentID } = req.body;
    db.query('INSERT INTO courses (CourseName, DepartmentID) VALUES (?, ?)', [CourseName, DepartmentID], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Course added successfully', id: results.insertId });
    });
});

app.put('/courses/:id', (req, res) => {
    const { id } = req.params;
    const { CourseName, DepartmentID } = req.body;
    db.query('UPDATE courses SET CourseName = ?, DepartmentID = ? WHERE CourseID = ?', [CourseName, DepartmentID, id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Course updated successfully' });
    });
});

app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM courses WHERE CourseID = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Course deleted successfully' });
    });
});

// CRUD Operations for Departments
app.get('/departments', (req, res) => {
    db.query('SELECT * FROM departments', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/departments', (req, res) => {
    const { DepartmentName } = req.body;
    db.query('INSERT INTO departments (DepartmentName) VALUES (?)', [DepartmentName], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Department added successfully', id: results.insertId });
    });
});

app.put('/departments/:id', (req, res) => {
    const { id } = req.params;
    const { DepartmentName } = req.body;
    db.query('UPDATE departments SET DepartmentName = ? WHERE DepartmentID = ?', [DepartmentName, id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Department updated successfully' });
    });
});

app.delete('/departments/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM departments WHERE DepartmentID = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Department deleted successfully' });
    });
});

// CRUD Operations for Enrollments
app.get('/enrollments', (req, res) => {
    db.query('SELECT * FROM enrollments', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/enrollments', (req, res) => {
    const { StudentID, CourseID } = req.body;
    db.query('INSERT INTO enrollments (StudentID, CourseID) VALUES (?, ?)', [StudentID, CourseID], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Enrollment added successfully', id: results.insertId });
    });
});

app.put('/enrollments/:id', (req, res) => {
    const { id } = req.params;
    const { StudentID, CourseID } = req.body;
    db.query('UPDATE enrollments SET StudentID = ?, CourseID = ? WHERE EnrollmentID = ?', [StudentID, CourseID, id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Enrollment updated successfully' });
    });
});

app.delete('/enrollments/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM enrollments WHERE EnrollmentID = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Enrollment deleted successfully' });
    });
});

// CRUD Operations for Professors
app.get('/professors', (req, res) => {
    db.query('SELECT * FROM professors', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/professors', (req, res) => {
    const { ProfessorName, DepartmentID } = req.body;
    db.query('INSERT INTO professors (ProfessorName, DepartmentID) VALUES (?, ?)', [ProfessorName, DepartmentID], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Professor added successfully', id: results.insertId });
    });
});

app.put('/professors/:id', (req, res) => {
    const { id } = req.params;
    const { ProfessorName, DepartmentID } = req.body;
    db.query('UPDATE professors SET ProfessorName = ?, DepartmentID = ? WHERE ProfessorID = ?', [ProfessorName, DepartmentID, id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Professor updated successfully' });
    });
});

app.delete('/professors/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM professors WHERE ProfessorID = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Professor deleted successfully' });
    });
});

// CRUD Operations for Students
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/students', (req, res) => {
    const { StudentName, DepartmentID } = req.body;
    db.query('INSERT INTO students (StudentName, DepartmentID) VALUES (?, ?)', [StudentName, DepartmentID], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Student added successfully', id: results.insertId });
    });
});

app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { StudentName, DepartmentID } = req.body;
    db.query('UPDATE students SET StudentName = ?, DepartmentID = ? WHERE StudentID = ?', [StudentName, DepartmentID, id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Student updated successfully' });
    });
});

app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM students WHERE StudentID = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Student deleted successfully' });
    });
});

// Define Port
const port = 3010;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
