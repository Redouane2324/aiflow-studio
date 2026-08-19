const C = document.getElementById("content");
const T = document.getElementById("title");

const API = "/api";

const V = {

  overview() {
    T.textContent = "Good evening, Redouane.";

    C.innerHTML = `
      <div class="hero">
        <div>
          <h2>Your automation command center</h2>
          <div class="muted">
            Monitor AI workflows, leads and business activity.
          </div>
        </div>

        <button class="btn" onclick="show('chat')">
          Open AI Chat
        </button>
      </div>

      <div class="grid">

        <div class="card">
          <small>ACTIVE LEADS</small>
          <div class="metric" id="leadMetric">...</div>
          <div class="trend">↑ Live from PostgreSQL</div>
        </div>

        <div class="card">
          <small>AUTOMATIONS</small>
          <div class="metric">12</div>
          <div class="trend">↑ 4 running</div>
        </div>

        <div class="card">
          <small>AI TASKS</small>
          <div class="metric">1,284</div>
          <div class="trend">↑ 32.1%</div>
        </div>

        <div class="card">
          <small>CONVERSION</small>
          <div class="metric">8.7%</div>
          <div class="trend">↑ 1.2%</div>
        </div>

      </div>

      <div class="two">

        <div class="card">
          <h3>AI activity</h3>

          <div class="bars">
            ${[
              35, 62, 48, 76, 58, 91,
              70, 82, 64, 96, 78, 88
            ].map(
              x => `<div class="bar" style="height:${x}%"></div>`
            ).join("")}
          </div>
        </div>

        <div class="card">
          <h3>Recent activity</h3>

          <div class="item">
            AI lead qualification
            <span class="badge">Completed</span>
          </div>

          <div class="item">
            Website chatbot
            <span class="badge">Running</span>
          </div>

          <div class="item">
            Email follow-up
            <span class="badge">Queued</span>
          </div>

        </div>

      </div>
    `;

    loadLeadMetric();
  },


  async leads() {

    T.textContent = "Leads";

    C.innerHTML = `
      <div class="hero">

        <div>
          <h2>Lead management</h2>

          <div class="muted">
            Capture and organize potential customers.
          </div>
        </div>

      </div>

      <div class="card">

        <form id="leadForm">

          <input
            id="ln"
            placeholder="Name"
            required
          >

          <input
            id="le"
            type="email"
            placeholder="Email"
            required
          >

          <button class="btn" type="submit">
            Add lead
          </button>

        </form>

        <div id="leadMessage"></div>

        <div id="lt" style="margin-top:18px">
          Loading leads...
        </div>

      </div>
    `;

    document
      .getElementById("leadForm")
      .addEventListener("submit", addLead);

    await loadLeads();
  },


  chat() {

    T.textContent = "AI Chat";

    C.innerHTML = `
      <div class="hero">

        <div>
          <h2>Business AI Assistant</h2>

          <div class="muted">
            AI assistant for business automation.
          </div>
        </div>

      </div>

      <div class="card chat">

        <div
          class="messages"
          id="msgs"
        >

          <div class="msg">
            Hello! Ask me to qualify a lead,
            draft an email, or suggest an automation.
          </div>

        </div>

        <form id="chatForm">

          <input
            id="ci"
            placeholder="Ask your AI assistant..."
            required
          >

          <button class="btn">
            Send
          </button>

        </form>

      </div>
    `;

    document
      .getElementById("chatForm")
      .addEventListener("submit", chat);
  },


  automations() {

    T.textContent = "Automations";

    C.innerHTML = `
      <div class="hero">

        <div>
          <h2>Workflow automation</h2>

          <div class="muted">
            Build repeatable business processes with AI.
          </div>
        </div>

        <button
          class="btn"
          onclick="alert('Automation builder coming soon')"
        >
          + New workflow
        </button>

      </div>

      <div class="grid">

        ${[
          "LEAD QUALIFICATION",
          "EMAIL FOLLOW-UP",
          "SUPPORT TRIAGE",
          "CONTENT ENGINE"
        ].map(
          (x, i) => `
            <div class="card">

              <small>${x}</small>

              <div class="metric">
                ${i === 2 ? "Paused" : "Active"}
              </div>

              <p class="muted">
                Automated business workflow
                ready for client customization.
              </p>

            </div>
          `
        ).join("")}

      </div>
    `;
  },


  analytics() {

    T.textContent = "Analytics";

    C.innerHTML = `
      <div class="hero">

        <div>
          <h2>Business analytics</h2>

          <div class="muted">
            Client-facing performance overview.
          </div>
        </div>

      </div>

      <div class="grid">

        ${[
          ["LEAD VALUE", "$18.4K"],
          ["RESPONSE TIME", "2.4m"],
          ["AI RESOLUTION", "74%"],
          ["AUTOMATION SAVINGS", "31h"]
        ].map(
          x => `
            <div class="card">

              <small>${x[0]}</small>

              <div class="metric">
                ${x[1]}
              </div>

              <div class="trend">
                ↑ Improving
              </div>

            </div>
          `
        ).join("")}

      </div>
    `;
  }

};


/* =========================
   NAVIGATION
========================= */

function show(page) {

  document
    .querySelectorAll("aside button")
    .forEach(button => {

      button.style.background =
        button.dataset.page === page
          ? "var(--p)"
          : "transparent";

    });

  if (V[page]) {
    V[page]();
  }

}


/* =========================
   LOAD LEADS
========================= */

async function loadLeads() {

  const table = document.getElementById("lt");

  if (!table) return;

  table.innerHTML = "Loading leads...";

  try {

    const response = await fetch(
      `${API}/leads`
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load leads"
      );
    }

    const leads = await response.json();

    if (!leads.length) {

      table.innerHTML = `
        <div class="muted">
          No leads yet.
        </div>
      `;

      return;
    }

    table.innerHTML = `
      <table class="table">

        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Source</th>
          <th>Date</th>
        </tr>

        ${leads.map(
          lead => `
            <tr>

              <td>
                ${esc(lead.name)}
              </td>

              <td>
                ${esc(lead.email)}
              </td>

              <td>
                <span class="badge">
                  ${esc(lead.status)}
                </span>
              </td>

              <td>
                ${esc(lead.source)}
              </td>

              <td>
                ${formatDate(lead.created_at)}
              </td>

            </tr>
          `
        ).join("")}

      </table>
    `;

  } catch (error) {

    console.error(error);

    table.innerHTML = `
      <div class="muted">
        Unable to load leads.
        Please refresh the page.
      </div>
    `;
  }

}


/* =========================
   LEAD METRIC
========================= */

async function loadLeadMetric() {

  const metric =
    document.getElementById("leadMetric");

  if (!metric) return;

  try {

    const response =
      await fetch(`${API}/leads`);

    const leads =
      await response.json();

    metric.textContent =
      leads.length;

  } catch (error) {

    metric.textContent = "—";

  }

}


/* =========================
   ADD LEAD
========================= */

async function addLead(event) {

  event.preventDefault();

  const name =
    document.getElementById("ln").value.trim();

  const email =
    document.getElementById("le").value.trim();

  const message =
    document.getElementById("leadMessage");

  if (!name || !email) {
    return;
  }

  message.innerHTML = `
    <div class="muted">
      Saving lead...
    </div>
  `;

  try {

    const response = await fetch(
      `${API}/leads`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          name,
          email,
          source: "Website"
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to create lead"
      );
    }

    document
      .getElementById("leadForm")
      .reset();

    message.innerHTML = `
      <div class="trend">
        ✓ Lead added successfully
      </div>
    `;

    await loadLeads();

  } catch (error) {

    console.error(error);

    message.innerHTML = `
      <div style="color:#ff7b7b">
        ${esc(error.message)}
      </div>
    `;
  }

}


/* =========================
   AI CHAT
========================= */

async function chat(event) {

  event.preventDefault();

  const input =
    document.getElementById("ci");

  const message =
    input.value.trim();

  if (!message) return;

  const box =
    document.getElementById("msgs");

  box.innerHTML += `
    <div class="msg user">
      ${esc(message)}
    </div>
  `;

  input.value = "";

  box.innerHTML += `
    <div class="msg" id="aiTyping">
      AI is thinking...
    </div>
  `;

  box.scrollTop =
    box.scrollHeight;

  try {

    const response = await fetch(
      `${API}/chat`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          message
        })
      }
    );

    const data =
      await response.json();

    const typing =
      document.getElementById("aiTyping");

    if (typing) {
      typing.remove();
    }

    box.innerHTML += `
      <div class="msg">
        ${esc(data.reply || "No response")}
      </div>
    `;

  } catch (error) {

    const typing =
      document.getElementById("aiTyping");

    if (typing) {
      typing.remove();
    }

    box.innerHTML += `
      <div class="msg">
        AI service temporarily unavailable.
      </div>
    `;
  }

  box.scrollTop =
    box.scrollHeight;

}


/* =========================
   HELPERS
========================= */

function formatDate(date) {

  if (!date) return "—";

  return new Date(date)
    .toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );
}


function esc(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );
}


/* =========================
   SIDEBAR
========================= */

document
  .querySelectorAll("aside button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {
        show(button.dataset.page);
      }
    );

  });


/* =========================
   START APP
========================= */

show("overview");
