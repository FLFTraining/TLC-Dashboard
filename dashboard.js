document.addEventListener("DOMContentLoaded", () => {
  Papa.parse("FLF_Daily_Training_Data_April22_2025.csv", {
    download: true,
    header: true,
    complete: (results) => {
      const data = results.data;
      setupTabs();
      setupFilters(data);
      renderAll(data);
    },
  });
});

let originalData = [];
let currentData = [];

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("bg-blue-600", "text-white"));
      btn.classList.add("bg-blue-600", "text-white");

      const target = btn.dataset.tab;
      document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.add("hidden"));
      document.getElementById(`${target}-tab`).classList.remove("hidden");
    });
  });
  document.querySelector('.tab-button[data-tab="summary"]').click();
}

function setupFilters(data) {
  originalData = data;
  currentData = [...data];

  const deptSet = new Set(data.map(row => row.Department).filter(Boolean));
  const deptSelects = ["department-filter", "individual-dept-filter"];
  deptSelects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    deptSet.forEach(dept => {
      const opt = document.createElement("option");
      opt.value = dept;
      opt.textContent = dept;
      sel.appendChild(opt);
    });
  });

  document.getElementById("apply-filter").addEventListener("click", () => {
    const start = document.getElementById("start-date").value;
    const end = document.getElementById("end-date").value;
    currentData = originalData.filter(row => {
      const date = new Date(row["Enrolled on"]?.split(" ")[0]);
      if (start && date < new Date(start)) return false;
      if (end && date > new Date(end)) return false;
      return true;
    });
    renderAll(currentData);
  });

  document.getElementById("reset-filter").addEventListener("click", () => {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    currentData = [...originalData];
    renderAll(currentData);
  });

  document.getElementById("individual-dept-filter").addEventListener("change", renderIndividuals);
  document.getElementById("individual-name-search").addEventListener("input", renderIndividuals);
}

function renderAll(data) {
  updateKPIs(data);
  renderSummary(data);
  renderCourses(data);
  renderDepartments(data);
  renderIndividuals();
}

function updateKPIs(data) {
  document.getElementById("total-courses").textContent = new Set(data.map(r => r.Course)).size;
  document.getElementById("total-assignments").textContent = data.length;
  const completed = data.filter(r => r.Status === "Completed");
  document.getElementById("total-completed").textContent = completed.length;
  document.getElementById("compliance-rate").textContent = `${(completed.length / data.length * 100).toFixed(1)}%`;
  const avgScore = completed.map(r => parseFloat(r["Average score"])).filter(n => !isNaN(n));
  document.getElementById("avg-score").textContent = avgScore.length ? (avgScore.reduce((a,b) => a+b,0)/avgScore.length).toFixed(1) : "—";
}

function renderSummary(data) {
  const table = document.getElementById("summary-courses-table");
  table.innerHTML = "";
  const summary = {};
  data.forEach(row => {
    if (!summary[row.Course]) summary[row.Course] = { assigned: 0, completed: 0, scores: [] };
    summary[row.Course].assigned++;
    if (row.Status === "Completed") {
      summary[row.Course].completed++;
      summary[row.Course].scores.push(parseFloat(row["Average score"]));
    }
  });
  for (let course in summary) {
    const s = summary[course];
    const compliance = ((s.completed / s.assigned) * 100).toFixed(1);
    const avg = s.scores.length ? (s.scores.reduce((a,b)=>a+b,0)/s.scores.length).toFixed(1) : "—";
    table.innerHTML += `<tr>
      <td class="border px-4 py-2">${course}</td>
      <td class="border text-center">${s.assigned}</td>
      <td class="border text-center">${s.completed}</td>
      <td class="border text-center">${compliance}%</td>
      <td class="border text-center">${avg}</td>
    </tr>`;
  }
}

function renderCourses(data) {
  const table = document.getElementById("courses-table");
  table.innerHTML = "";
  const summary = {};
  data.forEach(row => {
    if (!summary[row.Course]) summary[row.Course] = { type: row.Course.startsWith("TLC") ? "TLC" : "CE", assigned: 0, completed: 0 };
    summary[row.Course].assigned++;
    if (row.Status === "Completed") summary[row.Course].completed++;
  });
  for (let course in summary) {
    const s = summary[course];
    const compliance = ((s.completed / s.assigned) * 100).toFixed(1);
    const statusColor = compliance >= 80 ? "bg-green-500" : compliance >= 50 ? "bg-yellow-500" : "bg-red-500";
    const statusLabel = compliance >= 80 ? "Good" : compliance >= 50 ? "Adequate" : "Needs Attention";
    table.innerHTML += `<tr>
      <td class="border px-4 py-2">${course}</td>
      <td class="border text-center">${s.type}</td>
      <td class="border text-center">${s.assigned}</td>
      <td class="border text-center">${s.completed}</td>
      <td class="border text-center">${compliance}%</td>
      <td class="border text-center"><span class="text-white text-xs px-2 py-1 rounded ${statusColor}">${statusLabel}</span></td>
    </tr>`;
  }
}

function renderDepartments(data) {
  const table = document.getElementById("departments-table");
  table.innerHTML = "";
  const summary = {};
  data.forEach(row => {
    if (!summary[row.Department]) summary[row.Department] = { assigned: 0, completed: 0 };
    summary[row.Department].assigned++;
    if (row.Status === "Completed") summary[row.Department].completed++;
  });
  for (let dept in summary) {
    const s = summary[dept];
    const compliance = ((s.completed / s.assigned) * 100).toFixed(1);
    const statusColor = compliance >= 80 ? "bg-green-500" : compliance >= 50 ? "bg-yellow-500" : "bg-red-500";
    const statusLabel = compliance >= 80 ? "Excellent" : compliance >= 50 ? "Good" : "Needs Improvement";
    table.innerHTML += `<tr>
      <td class="border px-4 py-2">${dept}</td>
      <td class="border text-center">${s.assigned}</td>
      <td class="border text-center">${s.completed}</td>
      <td class="border text-center">${compliance}%</td>
      <td class="border text-center"><span class="text-white text-xs px-2 py-1 rounded ${statusColor}">${statusLabel}</span></td>
    </tr>`;
  }
}

function renderIndividuals() {
  const table = document.getElementById("individual-table");
  table.innerHTML = "";
  const dept = document.getElementById("individual-dept-filter").value;
  const name = document.getElementById("individual-name-search").value.toLowerCase();

  const filtered = currentData.filter(row => {
    const fullName = `${row["First name"]} ${row["Last name"]}`.toLowerCase();
    const matchName = !name || fullName.includes(name);
    const matchDept = !dept || row.Department === dept;
    return matchName && matchDept;
  });

  filtered.forEach(row => {
    const score = parseFloat(row["Average score"]);
    const badgeColor = row.Status === "Completed" ? "bg-green-500" : "bg-red-500";
    table.innerHTML += `<tr>
      <td class="border px-4 py-2">${row["First name"]} ${row["Last name"]}</td>
      <td class="border">${row.Department}</td>
      <td class="border">${row.Course}</td>
      <td class="border text-center"><span class="text-white text-xs px-2 py-1 rounded ${badgeColor}">${row.Status}</span></td>
      <td class="border text-center">${isNaN(score) ? "—" : score}</td>
    </tr>`;
  });
}