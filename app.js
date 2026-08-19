const C = document.getElementById("content");
const T = document.getElementById("title");

const API = "/api";

/* =========================
   PAGE VIEWS
========================= */

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
          <div class="trend">
            ↑ Live from PostgreSQL
          </div>
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
              35, 62, 48, 76,
              58, 91, 70, 82,
              64, 96, 78, 88
            ].map(height => `
              <div
                class="bar"
                style="height:${height}%"
              ></div>
            `).join("")}
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


  /* =========================
     LEADS
  ========================= */

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
            type="text"
            placeholder="Name"
            required
          >

          <input
            id="le"
            type="email"
            placeholder="Email"
            required
          >

          <button
            class="btn"
            type="submit"
          >
            Add lead
          </button>

        </form>

        <div
          id="leadMessage"
          style="margin-top:12px"
        ></div>

        <div
          id="lt"
          style="margin-top:20px"
        >
          Loading leads...
        </div>

      </div>
    `;

    const form =
      document.getElementById("leadForm");

    if (form) {
      form.addEventListener(
        "submit",
        addLead
      );
    }

    await loadLeads();
  },


  /* =========================
     AI CHAT
  ========================= */

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

    const form =
      document.getElementById("chatForm");

    if (form) {
      form.addEventListener(
        "submit",
        chat
      );
    }
  },


  /* =========================
     AUTOMATIONS
  ========================= */

  automations() {

    T.textContent = "Automations";

    C.innerHTML = `
      <div class="hero">

        <div>

          <h2>
            Workflow automation
          </h2>

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
        ].map((name, index) => `

          <div class="card">

            <small>
              ${name}
            </small>

            <div class="metric">
              ${index === 2 ? "Paused" : "Active"}
            </div>

            <p class="muted">
              Automated business workflow
              ready for client customization.
            </p>

          </div>

        `).join("")}

      </div>
    `;
  },


  /* =========================
     ANALYTICS
  ========================= */

  analytics() {

    T.textContent = "Analytics";

    C.innerHTML = `
      <div class="hero">

        <div>

          <h2>
            Business analytics
          </h2>

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
        ].map(item => `

          <div class="card">

            <small>
              ${item[0]}
            </small>

            <div class="metric">
              ${item[1]}
            </div>

            <div class="trend">
              ↑ Improving
            </div>

          </div>

        `).join("")}

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
   GET LEADS
========================= */

async function loadLeads() {

  const table =
    document.getElementById("lt");

  if (!table) {
    return;
  }

  table.innerHTML = `
    <div class="muted">
      Loading leads...
    </div>
  `;

  try {

    const response =
      await fetch(
        `${API}/leads`,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }

    const leads =
      await response.json();

    console.log(
      "AIFlow PostgreSQL Leads:",
      leads
    );

    if (
      !Array.isArray(leads) ||
      leads.length === 0
    ) {

      table.innerHTML = `
        <div class="card">
          <div class="muted">
            No leads found.
          </div>
        </div>
      `;

      return;
    }


    table.innerHTML = `

      <div style="overflow-x:auto">

        <table class="table">

          <thead>

            <tr>

              <th>
                Name
              </th>

              <th>
                Email
              </th>

              <th>
                Status
              </th>

              <th>
                Source
              </th>

              <th>
                Created
              </th>

            </tr>

          </thead>

          <tbody>

            ${leads.map(lead => `

              <tr>

                <td>
                  <strong>
                    ${esc(lead.name)}
                  </strong>
                </td>

                <td>
                  ${esc(lead.email)}
                </td>

                <td>

                  <span class="badge">
                    ${esc(
                      lead.status || "New"
                    )}
                  </span>

                </td>

                <td>
                  ${esc(
                    lead.source || "Website"
                  )}
                </td>

                <td>
                  ${formatDate(
                    lead.created_at
                  )}
                </td>

              </tr>

            `).join("")}

          </tbody>

        </table>

      </div>

    `;

  } catch (error) {

    console.error(
      "AIFlow Leads Error:",
      error
    );

    table.innerHTML = `

      <div class="card">

        <div
          style="color:#ff7b7b"
        >
          Unable to load leads.
        </div>

        <div class="muted">
          Please refresh the page.
        </div>

      </div>

    `;
  }
}


/* =========================
   LEAD COUNT
========================= */

async function loadLeadMetric() {

  const metric =
    document.getElementById(
      "leadMetric"
    );

  if (!metric) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API}/leads`,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        "Lead API unavailable"
      );
    }

    const leads =
      await response.json();

    metric.textContent =
      Array.isArray(leads)
        ? leads.length
        : 0;

  } catch (error) {

    console.error(error);

    metric.textContent = "—";
  }
}


/* =========================
   ADD LEAD
========================= */

async function addLead(event) {

  event.preventDefault();

  const nameInput =
    document.getElementById("ln");

  const emailInput =
    document.getElementById("le");

  const message =
    document.getElementById(
      "leadMessage"
    );

  const name =
    nameInput.value.trim();

  const email =
    emailInput.value.trim();


  if (!name || !email) {

    message.innerHTML = `
      <div style="color:#ff7b7b">
        Please enter name and email.
      </div>
    `;

    return;
  }


  message.innerHTML = `
    <div class="muted">
      Saving lead...
    </div>
  `;


  try {

    const response =
      await fetch(
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
        data.error ||
        "Unable to create lead"
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

    console.error(
      "Create lead error:",
      error
    );

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

  const box =
    document.getElementById("msgs");

  const message =
    input.value.trim();


  if (!message) {
    return;
  }


  box.innerHTML += `

    <div class="msg user">
      ${esc(message)}
    </div>

  `;


  input.value = "";


  const typing =
    document.createElement("div");

  typing.className = "msg";

  typing.id = "aiTyping";

  typing.textContent =
    "AI is thinking...";

  box.appendChild(typing);


  box.scrollTop =
    box.scrollHeight;


  try {

    const response =
      await fetch(
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


    const typingElement =
      document.getElementById(
        "aiTyping"
      );

    if (typingElement) {
      typingElement.remove();
    }


    const reply =
      data.reply ||
      "No AI response received.";


    box.innerHTML += `

      <div class="msg">
        ${esc(reply)}
      </div>

    `;


  } catch (error) {

    const typingElement =
      document.getElementById(
        "aiTyping"
      );

    if (typingElement) {
      typingElement.remove();
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
   DATE FORMAT
========================= */

function formatDate(date) {

  if (!date) {
    return "—";
  }

  try {

    return new Date(date)
      .toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      );

  } catch {

    return "—";

  }
}


/* =========================
   SECURITY
========================= */

function esc(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      character => {

        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };

        return map[character];
      }
    );
}


/* =========================
   SIDEBAR BUTTONS
========================= */

document
  .querySelectorAll("aside button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        show(
          button.dataset.page
        );

      }
    );

  });


/* =========================
   START APPLICATION
========================= */

show("overview");
