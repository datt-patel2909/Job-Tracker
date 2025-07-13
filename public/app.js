document.addEventListener("DOMContentLoaded", () => {
  const loginView = document.getElementById("login-view");
  const registerView = document.getElementById("register-view");
  const dashboardView = document.getElementById("dashboard-view");

  const toRegister = document.getElementById("to-register");
  const toLogin = document.getElementById("to-login");
  const logoutBtn = document.getElementById("logoutBtn");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const jobForm = document.getElementById("jobForm");
  const jobsList = document.getElementById("jobsList");

  const positionInput = document.getElementById("position");
  const companyInput = document.getElementById("company");
  const statusSelect = document.getElementById("status");

  let editingJobId = null;

  function show(view) {
    [loginView, registerView, dashboardView].forEach(v => v.classList.add("hidden"));
    view.classList.remove("hidden");
  }

  function getToken() {
    return localStorage.getItem("token");
  }

  function setToken(token) {
    localStorage.setItem("token", token);
  }

  function clearToken() {
    localStorage.removeItem("token");
  }

  async function fetchJobs() {
    try {
      const res = await fetch("/api/v1/jobs", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.job)) {
        renderJobs(data.job);
      } else {
        console.warn("No jobs found or data.job is not an array:", data);
        jobsList.innerHTML = "<li>No jobs found.</li>";
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  }

  const renderJobs = (jobs) => {
    jobsList.innerHTML = "";
    jobs.forEach(({ position, company, status, _id }) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${position}</strong> at ${company}
        <span class="job-status">Status: ${status}</span>
        <div class="actions">
          <button class="edit" data-id="${_id}">Edit</button>
          <button class="delete" data-id="${_id}">Delete</button>
        </div>
      `;
      jobsList.appendChild(li);
    });
  };

  jobsList.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("delete")) {
      await fetch(`/api/v1/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchJobs();
    }

    if (e.target.classList.contains("edit")) {
      const res = await fetch(`/api/v1/jobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        positionInput.value = data.job.position;
        companyInput.value = data.job.company;
        statusSelect.value = data.job.status;
        editingJobId = id;
      }
    }
  });

  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const job = {
      position: positionInput.value,
      company: companyInput.value,
      status: statusSelect.value
    };

    const url = editingJobId ? `/api/v1/jobs/${editingJobId}` : "/api/v1/jobs";
    const method = editingJobId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(job),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.msg);

    jobForm.reset();
    editingJobId = null;
    fetchJobs();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      show(dashboardView);
      fetchJobs();
    } else {
      alert(data.msg);
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Registered! Please login.");
      show(loginView);
    } else {
      alert(data.msg);
    }
  });

  toRegister.addEventListener("click", (e) => {
    e.preventDefault();
    show(registerView);
  });

  toLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    show(loginView);
  });

  logoutBtn.addEventListener("click", () => {
    clearToken();
    show(loginView);
  });

  if (getToken()) {
    show(dashboardView);
    fetchJobs();
  } else {
    show(loginView);
  }
});
