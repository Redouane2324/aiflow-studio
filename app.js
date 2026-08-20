const C = document.getElementById("content");
const T = document.getElementById("title");

const API = "/api";


/* =========================
   VIEWS
========================= */

const V = {


  overview() {

    T.textContent =
      "Good evening, Redouane.";

    C.innerHTML = `

      <div class="hero">

        <div>

          <h2>
            Your automation command center
          </h2>

          <div class="muted">
            Monitor AI workflows,
            leads and business activity.
          </div>

        </div>

        <button
          class="btn"
          onclick="show('chat')"
        >
          Open AI Chat
        </button>

      </div>


      <div class="grid">

        <div class="card">

          <small>
            ACTIVE LEADS
          </small>

          <div
            class="metric"
            id="leadMetric"
          >
            ...
          </div>

          <div class="trend">
            ↑ Live from PostgreSQL
          </div>

        </div>


        <div class="card">

          <small>
            AUTOMATIONS
          </small>

          <div class="metric">
            12
          </div>

          <div class="trend">
            ↑ 4 running
          </div>

        </div>


        <div class="card">

          <small>
            AI TASKS
          </small>

          <div class="metric">
            1,284
          </div>

          <div class="trend">
            ↑ 32.1%
          </div>

        </div>


        <div class="card">

          <small>
            CONVERSION
          </small>

          <div class="metric">
            8.7%
          </div>

          <div class="trend">
            ↑ 1.2%
          </div>

        </div>

      </div>


      <div class="two">

        <div class="card">

          <h3>
            AI activity
          </h3>

          <div class="bars">

            ${[
              35,62,48,76,
              58,91,70,82,
              64,96,78,88
            ].map(value => `
              <div
                class="bar"
                style="height:${value}%"
              ></div>
            `).join("")}

          </div>

        </div>


        <div class="card">

          <h3>
            Recent activity
          </h3>

          <div class="item">
            AI lead qualification
            <span class="badge">
              Completed
            </span>
          </div>

          <div class="item">
            Website chatbot
            <span class="badge">
              Running
            </span>
          </div>

          <div class="item">
            Email follow-up
            <span class="badge">
              Queued
            </span>
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

          <h2>
            Lead management
          </h2>

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


    document
      .getElementById("leadForm")
      .addEventListener(
        "submit",
        addLead
      );


    await loadLeads();

  },


  chat() {

    T.textContent =
      "AI Chat";


    C.innerHTML = `

      <div class="hero">

        <div>

          <h2>
            Business AI Assistant
          </h2>

          <div class="muted">
            AI assistant for business automation.
          </div>

        </div>

      </div>


      <div class="card">

        <div
          class="messages"
          id="msgs"
        >

          <div class="msg">
            Hello! Ask me to qualify
            a lead, draft an email,
            or suggest an automation.
          </div>

        </div>


        <form id="chatForm">

          <input
            id="ci"
            placeholder="Ask your AI assistant..."
            required
          >

          <button
            class="btn"
          >
            Send
          </button>

        </form>

      </div>

    `;


    document
      .getElementById("chatForm")
      .addEventListener(
        "submit",
        chat
      );

  },


  automations() {

    T.textContent =
      "Automations";


    C.innerHTML = `

      <div class="hero">

        <div>

          <h2>
            Workflow automation
          </h2>

          <div class="muted">
            Build repeatable business
            processes with AI.
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
        ].map((name,index) => `

          <div class="card">

            <small>
              ${name}
            </small>

            <div class="metric">
              ${index === 2
                ? "Paused"
                : "Active"}
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


  analytics() {

    T.textContent =
      "Analytics";


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
          ["LEAD VALUE","$18.4K"],
          ["RESPONSE TIME","2.4m"],
          ["AI RESOLUTION","74%"],
          ["AUTOMATION SAVINGS","31h"]
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
    .querySelectorAll(".nav-button")
    .forEach(button => {

      if (
        button.dataset.page === page
      ) {

        button.style.background =
          "rgba(118,84,255,.25)";

        button.style.color =
          "white";

      } else {

        button.style.background =
          "transparent";

        button.style.color =
          "";

      }

    });


  if (V[page]) {

    V[page]();

  }


  const sidebar =
    document.getElementById(
      "sidebar"
    );

  if (sidebar) {

    sidebar.classList.remove(
      "mobile-open"
    );

  }

}


/* =========================
   LOAD LEADS
========================= */

async function loadLeads() {

  const table =
    document.getElementById("lt");

  if (!table) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/leads",
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
      "AIFlow Leads:",
      leads
    );


    if (
      !Array.isArray(leads) ||
      leads.length === 0
    ) {

      table.innerHTML = `
        <div class="muted">
          No leads found.
        </div>
      `;

      return;

    }


    table.innerHTML = `

      <div style="overflow-x:auto">

        <table class="table">

          <thead>

            <tr>

              <th>Name</th>

              <th>Email</th>

              <th>Status</th>

              <th>Source</th>

              <th>Created</th>

            </tr>

          </thead>


          <tbody>

            ${leads.map(
              lead => `

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

            `
            ).join("")}

          </tbody>

        </table>

      </div>

    `;


  } catch (error) {

    console.error(
      "Leads error:",
      error
    );


    table.innerHTML = `
      <div style="color:#ff7b7b">
        Unable to load leads.
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
        "/api/leads",
        {
          cache: "no-store"
        }
      );


    const leads =
      await response.json();


    metric.textContent =
      Array.isArray(leads)
        ? leads.length
        : 0;


  } catch {

    metric.textContent = "—";

  }

}


/* =========================
   ADD LEAD
========================= */

async function addLead(event) {

  event.preventDefault();


  const name =
    document
      .getElementById("ln")
      .value
      .trim();


  const email =
    document
      .getElementById("le")
      .value
      .trim();


  const message =
    document.getElementById(
      "leadMessage"
    );


  try {

    message.innerHTML = `
      <div class="muted">
        Saving...
      </div>
    `;


    const response =
      await fetch(
        "/api/leads",
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

    message.innerHTML = `
      <div style="color:#ff7b7b">
        ${esc(error.message)}
      </div>
    `;

  }

}


/* =========================
   CHAT
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


  box.innerHTML += `
    <div
      class="msg"
      id="typing"
    >
      AI is thinking...
    </div>
  `;


  try {

    const response =
      await fetch(
        "/api/chat",
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
      document.getElementById(
        "typing"
      );


    if (typing) {
      typing.remove();
    }


    box.innerHTML += `
      <div class="msg">
        ${esc(
          data.reply ||
          "No response"
        )}
      </div>
    `;


  } catch {

    const typing =
      document.getElementById(
        "typing"
      );


    if (typing) {
      typing.remove();
    }


    box.innerHTML += `
      <div class="msg">
        AI service unavailable.
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

  if (!date) {
    return "—";
  }


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

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    char => {

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return map[char];

    }
  );

}


/* =========================
   MOBILE MENU
========================= */

const mobileMenu =
  document.getElementById(
    "mobileMenu"
  );


const sidebar =
  document.getElementById(
    "sidebar"
  );


if (mobileMenu && sidebar) {

  mobileMenu.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "mobile-open"
      );

    }
  );

}


/* =========================
   NAV BUTTONS
========================= */

document
  .querySelectorAll(".nav-button")
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
   START
========================= */

show("overview");
