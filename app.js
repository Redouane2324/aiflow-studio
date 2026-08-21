const API = "/api";

let token = localStorage.getItem("aiflow_token");
let currentUser = null;
let currentLeads = [];

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return "$" + Number(value || 0).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  );
}

function showMessage(element, message, type = "error") {
  element.innerHTML = `
    <div class="${type}">
      ${escapeHtml(message)}
    </div>
  `;
}

async function api(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API + endpoint, {
    ...options,
    headers
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    logout();
    throw new Error("Your session has expired.");
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Something went wrong."
    );
  }

  return data;
}


/* ---------------- AUTH UI ---------------- */

function showAuth() {
  $("authPage").classList.remove("hidden");
  $("appPage").classList.add("hidden");
}

function showApp() {
  $("authPage").classList.add("hidden");
  $("appPage").classList.remove("hidden");

  if (currentUser) {
    $("userName").textContent = currentUser.name;
    $("profileName").value = currentUser.name;
    $("profileEmail").value = currentUser.email;

    if (currentUser.created_at) {
      $("profileCreated").value =
        new Date(
          currentUser.created_at
        ).toLocaleDateString();
    }
  }
}

$("showRegister").addEventListener("click", () => {
  $("loginBox").classList.add("hidden");
  $("registerBox").classList.remove("hidden");
});

$("showLogin").addEventListener("click", () => {
  $("registerBox").classList.add("hidden");
  $("loginBox").classList.remove("hidden");
});


/* ---------------- REGISTER ---------------- */

$("registerForm").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const message = $("registerMessage");

    try {
      const data = await api(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: $("registerName").value,
            email: $("registerEmail").value,
            password: $("registerPassword").value
          })
        }
      );

      token = data.token;
      currentUser = data.user;

      localStorage.setItem(
        "aiflow_token",
        token
      );

      showApp();
      await loadDashboard();

    } catch (error) {
      showMessage(
        message,
        error.message
      );
    }
  }
);


/* ---------------- LOGIN ---------------- */

$("loginForm").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const message = $("loginMessage");

    try {
      const data = await api(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: $("loginEmail").value,
            password: $("loginPassword").value
          })
        }
      );

      token = data.token;
      currentUser = data.user;

      localStorage.setItem(
        "aiflow_token",
        token
      );

      showApp();
      await loadDashboard();

    } catch (error) {
      showMessage(
        message,
        error.message
      );
    }
  }
);


/* ---------------- LOGOUT ---------------- */

function logout() {
  token = null;
  currentUser = null;
  currentLeads = [];

  localStorage.removeItem(
    "aiflow_token"
  );

  showAuth();

  $("loginForm").reset();
}

$("logoutBtn").addEventListener(
  "click",
  logout
);


/* ---------------- NAVIGATION ---------------- */

const pages = [
  "dashboard",
  "leads",
  "analytics",
  "profile"
];

function showPage(page) {
  pages.forEach((name) => {
    const section = $(name + "Page");

    if (section) {
      section.classList.toggle(
        "hidden",
        name !== page
      );
    }
  });

  document
    .querySelectorAll(".nav-btn")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.page === page
      );
    });

  $("topTitle").textContent =
    page.charAt(0).toUpperCase() +
    page.slice(1);

  if (page === "dashboard") {
    loadDashboard();
  }

  if (page === "leads") {
    loadLeads();
  }

  if (page === "analytics") {
    loadAnalytics();
  }
}

document
  .querySelectorAll(".nav-btn")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        showPage(
          button.dataset.page
        );
      }
    );
  });


/* ---------------- DASHBOARD ---------------- */

async function loadDashboard() {
  try {
    const [dashboard, leads] =
      await Promise.all([
        api("/dashboard"),
        api("/leads")
      ]);

    const stats = dashboard.stats;

    $("statTotal").textContent =
      stats.total || 0;

    $("statNew").textContent =
      stats.new || 0;

    $("statQualified").textContent =
      stats.qualified || 0;

    $("statWon").textContent =
      money(stats.won_value);

    renderRecentLeads(
      leads.leads.slice(0, 5)
    );

  } catch (error) {
    console.error(error);
  }
}

function renderRecentLeads(leads) {
  const container = $("recentLeads");

  if (!leads.length) {
    container.innerHTML = `
      <div class="empty">
        No leads yet. Add your first lead.
      </div>
    `;
    return;
  }

  container.innerHTML = leads.map(
    (lead) => `
      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:15px;
          padding:13px 0;
          border-bottom:1px solid #edf0f4;
        "
      >
        <div>
          <strong>
            ${escapeHtml(lead.name)}
          </strong>

          <div class="muted">
            ${escapeHtml(
              lead.company || lead.email || ""
            )}
          </div>
        </div>

        <div>
          <span class="badge ${escapeHtml(
            lead.status
          )}">
            ${escapeHtml(lead.status)}
          </span>
        </div>
      </div>
    `
  ).join("");
}


/* ---------------- LEADS ---------------- */

async function loadLeads() {
  try {
    const params = new URLSearchParams();

    const search =
      $("searchInput").value.trim();

    const status =
      $("statusFilter").value;

    if (search) {
      params.set("search", search);
    }

    if (status) {
      params.set("status", status);
    }

    const data = await api(
      `/leads?${params.toString()}`
    );

    currentLeads = data.leads;

    renderLeads(currentLeads);

  } catch (error) {
    $("leadsTable").innerHTML = `
      <tr>
        <td colspan="6">
          ${escapeHtml(error.message)}
        </td>
      </tr>
    `;
  }
}

function renderLeads(leads) {
  const table = $("leadsTable");

  if (!leads.length) {
    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="empty"
        >
          No leads found.
        </td>
      </tr>
    `;
    return;
  }

  table.innerHTML = leads.map(
    (lead) => `
      <tr>

        <td>
          <strong>
            ${escapeHtml(lead.name)}
          </strong>
        </td>

        <td>
          ${escapeHtml(
            lead.company || "-"
          )}
        </td>

        <td>
          ${escapeHtml(
            lead.email || "-"
          )}
        </td>

        <td>
          <span class="badge ${escapeHtml(
            lead.status
          )}">
            ${escapeHtml(lead.status)}
          </span>
        </td>

        <td>
          ${money(lead.value)}
        </td>

        <td>

          <div class="actions">

            <button
              class="btn-secondary"
              onclick="editLead(${lead.id})"
            >
              Edit
            </button>

            <button
              class="btn-danger"
              onclick="deleteLead(${lead.id})"
            >
              Delete
            </button>

          </div>

        </td>

      </tr>
    `
  ).join("");
}

$("searchInput").addEventListener(
  "input",
  debounce(loadLeads, 300)
);

$("statusFilter").addEventListener(
  "change",
  loadLeads
);


/* ---------------- LEAD MODAL ---------------- */

function openLeadModal(lead = null) {
  $("leadModal").classList.remove(
    "hidden"
  );

  $("leadMessage").innerHTML = "";

  if (lead) {
    $("modalTitle").textContent =
      "Edit Lead";

    $("leadId").value = lead.id;
    $("leadName").value = lead.name || "";
    $("leadEmail").value = lead.email || "";
    $("leadPhone").value = lead.phone || "";
    $("leadCompany").value =
      lead.company || "";
    $("leadSource").value =
      lead.source || "";
    $("leadStatus").value =
      lead.status || "new";
    $("leadValue").value =
      lead.value || 0;
    $("leadNotes").value =
      lead.notes || "";
  } else {
    $("modalTitle").textContent =
      "Add Lead";

    $("leadForm").reset();

    $("leadId").value = "";
    $("leadStatus").value = "new";
    $("leadValue").value = "0";
  }
}

function closeLeadModal() {
  $("leadModal").classList.add(
    "hidden"
  );
}

$("addLeadBtn").addEventListener(
  "click",
  () => openLeadModal()
);

$("dashboardAddLead").addEventListener(
  "click",
  () => openLeadModal()
);

$("closeModal").addEventListener(
  "click",
  closeLeadModal
);

$("cancelLead").addEventListener(
  "click",
  closeLeadModal
);

$("leadModal").addEventListener(
  "click",
  (event) => {
    if (
      event.target === $("leadModal")
    ) {
      closeLeadModal();
    }
  }
);

$("leadForm").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const id = $("leadId").value;

    const payload = {
      name: $("leadName").value,
      email: $("leadEmail").value,
      phone: $("leadPhone").value,
      company: $("leadCompany").value,
      source: $("leadSource").value,
      status: $("leadStatus").value,
      value: Number(
        $("leadValue").value || 0
      ),
      notes: $("leadNotes").value
    };

    try {
      if (id) {
        await api(
          `/leads/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload)
          }
        );
      } else {
        await api(
          "/leads",
          {
            method: "POST",
            body: JSON.stringify(payload)
          }
        );
      }

      closeLeadModal();

      await loadLeads();
      await loadDashboard();

    } catch (error) {
      showMessage(
        $("leadMessage"),
        error.message
      );
    }
  }
);

window.editLead = function(id) {
  const lead =
    currentLeads.find(
      (item) => item.id === id
    );

  if (lead) {
    openLeadModal(lead);
  }
};

window.deleteLead = async function(id) {
  const confirmed = confirm(
    "Delete this lead?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api(
      `/leads/${id}`,
      {
        method: "DELETE"
      }
    );

    await loadLeads();
    await loadDashboard();

  } catch (error) {
    alert(error.message);
  }
};


/* ---------------- ANALYTICS ---------------- */

async function loadAnalytics() {
  try {
    const data =
      await api("/dashboard");

    const stats = data.stats;

    $("analyticsContacted").textContent =
      stats.contacted || 0;

    $("analyticsQualified").textContent =
      stats.qualified || 0;

    $("analyticsWon").textContent =
      stats.won || 0;

    $("analyticsValue").textContent =
      money(stats.total_value);

    renderPipeline(stats);

  } catch (error) {
    console.error(error);
  }
}

function renderPipeline(stats) {
  const items = [
    ["New", stats.new],
    ["Contacted", stats.contacted],
    ["Qualified", stats.qualified],
    ["Won", stats.won],
    ["Lost", stats.lost]
  ];

  const total =
    Number(stats.total) || 1;

  $("pipeline").innerHTML =
    items.map(
      ([name, value]) => {
        const percentage =
          Math.round(
            (Number(value || 0) /
              total) *
              100
          );

        return `
          <div style="margin-bottom:18px">

            <div
              style="
                display:flex;
                justify-content:space-between;
                margin-bottom:7px;
              "
            >
              <strong>
                ${name}
              </strong>

              <span class="muted">
                ${value || 0}
              </span>
            </div>

            <div
              style="
                height:9px;
                background:#edf0f5;
                border-radius:99px;
                overflow:hidden;
              "
            >
              <div
                style="
                  width:${percentage}%;
                  height:100%;
                  background:#635bff;
                "
              ></div>
            </div>

          </div>
        `;
      }
    ).join("");
}


/* ---------------- UTILITIES ---------------- */

function debounce(fn, delay) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(
      () => fn(...args),
      delay
    );
  };
}


/* ---------------- INITIALIZATION ---------------- */

async function initialize() {
  if (!token) {
    showAuth();
    return;
  }

  try {
    const data =
      await api("/auth/me");

    currentUser = data.user;

    showApp();
    showPage("dashboard");

  } catch {
    logout();
  }
}

initialize();
