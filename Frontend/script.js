document.addEventListener('DOMContentLoaded', () => {
    fetchClassrooms();
    fetchCourses();
    fetchDepartments();
    fetchEnrollments();
    fetchStudents();
    fetchProfessors();

    const links = document.querySelectorAll('.navbar a');
    const sections = document.querySelectorAll('section');

    links.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetId = link.dataset.target;

            links.forEach(l => l.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
});

// CRUD Functions for Classrooms
async function fetchClassrooms() {
    try {
        const response = await fetch('http://localhost:3010/classrooms');
        const classrooms = await response.json();

        const tableBody = document.querySelector('#classroomsTable tbody');
        tableBody.innerHTML = '';
        classrooms.forEach(classroom => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${classroom.ClassroomID}</td>
                <td>${classroom.RoomNumber}</td>
                <td>${classroom.Building}</td>
                <td>${classroom.Capacity}</td>
                <td>${classroom.FloorNumber}</td>
                <td>${classroom.HasProjector}</td>
                <td>${classroom.IsLab}</td>
                <td>${classroom.DepartmentID}</td>
                <td>
                    <button onclick="editClassroom(${classroom.ClassroomID})">Edit</button>
                    <button onclick="deleteClassroom(${classroom.ClassroomID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching classrooms:', error);
    }
}

async function addClassroomPrompt() {
    const roomNumber = prompt('Enter Room Number:');
    const building = prompt('Enter Building:');
    const capacity = prompt('Enter Capacity:');
    const FloorNumber = prompt('Enter Floor Number:');
    const HasProjector = prompt('Does it have a projector (true/false)?');
    const IsLab = prompt('Is it a lab (true/false)?');
    const DepartmentID = prompt('Enter Department ID:');

    if (roomNumber && building && capacity) {
        await addClassroom({ RoomNumber: roomNumber, Building: building, Capacity: capacity, FloorNumber: FloorNumber, HasProjector: HasProjector, IsLab: IsLab, DepartmentID: DepartmentID });
        fetchClassrooms();
    }
}

async function addClassroom(classroom) {
    try {
        await fetch('http://localhost:3010/classrooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classroom),
        });
    } catch (error) {
        console.error('Error adding classroom:', error);
    }
}

async function editClassroom(classroomId) {
    const roomNumber = prompt('Enter new Room Number:');
    const building = prompt('Enter new Building:');
    const capacity = prompt('Enter new Capacity:');

    if (roomNumber && building && capacity) {
        await updateClassroom(classroomId, { RoomNumber: roomNumber, Building: building, Capacity: capacity });
        fetchClassrooms();
    }
}

async function updateClassroom(classroomId, updatedData) {
    try {
        await fetch(`http://localhost:3010/classrooms/${classroomId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
    } catch (error) {
        console.error('Error updating classroom:', error);
    }
}

async function deleteClassroom(classroomId) {
    try {
        await fetch(`http://localhost:3010/classrooms/${classroomId}`, {
            method: 'DELETE',
        });
        fetchClassrooms();
    } catch (error) {
        console.error('Error deleting classroom:', error);
    }
}


// CRUD Functions for Courses
async function fetchCourses() {
    try {
        const response = await fetch('http://localhost:3010/courses');
        const courses = await response.json();

        const tableBody = document.querySelector('#coursesTable tbody');
        tableBody.innerHTML = '';
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.CourseID}</td>
                <td>${course.CourseName}</td>
                <td>${course.Credits}</td>
                <td>${course.DepartmentID}</td>
                <td>
                    <button onclick="editCourse(${course.CourseID})">Edit</button>
                    <button onclick="deleteCourse(${course.CourseID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}
async function addCoursePrompt() {
    const courseName = prompt('Enter Course Name:');
    const departmentId = parseInt(prompt('Enter Department ID:'), 10);
    const credits = parseInt(prompt('Enter Credits:'), 10);

    // Validate input
    if (!courseName || isNaN(departmentId) || isNaN(credits)) {
        alert('All fields are required and must be valid.');
        return;
    }

    // Create the course object
    const course = {
        CourseName: courseName,
        DepartmentID: departmentId,
        Credits: credits,
    };

    try {
        const response = await fetch('http://localhost:3010/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
        });

        if (response.ok) {
            alert('Course added successfully!');
            fetchCourses(); // Refresh the courses table
        } else {
            const errorData = await response.json();
            console.error('Error adding course:', errorData);
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error adding course:', error);
        alert('An error occurred while adding the course.');
    }
}

async function editCourse(courseId) {
    const courseName = prompt('Enter new Course Name:');
    const credits = prompt('Enter new Credits:');
    const departmentId = prompt('Enter new Department ID:');

    if (courseName && credits && departmentId) {
        await updateCourse(courseId, { CourseName: courseName, Credits: credits, DepartmentID: departmentId });
        fetchCourses();
    }
}

async function updateCourse(courseId, updatedData) {
    try {
        await fetch(`http://localhost:3010/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
    } catch (error) {
        console.error('Error updating course:', error);
    }
}

async function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            await fetch(`http://localhost:3010/courses/${courseId}`, {
                method: 'DELETE',
            });
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    }
}


// CRUD Functions for Departments
async function fetchDepartments() {
    try {
        const response = await fetch('http://localhost:3010/departments');
        const departments = await response.json();

        const tableBody = document.querySelector('#departmentsTable tbody');
        tableBody.innerHTML = '';
        departments.forEach(department => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${department.DepartmentID}</td>
                <td>${department.DepartmentName}</td>
                <td>
                    <button onclick="editDepartment(${department.DepartmentID})">Edit</button>
                    <button onclick="deleteDepartment(${department.DepartmentID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
    }
}

// Function to add a new department functionality like courses added function
async function addDepartmentPrompt() {
    const departmentName = prompt('Enter Department Name:');

    // Validate input
    if (!departmentName) {
        alert('All fields are required.');
        return;
    }

    const department = {
        DepartmentName: departmentName,        
    };

    await addDepartment(department);
    fetchDepartments(); // Refresh the departments list
}

async function addDepartment(department) {
    try {
        const response = await fetch('http://localhost:3010/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(department),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding department:', errorData);
            alert(`Error: ${errorData.error}`);
        } else {
            alert('Department added successfully!');
        }
    } catch (error) {
        console.error('Error adding department:', error);
        alert('An error occurred while adding the department.');
    }
}

async function editDepartment(departmentId) {
    const departmentName = prompt('Enter new Department Name:');
    if (departmentName) {
        await updateDepartment(departmentId, { DepartmentName: departmentName });
        fetchDepartments();
    }
}

async function updateDepartment(departmentId, updatedData) {
    try {
        await fetch(`http://localhost:3010/departments/${departmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
    } catch (error) {
        console.error('Error updating department:', error);
    }
}

async function deleteDepartment(departmentId) {
    try {
        await fetch(`http://localhost:3010/departments/${departmentId}`, {
            method: 'DELETE',
        });
        fetchDepartments();
    } catch (error) {
        console.error('Error deleting department:', error);
    }
}

// CRUD Functions for Enrollments
async function fetchEnrollments() {
    try {
        const response = await fetch('http://localhost:3010/enrollments');
        const enrollments = await response.json();

        const tableBody = document.querySelector('#enrollmentsTable tbody');
        tableBody.innerHTML = '';
        enrollments.forEach(enrollment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${enrollment.EnrollmentID}</td>
                <td>${enrollment.StudentID}</td>
                <td>${enrollment.CourseID}</td>
                <td>${enrollment.Grade}</td>
                <td>
                    <button onclick="editEnrollment(${enrollment.EnrollmentID})">Edit</button>
                    <button onclick="deleteEnrollment(${enrollment.EnrollmentID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
    }
}

async function addEnrollmentPrompt() {
    const studentId = prompt('Enter Student ID:');
    const courseId = prompt('Enter Course ID:');
    const Grade = prompt('Enter Grade:');
    if (studentId && courseId && Grade) {
        await addEnrollment({ StudentID: studentId, CourseID: courseId, Grade: Grade });
        fetchEnrollments();
    }
}

async function addEnrollment(enrollment) {
    try {
        await fetch('http://localhost:3010/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollment),
        });
    } catch (error) {
        console.error('Error adding enrollment:', error);
    }
}

async function editEnrollment(enrollmentId) {
    const studentId = prompt('Enter new Student ID:');
    const courseId = prompt('Enter new Course ID:');
    const Grade = prompt('Enter Grade:');
    if (studentId && courseId && Grade) {
        await updateEnrollment(enrollmentId, { StudentID: studentId, CourseID: courseId, Grade: Grade });
        fetchEnrollments();
    }
}

async function updateEnrollment(enrollmentId, updatedData) {
    try {
        await fetch(`http://localhost:3010/enrollments/${enrollmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
    } catch (error) {
        console.error('Error updating enrollment:', error);
    }
}

async function deleteEnrollment(enrollmentId) {
    try {
        await fetch(`http://localhost:3010/enrollments/${enrollmentId}`, {
            method: 'DELETE',
        });
        fetchEnrollments();
    } catch (error) {
        console.error('Error deleting enrollment:', error);
    }
}

// CRUD Functions for Students
async function fetchStudents() {
    try {
        const response = await fetch('http://localhost:3010/students');
        const students = await response.json();

        const tableBody = document.querySelector('#studentsTable tbody');
        tableBody.innerHTML = '';
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.StudentID}</td>
                <td>${student.FirstName} </td>
                <td>${student.LastName}</td>
                <td>${student.EnrollmentDate}</td>
                <td>${student.Major}</td>
                <td>
                    <button onclick="editStudent(${student.StudentID})">Edit</button>
                    <button onclick="deleteStudent(${student.StudentID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

async function addStudentPrompt() {
    const FirstName = prompt('Enter Student First Name:');
    const LastName = prompt('Enter Student Last Name:');
    const EnrollmentDate = prompt('Enter Student Enrollment Date (YYYY-MM-DD):');
    const Major = prompt('Enter Major:');

    // Validate inputs
    if (!FirstName || !LastName || !EnrollmentDate || !Major) {
        alert('All fields (First Name, Last Name, Enrollment Date, Major) are required.');
        return;
    }

    // Call addStudent function with collected data
    await addStudent({ FirstName, LastName, EnrollmentDate, Major });
    fetchStudents(); // Refresh the student list
}


async function addStudent(student) {
    try {
        await fetch('http://localhost:3010/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
    } catch (error) {
        console.error('Error adding student:', error);
    }
}

async function editStudent(studentId) {
    const FirstName = prompt('Enter Student First Name:');
    const LastName = prompt('Enter Student Last Name:');
    const EnrollmentDate = prompt('Enter Student Enrollment Date (YYYY-MM-DD):');
    const Major = prompt('Enter Major:');

    // Check if at least one field is provided
    if (!FirstName && !LastName && !EnrollmentDate && !Major) {
        alert('At least one field must be updated.');
        return;
    }

    // Call updateStudent function with collected data
    const updatedData = {};
    if (FirstName) updatedData.FirstName = FirstName;
    if (LastName) updatedData.LastName = LastName;
    if (EnrollmentDate) updatedData.EnrollmentDate = EnrollmentDate;
    if (Major) updatedData.Major = Major;

    await updateStudent(studentId, updatedData);
    fetchStudents(); // Refresh the student list
}


async function updateStudent(studentId, updatedData) {
    try {
        await fetch(`http://localhost:3010/students/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
    } catch (error) {
        console.error('Error updating student:', error);
    }
}

async function deleteStudent(studentId) {
    try {
        await fetch(`http://localhost:3010/students/${studentId}`, {
            method: 'DELETE',
        });
        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}

// CRUD Functions for Professors
async function fetchProfessors() {
    try {
        const response = await fetch('http://localhost:3010/professors');
        const professors = await response.json();

        const tableBody = document.querySelector('#professorsTable tbody');
        tableBody.innerHTML = '';
        professors.forEach(professor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${professor.ProfessorID}</td>
                <td>${professor.FirstName}</td>
                <td>${professor.LastName}</td>
                <td>${professor.HireDate}</td>
                <td>${professor.DepartmentID}</td>
                <td>
                    <button onclick="editProfessor(${professor.ProfessorID})">Edit</button>
                    <button onclick="deleteProfessor(${professor.ProfessorID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching professors:', error);
    }
}

async function addProfessorPrompt() {
    const FirstName = prompt('Enter Professor First Name:');
    const LastName = prompt('Enter Professor Last Name:');
    const HireDate = prompt('Enter Professor Hire Date (YYYY-MM-DD):');
    const DepartmentID = prompt('Enter Department ID:');
    if (FirstName && LastName && HireDate && DepartmentID) {
        await addProfessor({ FirstName: FirstName, LastName: LastName, HireDate: HireDate, DepartmentID: DepartmentID });
        fetchProfessors();
    }
}

async function addProfessor(professor) {
    try {
        await fetch('http://localhost:3010/professors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(professor),
        });
    } catch (error) {
        console.error('Error adding professor:', error);
    }
}

async function editProfessor(professorId) {
    const FirstName = prompt('Enter Professor First Name:');
    const LastName = prompt('Enter Professor Last Name:');
    const HireDate = prompt('Enter Professor Hire Date (YYYY-MM-DD):');
    const DepartmentID = prompt('Enter Department ID:');

    if (FirstName || LastName || HireDate || DepartmentID || name || email) {
        await updateProfessor(professorId, { FirstName: FirstName, LastName: LastName, HireDate: HireDate, DepartmentID: DepartmentID });
        fetchProfessors();
    }
}

async function updateProfessor(professorId, updatedData) {
    try {
        await fetch(`http://localhost:3010/professors/${professorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
    } catch (error) {
        console.error('Error updating professor:', error);
    }
}

async function deleteProfessor(professorId) {
    try {
        await fetch(`http://localhost:3010/professors/${professorId}`, {
            method: 'DELETE',
        });
        fetchProfessors();
    } catch (error) {
        console.error('Error deleting professor:', error);
    }
}
