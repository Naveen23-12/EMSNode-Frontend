const BASE_URL = "http://127.0.0.1:8080/api";

// LOGIN
function login() {
    document.getElementById("error").innerText = "";

    fetch(BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim()
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "otp_sent") {
            showOtpPopup();
        } else {
            document.getElementById("error").innerText = data.message;
        }
    })
    .catch(err => {
        console.log("LOGIN FETCH ERROR:", err);
        document.getElementById("error").innerText = "Login failed";
    });
}

// OTP POPUP
function showOtpPopup() {
    document.getElementById("otpModal").style.display = "flex";
}

function hideOtpPopup() {
    document.getElementById("otpModal").style.display = "none";
}

// SIGNUP POPUP
function showSignupPopup() {
    document.getElementById("signupError").innerText = "";
    document.getElementById("signupModal").style.display = "flex";
}

function hideSignupPopup() {
    document.getElementById("signupModal").style.display = "none";
}

// SIGNUP
function registerUser() {
    document.getElementById("signupError").innerText = "";

    fetch(BASE_URL + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email: document.getElementById("signupEmail").value.trim(),
            password: document.getElementById("signupPassword").value.trim()
        })
    })
    .then(async res => {
        const data = await res.json();
        return { ok: res.ok, data };
    })
    .then(({ ok, data }) => {
        if (ok && data.status === "success") {
            alert("Signup successful");
            hideSignupPopup();
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPassword").value = "";
        } else {
            document.getElementById("signupError").innerText = data.message;
        }
    })
    .catch(err => {
        console.log("REGISTER FETCH ERROR:", err);
        document.getElementById("signupError").innerText = "Signup failed";
    });
}

// VERIFY OTP
function verifyOTP() {
    document.getElementById("otpError").innerText = "";

    fetch(BASE_URL + "/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email: document.getElementById("email").value.trim(),
            otp: document.getElementById("otp").value.trim()
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            window.location = "dashboard.html";
        } else {
            document.getElementById("otpError").innerText = data.message;
        }
    })
    .catch(err => {
        console.log("VERIFY OTP FETCH ERROR:", err);
        document.getElementById("otpError").innerText = "OTP verification failed";
    });
}

// LOGOUT
function logout() {
    fetch(BASE_URL + "/logout", {
        method: "POST",
        credentials: "include"
    })
    .then(() => {
        window.location.replace("index.html");
    });
}

let currentPage = 1;

function loadEmployees(page = 1) {
    currentPage = page;

    let keyword = document.getElementById("search")?.value || "";

    fetch(`${BASE_URL}/employees?page=${page}&keyword=${keyword}`, {
        credentials: "include"
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            window.location = "index.html";
            return;
        }
        return res.json();
    })
    .then(data => {
        if (!data) return;

        let rows = "";

        data.employees.forEach(e => {
            rows += `
<tr>
<td>${e._id}</td>
<td>${e.name}</td>
<td>${e.email}</td>
<td>${e.department}</td>
<td>${e.salary}</td>
<td>
    <button class="btn-edit" onclick="editEmp('${e._id}')">Edit</button>
    <button class="btn-glossy" onclick="deleteEmp('${e._id}')">Delete</button>
</td>
</tr>
`;
        });

        document.getElementById("table").innerHTML = rows;
        renderPagination(data.currentPage, data.totalPages);
    });
}

function addEmployee() {
    fetch(BASE_URL + "/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            department: document.getElementById("department").value,
            salary: document.getElementById("salary").value
        })
    })
    .then(res => res.json())
    .then(() => {
        window.location = "dashboard.html";
    });
}

function deleteEmp(id) {
    fetch(BASE_URL + "/employees/" + id, {
        method: "DELETE",
        credentials: "include"
    })
    .then(() => loadEmployees(currentPage));
}

function renderPagination(current, total) {
    let html = "";

    if (current > 1) {
        html += `<button onclick="loadEmployees(${current - 1})">Prev</button>`;
    }

    for (let i = 1; i <= total; i++) {
        html += `
<button class="${i === current ? 'active' : ''}" onclick="loadEmployees(${i})">
    ${i}
</button>
`;
    }

    if (current < total) {
        html += `<button onclick="loadEmployees(${current + 1})">Next</button>`;
    }

    document.getElementById("pagination").innerHTML = html;
}

function editEmp(id) {
    window.location = `edit.html?id=${id}`;
}

function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function loadEmployeeById() {
    let id = getIdFromURL();

    fetch(`${BASE_URL}/employees/${id}`, {
        credentials: "include"
    })
    .then(res => res.json())
    .then(e => {
        document.getElementById("id").value = e._id;
        document.getElementById("name").value = e.name;
        document.getElementById("email").value = e.email;
        document.getElementById("department").value = e.department;
        document.getElementById("salary").value = e.salary;
    });
}

function updateEmployee() {
    let id = document.getElementById("id").value;

    fetch(BASE_URL + "/employees/" + id, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            department: document.getElementById("department").value,
            salary: document.getElementById("salary").value
        })
    })
    .then(() => {
        window.location = "dashboard.html";
    });
}

function checkSession() {
    fetch(`${BASE_URL}/employees?page=1`, {
        credentials: "include"
    })
    .then(res => {
        if (res.status === 401) {
            window.location = "index.html";
        }
    });
}