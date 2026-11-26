# Student Records Management System (FSD - Node.js Class Test)

A Node.js application developed strictly using only built-in **`http`** and **`fs`** modules (no Express or external packages). The application allows adding and viewing Student Records stored in a JSON file (`students.json`).

---

## 📋 Requirements & Features

1. **HTTP Server (`http` module):**
   - Built directly using Node's native `http.createServer`.
   - Runs on port **3000**.
   - Displays a welcome message when the server starts and on the web interface.

2. **Student Record Form:**
   - Serves an HTML form when visiting `http://localhost:3000/`.
   - Input fields:
     - **Student Name**
     - **Roll Number**
     - **Course**
     - **Email**
     - **Add Student** button
   - Clean, responsive UI rendered directly via the HTTP module.

3. **Store Student Data (`fs` module):**
   - Receives form data via POST request.
   - Saves records securely in `students.json` using the native `fs` module.
   - **Zero external dependencies** (no Express, body-parser, etc.).

4. **Display Student Records:**
   - Route: `/students` (e.g. `http://localhost:3000/students`).
   - Reads stored records from `students.json` and renders an organized table with all student details.
   - Supports direct JSON view if requested with `Accept: application/json`.

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v14+ recommended)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/rishabhk45/FSD-NODE.git
   cd FSD-NODE
   ```

2. Start the server:
   ```bash
   node server.js
   ```
   *(or `npm start`)*

3. Open your browser and navigate to:
   - **Student Record Form:** [http://localhost:3000/](http://localhost:3000/)
   - **View Student Records:** [http://localhost:3000/students](http://localhost:3000/students)

---

## 📂 Project Structure

```text
├── server.js          # Core HTTP server and routing logic (http & fs)
├── students.json      # File where student records are persisted
├── package.json       # Project metadata and start script
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

---

## 🌐 Routes Overview

| Route | Method | Description |
|---|---|---|
| `/` | `GET` | Renders welcome message and Student Record Form |
| `/add-student` | `POST` | Processes form submission & appends record to `students.json` |
| `/students` | `GET` | Displays all student records in an HTML table (or JSON) |
| `*` | Any | 404 Not Found fallback |
