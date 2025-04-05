// app.js - Main Application File
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'newuser',
  password: 'newuser_password',
  database: 'attendance_system'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});

// --------------- Routes ---------------

// USERS (ADMIN & TEACHERS) API
// Get all users
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, name, email, role FROM users';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get user by id
app.get('/api/users/:id', (req, res) => {
  const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Create new user (admin or teacher)
app.post('/api/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, password, role], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, name, email, role });
  });
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const { name, email, password, role } = req.body;
  const userId = req.params.id;
  
  let query = 'UPDATE users SET ';
  const values = [];
  
  if (name) {
    query += 'name = ?, ';
    values.push(name);
  }
  if (email) {
    query += 'email = ?, ';
    values.push(email);
  }
  if (password) {
    query += 'password = ?, ';
    values.push(password);
  }
  if (role) {
    query += 'role = ?, ';
    values.push(role);
  }
  
  // Remove trailing comma and space
  query = query.slice(0, -2);
  query += ' WHERE id = ?';
  values.push(userId);
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Login user
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  const query = 'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json(results[0]);
  });
});

// STUDENTS API
// Get all students
app.get('/api/students', (req, res) => {
  const query = 'SELECT * FROM students';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get student by id
app.get('/api/students/:id', (req, res) => {
  const query = 'SELECT * FROM students WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(results[0]);
  });
});

// Create new student
app.post('/api/students', (req, res) => {
  const { name, grade, class: studentClass } = req.body;
  if (!name || !grade || !studentClass) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const query = 'INSERT INTO students (name, grade, class) VALUES (?, ?, ?)';
  db.query(query, [name, grade, studentClass], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, name, grade, class: studentClass });
  });
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const { name, grade, class: studentClass } = req.body;
  const studentId = req.params.id;
  
  let query = 'UPDATE students SET ';
  const values = [];
  
  if (name) {
    query += 'name = ?, ';
    values.push(name);
  }
  if (grade) {
    query += 'grade = ?, ';
    values.push(grade);
  }
  if (studentClass) {
    query += 'class = ?, ';
    values.push(studentClass);
  }
  
  // Remove trailing comma and space
  query = query.slice(0, -2);
  query += ' WHERE id = ?';
  values.push(studentId);
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully' });
  });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const query = 'DELETE FROM students WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// SUBJECTS API
// Get all subjects
app.get('/api/subjects', (req, res) => {
  const query = 'SELECT * FROM subjects';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get subject by id
app.get('/api/subjects/:id', (req, res) => {
  const query = 'SELECT * FROM subjects WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(results[0]);
  });
});

// Create new subject
app.post('/api/subjects', (req, res) => {
  const { name, is_basket } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Subject name is required' });
  }
  
  const query = 'INSERT INTO subjects (name, is_basket) VALUES (?, ?)';
  db.query(query, [name, is_basket || false], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, name, is_basket: is_basket || false });
  });
});

// Update subject
app.put('/api/subjects/:id', (req, res) => {
  const { name, is_basket } = req.body;
  const subjectId = req.params.id;
  
  let query = 'UPDATE subjects SET ';
  const values = [];
  
  if (name) {
    query += 'name = ?, ';
    values.push(name);
  }
  if (is_basket !== undefined) {
    query += 'is_basket = ?, ';
    values.push(is_basket);
  }
  
  // Remove trailing comma and space
  query = query.slice(0, -2);
  query += ' WHERE id = ?';
  values.push(subjectId);
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject updated successfully' });
  });
});

// Delete subject
app.delete('/api/subjects/:id', (req, res) => {
  const query = 'DELETE FROM subjects WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  });
});

// TEACHERS API
// Get all teachers with their user info
app.get('/api/teachers', (req, res) => {
  const query = `
    SELECT t.id, t.user_id, u.name, u.email, t.assigned_class, t.assigned_subject, s.name as subject_name 
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN subjects s ON t.assigned_subject = s.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get teacher by id
app.get('/api/teachers/:id', (req, res) => {
  const query = `
    SELECT t.id, t.user_id, u.name, u.email, t.assigned_class, t.assigned_subject, s.name as subject_name 
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN subjects s ON t.assigned_subject = s.id
    WHERE t.id = ?
  `;
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(results[0]);
  });
});

// Get teacher by user_id
app.get('/api/teachers/user/:userId', (req, res) => {
  const query = `
    SELECT t.id, t.user_id, u.name, u.email, t.assigned_class, t.assigned_subject, s.name as subject_name 
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN subjects s ON t.assigned_subject = s.id
    WHERE t.user_id = ?
  `;
  db.query(query, [req.params.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(results[0]);
  });
});

// Create new teacher (after creating user)
app.post('/api/teachers', (req, res) => {
  const { user_id, assigned_class, assigned_subject } = req.body;
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  // First check if the user exists and is a teacher
  db.query('SELECT * FROM users WHERE id = ? AND role = "teacher"', [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No teacher user found with this ID' });
    }
    
    // Insert the teacher
    const query = 'INSERT INTO teachers (user_id, assigned_class, assigned_subject) VALUES (?, ?, ?)';
    db.query(query, [user_id, assigned_class, assigned_subject], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        id: result.insertId, 
        user_id, 
        assigned_class, 
        assigned_subject 
      });
    });
  });
});

// Update teacher
app.put('/api/teachers/:id', (req, res) => {
  const { assigned_class, assigned_subject } = req.body;
  const teacherId = req.params.id;
  
  let query = 'UPDATE teachers SET ';
  const values = [];
  
  if (assigned_class) {
    query += 'assigned_class = ?, ';
    values.push(assigned_class);
  }
  if (assigned_subject !== undefined) {
    query += 'assigned_subject = ?, ';
    values.push(assigned_subject);
  }
  
  // Remove trailing comma and space
  query = query.slice(0, -2);
  query += ' WHERE id = ?';
  values.push(teacherId);
  
  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ message: 'Teacher updated successfully' });
  });
});

// Delete teacher
app.delete('/api/teachers/:id', (req, res) => {
  const query = 'DELETE FROM teachers WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  });
});

// STUDENT SUBJECTS API (Basket subjects assignment)
// Get all subject assignments
app.get('/api/student-subjects', (req, res) => {
  const query = `
    SELECT ss.id, ss.student_id, s.name as student_name, ss.subject_id, sub.name as subject_name
    FROM student_subjects ss
    JOIN students s ON ss.student_id = s.id
    JOIN subjects sub ON ss.subject_id = sub.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get subjects for a specific student
app.get('/api/student-subjects/student/:studentId', (req, res) => {
  const query = `
    SELECT ss.id, ss.subject_id, sub.name as subject_name, sub.is_basket
    FROM student_subjects ss
    JOIN subjects sub ON ss.subject_id = sub.id
    WHERE ss.student_id = ?
  `;
  db.query(query, [req.params.studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Assign subject to student
app.post('/api/student-subjects', (req, res) => {
  const { student_id, subject_id } = req.body;
  if (!student_id || !subject_id) {
    return res.status(400).json({ message: 'Student ID and Subject ID are required' });
  }
  
  // Check if the subject is a basket subject
  db.query('SELECT * FROM subjects WHERE id = ?', [subject_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const subject = results[0];
    if (!subject.is_basket) {
      return res.status(400).json({ message: 'Only basket subjects can be assigned to students' });
    }
    
    // Assign the subject
    const query = 'INSERT INTO student_subjects (student_id, subject_id) VALUES (?, ?)';
    db.query(query, [student_id, subject_id], (err, result) => {
      if (err) {
        // Check for duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'This subject is already assigned to the student' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: result.insertId, student_id, subject_id });
    });
  });
});

// Remove subject assignment
app.delete('/api/student-subjects/:id', (req, res) => {
  const query = 'DELETE FROM student_subjects WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Subject assignment removed successfully' });
  });
});

// ATTENDANCE API
// Get all attendance records
app.get('/api/attendance', (req, res) => {
  const query = `
    SELECT a.id, a.student_id, s.name as student_name, a.subject_id, 
           sub.name as subject_name, a.date, a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN subjects sub ON a.subject_id = sub.id
    ORDER BY a.date DESC, s.name
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get attendance records for a specific subject
app.get('/api/attendance/subject/:subjectId', (req, res) => {
  const query = `
    SELECT a.id, a.student_id, s.name as student_name, a.date, a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE a.subject_id = ?
    ORDER BY a.date DESC, s.name
  `;
  db.query(query, [req.params.subjectId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get attendance records for a specific date and subject
app.get('/api/attendance/subject/:subjectId/date/:date', (req, res) => {
  const query = `
    SELECT a.id, a.student_id, s.name as student_name, a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE a.subject_id = ? AND a.date = ?
    ORDER BY s.name
  `;
  db.query(query, [req.params.subjectId, req.params.date], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Record attendance
app.post('/api/attendance', (req, res) => {
  const { student_id, subject_id, date, status } = req.body;
  if (!student_id || !subject_id || !date || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if a record already exists for this student, subject, and date
  const checkQuery = 'SELECT * FROM attendance WHERE student_id = ? AND subject_id = ? AND date = ?';
  db.query(checkQuery, [student_id, subject_id, date], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length > 0) {
      // Update existing record
      const updateQuery = 'UPDATE attendance SET status = ? WHERE id = ?';
      db.query(updateQuery, [status, results[0].id], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Attendance updated successfully', id: results[0].id });
      });
    } else {
      // Create new record
      const insertQuery = 'INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [student_id, subject_id, date, status], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          message: 'Attendance recorded successfully',
          id: result.insertId, 
          student_id, 
          subject_id, 
          date, 
          status 
        });
      });
    }
  });
});

// Update attendance record
app.put('/api/attendance/:id', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const query = 'UPDATE attendance SET status = ? WHERE id = ?';
  db.query(query, [status, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance updated successfully' });
  });
});

// Delete attendance record
app.delete('/api/attendance/:id', (req, res) => {
  const query = 'DELETE FROM attendance WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  });
});

// Get students in a class who take a specific subject
app.get('/api/class-subject-students/:className/:subjectId', (req, res) => {
  const { className, subjectId } = req.params;
  
  // For basket subjects, we need to check student_subjects
  db.query('SELECT is_basket FROM subjects WHERE id = ?', [subjectId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    const isBasket = results[0].is_basket;
    
    let query;
    if (isBasket) {
      // For basket subjects, get students who are enrolled in this subject
      query = `
        SELECT s.id, s.name, s.grade, s.class 
        FROM students s
        JOIN student_subjects ss ON s.id = ss.student_id
        WHERE s.class = ? AND ss.subject_id = ?
        ORDER BY s.name
      `;
    } else {
      // For core subjects, just get all students in the class
      query = `
        SELECT id, name, grade, class 
        FROM students 
        WHERE class = ?
        ORDER BY name
      `;
      
      return db.query(query, [className], (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(results);
      });
    }
    
    db.query(query, [className, subjectId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3570;
app.listen(3570, '0.0.0.0', () => {
    console.log('Server is running on port 3570');
});


module.exports = app;