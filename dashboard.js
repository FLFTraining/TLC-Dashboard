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
}

function updateKPI(data) {
  const totalCourses = new Set(data.map(row => row.Course)).size;
  const totalAssignments = data.length;
  const completed = data.filter(r => r.Status === "Completed");
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
    if (row.Status === "Completed") {
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
    if (!course) return;
    const type = row.Course.startsWith("TLC") ? "TLC" : "CE";
    if (!summary[course]) {
      summary[course] = { type, assigned: 0, completed: 0 };
    }
    summary[course].assigned++;
    if (row.Status === "Completed") {
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