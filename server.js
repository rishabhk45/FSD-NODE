const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Helper to ensure students.json exists
function getStudents(callback) {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            const students = JSON.parse(data || '[]');
            callback(null, students);
        } catch (parseErr) {
            callback(null, []);
        }
    });
}

// Helper to save students into students.json
function saveStudents(students, callback) {
    fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), 'utf8', callback);
}

// Create HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Route 1: GET / -> Form to add student
    if ((pathname === '/' || pathname === '/index.html') && method === 'GET') {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Management System</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #f0f2f5; color: #333; padding: 30px 15px; }
        .container { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px; }
        .welcome-badge { background: #e3f2fd; color: #0d47a1; padding: 12px 16px; border-radius: 8px; font-weight: 500; text-align: center; margin-bottom: 24px; border: 1px solid #bbdefb; }
        h1 { font-size: 24px; margin-bottom: 8px; color: #1a237e; text-align: center; }
        p.subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #444; }
        input[type="text"], input[type="email"] { width: 100%; padding: 10px 14px; border: 1.5px solid #ccc; border-radius: 6px; font-size: 15px; transition: border-color 0.2s; }
        input[type="text"]:focus, input[type="email"]:focus { outline: none; border-color: #1976d2; }
        .btn-submit { width: 100%; background-color: #1976d2; color: #fff; padding: 12px; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; margin-top: 10px; }
        .btn-submit:hover { background-color: #1565c0; }
        .nav-links { margin-top: 24px; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
        .nav-links a { color: #1976d2; text-decoration: none; font-weight: 600; font-size: 14px; }
        .nav-links a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="welcome-badge">
            👋 Welcome to the Student Management System
        </div>
        <h1>Student Record Form</h1>
        <p class="subtitle">Fill in student details to store in system</p>
        
        <form action="/add-student" method="POST">
            <div class="form-group">
                <label for="name">Student Name</label>
                <input type="text" id="name" name="name" placeholder="Enter student name" required>
            </div>
            
            <div class="form-group">
                <label for="rollNo">Roll Number</label>
                <input type="text" id="rollNo" name="rollNo" placeholder="Enter roll number" required>
            </div>
            
            <div class="form-group">
                <label for="course">Course</label>
                <input type="text" id="course" name="course" placeholder="e.g. B.Tech CSE, MCA" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="student@example.com" required>
            </div>
            
            <button type="submit" class="btn-submit">Add Student</button>
        </form>

        <div class="nav-links">
            <a href="/students">📋 View All Student Records (/students)</a>
        </div>
    </div>
</body>
</html>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    // Route 2: POST /add-student (or POST /students) -> Save to students.json
    if ((pathname === '/add-student' || pathname === '/students') && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const params = new URLSearchParams(body);
            const student = {
                name: (params.get('name') || '').trim(),
                rollNo: (params.get('rollNo') || '').trim(),
                course: (params.get('course') || '').trim(),
                email: (params.get('email') || '').trim(),
                createdAt: new Date().toISOString()
            };

            if (!student.name || !student.rollNo) {
                res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end('<h3>Error: Name and Roll Number are required.</h3><a href="/">Go Back</a>');
            }

            getStudents((err, students) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Internal Server Error reading data file');
                }

                students.push(student);

                saveStudents(students, saveErr => {
                    if (saveErr) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Internal Server Error saving student record');
                    }

                    // Redirect to /students to display records
                    res.writeHead(302, { 'Location': '/students' });
                    res.end();
                });
            });
        });
        return;
    }

    // Route 3: GET /students -> Display all student records
    if (pathname === '/students' && method === 'GET') {
        getStudents((err, students) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Internal Server Error');
            }

            // Check if client expects JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(students, null, 2));
            }

            // Build HTML table
            let rowsHtml = '';
            if (students.length === 0) {
                rowsHtml = `<tr><td colspan="5" class="empty-msg">No student records found. Add some records using the form!</td></tr>`;
            } else {
                rowsHtml = students.map((s, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${escapeHtml(s.name)}</strong></td>
                        <td>${escapeHtml(s.rollNo)}</td>
                        <td>${escapeHtml(s.course)}</td>
                        <td>${escapeHtml(s.email)}</td>
                    </tr>
                `).join('');
            }

            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Records - Student Management System</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: #f0f2f5; color: #333; padding: 30px 15px; }
        .container { max-width: 850px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 15px; }
        h1 { font-size: 24px; color: #1a237e; }
        .badge { background: #e8eaf6; color: #3f51b5; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .btn-add { background-color: #2e7d32; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background-color 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .btn-add:hover { background-color: #1b5e20; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
        th { background-color: #f8f9fa; color: #555; font-weight: 600; }
        tr:hover { background-color: #fcfcfc; }
        .empty-msg { text-align: center; padding: 30px; color: #888; font-style: italic; }
        .footer-nav { margin-top: 24px; text-align: center; }
        .footer-nav a { color: #1976d2; text-decoration: none; font-weight: 600; }
        .footer-nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>Student Records</h1>
                <span class="badge">${students.length} Total Registered</span>
            </div>
            <a href="/" class="btn-add">➕ Add New Student</a>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Course</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <div class="footer-nav">
            <a href="/">← Back to Add Student Form</a>
        </div>
    </div>
</body>
</html>`;
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
        return;
    }

    // 404 Route
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h2>404 Not Found</h2><p>The requested route does not exist.</p><a href="/">Go to Home</a>`);
});

// Helper function to escape HTML special characters for XSS prevention
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Start server
server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Welcome to Student Management System`);
    console.log(`📡 Server is running and listening on port ${PORT}`);
    console.log(`🌐 Open in browser: http://localhost:${PORT}`);
    console.log(`===============================================`);
});
