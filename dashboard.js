document.addEventListener("DOMContentLoaded", () => {
  Papa.parse("FLF_Daily_Training_Data_April22_2025.csv", {
    download: true,
    header: true,
    complete: (results) => {
      const data = results.data;
      setupTabs();
      populateDashboard(data);
    },
  });
});

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      buttons.forEach(btn => btn.classList.remove("bg-blue-600", "text-white"));
      button.classList.add("bg-blue-600", "text-white");

      panels.forEach(panel => panel.classList.add("hidden"));
      document.getElementById(`${target}-tab`).classList.remove("hidden");
    });
  });

  document.querySelector('.tab-button[data-tab="summary"]').click();
}

function populateDashboard(data) {
  updateKPI(data);
  populateSummaryTab(data);
  populateCourseTab(data);
  populateDepartmentTab(data);
  populateIndividualTab(data);
}

function updateKPI(data) {
  const totalCourses = new Set(data.map(row => row.Course)).size;
  const totalAssignments = data.length;
  const completed = data.filter(r => r.Status.includes("Completed"));
  const totalCompleted = completed.length;
  const complianceRate = (totalCompleted / totalAssignments * 100).toFixed(1);

  const avgScore = completed
    .map(r => parseFloat(r["Average score"]))
    .filter(n => !isNaN(n))
    .reduce((a, b) => a + b, 0) / totalCompleted;

  document.getElementById("total-courses").textContent = totalCourses;
  document.getElementById("total-assignments").textContent = totalAssignments;
  document.getElementById("total-completed").textContent = totalCompleted;
  document.getElementById("compliance-rate").textContent = `${complianceRate}%`;
  document.getElementById("avg-score").textContent = avgScore.toFixed(1);
}

function populateSummaryTab(data) {
  const table = document.getElementById("summary-courses-table");
  table.innerHTML = "";

  const summary = {};

  data.forEach(row => {
    const course = row.Course;
    if (!course) return;
    if (!summary[course]) {
      summary[course] = { assigned: 0, completed: 0, scores: [] };
    }
    summary[course].assigned++;
    if (row.Status.includes("Completed")) {
      summary[course].completed++;
      summary[course].scores.push(parseFloat(row["Average score"] || 0));
    }
  });

  for (const [course, stats] of Object.entries(summary)) {
    const compliance = ((stats.completed / stats.assigned) * 100).toFixed(1);
    const avg = stats.scores.length ? (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(1) : "—";

    table.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="py-2 px-4 border">${course}</td>
        <td class="py-2 px-4 border text-center">${stats.assigned}</td>
        <td class="py-2 px-4 border text-center">${stats.completed}</td>
        <td class="py-2 px-4 border text-center">${compliance}%</td>
        <td class="py-2 px-4 border text-center">${avg}</td>
      </tr>
    `);
  }
}

function populateCourseTab(data) {
  const table = document.getElementById("courses-table");
  table.innerHTML = "";

  const summary = {};

  data.forEach(row => {
    const course = row.Course;
    const type = row.Course?.startsWith("TLC") ? "TLC" : "CE";
    if (!course) return;
    if (!summary[course]) {
      summary[course] = { type, assigned: 0, completed: 0 };
    }
    summary[course].assigned++;
    if (row.Status.includes("Completed")) {
      summary[course].completed++;
    }
  });

  for (const [course, stats] of Object.entries(summary)) {
    const compliance = ((stats.completed / stats.assigned) * 100).toFixed(1);
    const statusColor =
      compliance >= 80 ? "bg-green-500" :
      compliance >= 50 ? "bg-yellow-500" :
      "bg-red-500";
    const statusLabel =
      compliance >= 80 ? "Good" :
      compliance >= 50 ? "Adequate" :
      "Needs Attention";

    table.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="py-2 px-4 border">${course}</td>
        <td class="py-2 px-4 border text-center">${stats.type}</td>
        <td class="py-2 px-4 border text-center">${stats.assigned}</td>
        <td class="py-2 px-4 border text-center">${stats.completed}</td>
        <td class="py-2 px-4 border text-center">${compliance}%</td>
        <td class="py-2 px-4 border text-center">
          <span class="px-2 py-1 rounded text-white text-xs ${statusColor}">
            ${statusLabel}
          </span>
        </td>
      </tr>
    `);
  }
}

function populateDepartmentTab(data) {
  const table = document.getElementById("departments-table");
  table.innerHTML = "";

  const summary = {};

  data.forEach(row => {
    const dept = row.Department;
    if (!dept) return;
    if (!summary[dept]) {
      summary[dept] = { assigned: 0, completed: 0 };
    }
    summary[dept].assigned++;
    if (row.Status.includes("Completed")) {
      summary[dept].completed++;
    }
  });

  for (const [dept, stats] of Object.entries(summary)) {
    const compliance = ((stats.completed / stats.assigned) * 100).toFixed(1);
    const statusColor =
      compliance >= 80 ? "bg-green-500" :
      compliance >= 50 ? "bg-yellow-500" :
      "bg-red-500";
    const statusLabel =
      compliance >= 80 ? "Excellent" :
      compliance >= 50 ? "Good" :
      "Needs Attention";

    table.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="py-2 px-4 border">${dept}</td>
        <td class="py-2 px-4 border text-center">${stats.assigned}</td>
        <td class="py-2 px-4 border text-center">${stats.completed}</td>
        <td class="py-2 px-4 border text-center">${compliance}%</td>
        <td class="py-2 px-4 border text-center">
          <span class="px-2 py-1 rounded text-white text-xs ${statusColor}">
            ${statusLabel}
          </span>
        </td>
      </tr>
    `);
  }
}

function populateIndividualTab(data) {
  const table = document.getElementById("individual-table");
  table.innerHTML = "";

  data.forEach(row => {
    if (!row.Course) return;
    const score = parseFloat(row["Average score"]);
    const badgeColor = row.Status.includes("Completed") ? "bg-green-500" : "bg-red-500";

    table.insertAdjacentHTML("beforeend", `
      <tr>
        <td class="py-2 px-4 border">${row["First name"]} ${row["Last name"]}</td>
        <td class="py-2 px-4 border">${row.Department}</td>
        <td class="py-2 px-4 border">${row.Course}</td>
        <td class="py-2 px-4 border text-center">
          <span class="px-2 py-1 rounded text-white text-xs ${badgeColor}">
            ${row.Status}
          </span>
        </td>
        <td class="py-2 px-4 border text-center">${isNaN(score) ? "—" : score}</td>
      </tr>
    `);
  });
}


// Date filter logic
let fullData = [];

document.addEventListener("DOMContentLoaded", () => {
  Papa.parse("FLF_Daily_Training_Data_April22_2025.csv", {
    download: true,
    header: true,
    complete: (results) => {
      fullData = results.data;
      setupTabs();
      populateDashboard(fullData);
      setupDateFilter();
    },
  });
});

function setupDateFilter() {
  document.getElementById("apply-filter").addEventListener("click", () => {
    const start = document.getElementById("start-date").value;
    const end = document.getElementById("end-date").value;

    let filtered = fullData.filter(row => {
      
    const enrolledRaw = row["Enrolled on"];
    if (!enrolledRaw) return false;
    const date = new Date(enrolledRaw.split(" ")[0]);
    
      if (start && date < new Date(start)) return false;
      if (end && date > new Date(end)) return false;
      return true;
    });

    populateDashboard(filtered);
  });

  document.getElementById("reset-filter").addEventListener("click", () => {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    populateDashboard(fullData);
  });
}