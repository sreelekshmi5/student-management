const API = "/api/students";

let editingId = null;


/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", function () {

    loadStudents();

    document
        .getElementById("studentForm")
        .addEventListener("submit", saveStudent);


    document
        .getElementById("cancelButton")
        .addEventListener("click", cancelEdit);


    document
        .getElementById("searchInput")
        .addEventListener("input", loadStudents);


    document
        .getElementById("filterDepartment")
        .addEventListener("change", loadStudents);


    document
        .getElementById("filterYear")
        .addEventListener("change", loadStudents);


    document
        .getElementById("filterSemester")
        .addEventListener("change", loadStudents);

});


/* =========================
   GET STUDENTS
========================= */

async function loadStudents() {

    try {

        const search =
            document.getElementById("searchInput").value.trim();


        const department =
            document.getElementById("filterDepartment").value;


        const year =
            document.getElementById("filterYear").value;


        const semester =
            document.getElementById("filterSemester").value;


        let url = API;


        /*
         Search has priority.
        */

        if (search !== "") {

            url =
                `${API}/search?keyword=${encodeURIComponent(search)}`;

        } else {

            const params = new URLSearchParams();


            if (department !== "") {
                params.append("department", department);
            }


            if (year !== "") {
                params.append("year", year);
            }


            if (semester !== "") {
                params.append("semester", semester);
            }


            if (params.toString() !== "") {

                url = `${API}?${params.toString()}`;

            }

        }


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error("Unable to load students");

        }


        const students =
            await response.json();


        displayStudents(students);

        updateStatistics(students);

    }

    catch (error) {

        showToast(
            "Unable to connect to the server"
        );

    }

}


/* =========================
   DISPLAY STUDENTS
========================= */

function displayStudents(students) {

    const tableBody =
        document.getElementById("studentTableBody");


    const emptyState =
        document.getElementById("emptyState");


    const recordCount =
        document.getElementById("recordCount");


    tableBody.innerHTML = "";


    recordCount.textContent =
        `${students.length} Record${students.length !== 1 ? "s" : ""}`;


    if (students.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    students.forEach(student => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${student.id}
            </td>

            <td>
                <strong>${student.registerNo}</strong>
            </td>

            <td>
                ${student.name}
            </td>

            <td>
                ${student.email}
            </td>

            <td>
                ${student.phone}
            </td>

            <td>
                <span class="department-badge">
                    ${student.department}
                </span>
            </td>

            <td>
                Year ${student.year}
            </td>

            <td>
                Sem ${student.semester}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editStudent(${student.id})">

                    ✏️ Edit

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteStudent(${student.id})">

                    🗑️ Delete

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =========================
   ADD / UPDATE
========================= */

async function saveStudent(event) {

    event.preventDefault();


    const student = {

        registerNo:
            document.getElementById("registerNo").value.trim(),

        name:
            document.getElementById("name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        phone:
            document.getElementById("phone").value.trim(),

        department:
        document.getElementById("department").value,

        year:
            Number(
                document.getElementById("year").value
            ),

        semester:
            Number(
                document.getElementById("semester").value
            )

    };


    if (
        !student.registerNo ||
        !student.name ||
        !student.email ||
        !student.phone ||
        !student.department ||
        !student.year ||
        !student.semester
    ) {

        showToast("Please fill all fields");

        return;

    }


    if (!/^[6-9][0-9]{9}$/.test(student.phone)) {

        showToast(
            "Enter a valid 10 digit phone number"
        );

        return;

    }


    try {

        let response;


        if (editingId === null) {

            /*
             ADD
            */

            response =
                await fetch(API, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(student)

                });

        } else {

            /*
             UPDATE
            */

            response =
                await fetch(
                    `${API}/${editingId}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(student)

                    }
                );

        }


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Something went wrong"
            );

            return;

        }


        if (editingId === null) {

            showToast(
                "🎉 Student added successfully!"
            );

        } else {

            showToast(
                "✅ Student updated successfully!"
            );

        }


        resetForm();

        await loadStudents();

    }

    catch (error) {

        showToast(
            "Server connection failed"
        );

    }

}


/* =========================
   EDIT STUDENT
========================= */

async function editStudent(id) {

    try {

        const response =
            await fetch(`${API}/${id}`);


        if (!response.ok) {

            showToast("Student not found");

            return;

        }


        const student =
            await response.json();


        editingId = id;


        document.getElementById("registerNo").value =
            student.registerNo;


        document.getElementById("name").value =
            student.name;


        document.getElementById("email").value =
            student.email;


        document.getElementById("phone").value =
            student.phone;


        document.getElementById("department").value =
            student.department;


        document.getElementById("year").value =
            student.year;


        document.getElementById("semester").value =
            student.semester;


        document.getElementById("formTitle").textContent =
            "✏️ Edit Student";


        document.getElementById("saveButton").textContent =
            "💾 Update Student";


        document
            .getElementById("cancelButton")
            .classList.remove("hidden");


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    }

    catch (error) {

        showToast(
            "Unable to load student"
        );

    }

}


/* =========================
   DELETE STUDENT
========================= */

async function deleteStudent(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to delete student"
            );

            return;

        }


        showToast(
            "🗑️ Student deleted successfully!"
        );


        await loadStudents();

    }

    catch (error) {

        showToast(
            "Server connection failed"
        );

    }

}


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    resetForm();

}


/* =========================
   RESET FORM
========================= */

function resetForm() {

    editingId = null;


    document
        .getElementById("studentForm")
        .reset();


    document.getElementById("formTitle").textContent =
        "✨ Add New Student";


    document.getElementById("saveButton").textContent =
        "➕ Add Student";


    document
        .getElementById("cancelButton")
        .classList.add("hidden");

}


/* =========================
   STATISTICS
========================= */

function updateStatistics(students) {

    document.getElementById("totalStudents").textContent =
        students.length;


    const departments =
        new Set(
            students.map(student =>
                student.department
            )
        );


    document.getElementById("totalDepartments").textContent =
        departments.size;


    document.getElementById("activeRecords").textContent =
        students.length;

}


/* =========================
   TOAST MESSAGE
========================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;


    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);

}