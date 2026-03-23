const API_URL = "https://collabryx.onrender.com";

// ====== STORE CURRENT USER DATA ======
let currentUser = null;

// ====== INITIALIZE DASHBOARD ======
async function initDashboard() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must login first");
        window.location.href = "login-role.html";
        return;
    }

    await loadUserProfile();
    await fetchIdeas();
    await loadDashboardStats();
}

// ====== LOAD USER PROFILE ======
async function loadUserProfile() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login-role.html";
            return;
        }

        const user = await response.json();
        currentUser = user;

        updateUserProfileUI(user);
        updateRoleBasedFeatures(user.role);

    } catch (error) {
        console.error(error);
    }
}

// ====== UPDATE USER PROFILE UI ======
function updateUserProfileUI(user) {
    document.getElementById("userName").innerText = user.name || "Unknown";
    document.getElementById("userEmail").innerText = user.email || "-";
    document.getElementById("userEnrollment").innerText = user.enrollment || "-";

    const roleBadge = document.getElementById("userRole");
    roleBadge.innerText = user.role;
}

// ====== ROLE FEATURES ======
function updateRoleBasedFeatures(role) {
    const postIdeaSection = document.getElementById("postIdeaSection");

    if (role === "ideaProvider") {
        postIdeaSection.classList.remove("hidden");
    } else {
        postIdeaSection.classList.add("hidden");
    }
}

// ====== REGISTER ======
async function register() {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const enrollment = document.getElementById("registerEnrollment").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const role = document.getElementById("registerRole").value;

    if (!name || !email || !password || !enrollment || !role) {
        alert("Fill all fields");
        return;
    }

    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, enrollment, password, role })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Registered ✅");
        toggleForms();
    } else {
        alert(data.message);
    }
}

// ====== LOGIN (UPDATED FIX) ======
async function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Enter email & password");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {

            // ✅ Save token
            localStorage.setItem("token", data.token);

            // ✅ Fetch user data
            const userResponse = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${data.token}`
                }
            });

            const userData = await userResponse.json();

            // ✅ Save user data
            localStorage.setItem("user", JSON.stringify(userData));

            alert("Login Successful ✅");

            window.location.href = "Dashboardpage.html";

        } else {
            alert(data.message || "Login Failed ❌");
        }

    } catch (error) {
        alert("Server error ❌");
    }
}

// ====== TOGGLE FORMS ======
function toggleForms() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    }
}

// ====== LOGOUT ======
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ✅ IMPORTANT
    window.location.href = "login-role.html";
}

// ====== FETCH IDEAS ======
async function fetchIdeas() {
    const response = await fetch(`${API_URL}/api/ideas`);
    const ideas = await response.json();
    displayIdeas(ideas);
}

// ====== DISPLAY IDEAS ======
function displayIdeas(ideas) {
    const container = document.getElementById("ideasContainer");
    container.innerHTML = "";

    ideas.forEach(idea => {
        const card = document.createElement("div");
        card.className = "idea-card";

        card.innerHTML = `
            <h3>${idea.title}</h3>
            <p>${idea.description}</p>
        `;

        container.appendChild(card);
    });
}

// ====== LOAD DASHBOARD STATISTICS ======
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/stats`);

    const data = await response.json();
    console.log("DATA:", data); // ✅ DEBUG (IMPORTANT)

    document.getElementById("totalIdeas").innerText = data.totalIdeas || 0;
    document.getElementById("totalUsers").innerText = data.totalUsers || 0;
    document.getElementById("totalRequests").innerText = data.totalRequests || 0;

  } catch (err) {
    console.error("Error loading dashboard stats:", err);

    document.getElementById("totalIdeas").innerText = 0;
    document.getElementById("totalUsers").innerText = 0;
    document.getElementById("totalRequests").innerText = 0;
  }
}
/*
async function loadDashboardStats() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById("totalProjects").innerText = data.totalProjects || 0;
      document.getElementById("activeIdeas").innerText = data.activeIdeas || 0;
      document.getElementById("messages").innerText = data.messages || 0;
    } else {
      // Set default values if API endpoint doesn't exist yet
      document.getElementById("totalProjects").innerText = 0;
      document.getElementById("activeIdeas").innerText = 0;
      document.getElementById("messages").innerText = 0;
    }
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
    // Set default values on error
    document.getElementById("totalProjects").innerText = 0;
    document.getElementById("activeIdeas").innerText = 0;
    document.getElementById("messages").innerText = 0;
  }
}
*/
async function loadFaculty() {
  try {
    const container = document.getElementById("facultyContainer");

    // 🔥 IMPORTANT SAFETY CHECK
    if (!container) return;

    const response = await fetch(`${API_URL}/api/dashboard/faculty`);
    const data = await response.json();

    container.innerHTML = "";

    data.forEach(f => {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${f.name}</h3>
        <p>${f.email}</p>
        <hr>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("Faculty error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const path = window.location.pathname;

  // ✅ Dashboard
  if (path.includes("Dashboardpage.html")) {
    loadDashboardStats();
  }

  // ✅ Faculty
  if (path.includes("faculty.html")) {
    loadFaculty();
  }

  // ✅ Explore page
  if (path.includes("explore.html")) {
    fetchIdeas();
  }

  // ✅ Requests page (if you have function)
  if (path.includes("request.html")) {
    loadRequests && loadRequests();
  }

  // ✅ Projects page (if you have function)
  if (path.includes("project.html")) {
    loadProjects && loadProjects();
  }

});
/*
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("faculty.html")) {
    console.log("Faculty page loaded ✅"); // debug
    loadFaculty();
  }
});

// ====== AUTO-REFRESH DASHBOARD STATS ======
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS Loaded ✅");   // debug
  loadDashboardStats();
  setInterval(loadDashboardStats, 5000);
});
*/
