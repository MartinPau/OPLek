// Main App Controller
let network = null;
let nodesDataSet = new vis.DataSet([]);
let edgesDataSet = new vis.DataSet([]);

let currentMode = 'master'; // 'master' | 'anon' | 'quiz'
let selectedNodeId = null;

// Quiz State
let quizAnswers = {}; // nodeId -> guessedPersonId
let quizScore = 0;

// Colors
const COLOR_PERSON = "#6366f1";
const COLOR_ANON = "#f59e0b";
const COLOR_WORKPLACE = "#06b6d4";
const COLOR_HUB = "#ec4899";

// Initialize App on DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  initFacitTable();
  initHubFilters();
  initQuizSelect();
  buildNetworkData();
  renderNetwork();
});

// Build vis.js Nodes and Edges Data
function buildNetworkData() {
  const nodes = [];
  const edges = [];
  const wpStats = getWorkplaceStats();
  const addedWorkplaces = new Set();

  // 1. Add Employee Nodes
  employeesData.forEach(p => {
    const isAnon = currentMode === 'anon' || (currentMode === 'quiz' && !quizAnswers[p.id]?.correct);
    const label = isAnon ? p.anonId : p.name;
    
    nodes.push({
      id: p.id,
      label: label,
      title: isAnon ? `<b>${p.anonId}</b><br>Klicka för att se arbetsplatser` : `<b>${p.name}</b><br>${p.workplaces.length} tidigare arbetsplatser`,
      shape: 'dot',
      size: 22,
      font: {
        color: '#ffffff',
        size: 14,
        face: 'Inter',
        strokeWidth: 4,
        strokeColor: '#0b0f19'
      },
      color: {
        background: isAnon ? COLOR_ANON : p.avatarColor,
        border: '#ffffff',
        highlight: {
          background: '#38bdf8',
          border: '#ffffff'
        }
      },
      nodeType: 'person',
      personData: p
    });

    // 2. Add Workplace Nodes & Edges
    p.workplaces.forEach(w => {
      if (!addedWorkplaces.has(w)) {
        addedWorkplaces.add(w);
        const count = wpStats[w];
        const isHub = count >= 3;
        
        nodes.push({
          id: `wp_${w}`,
          label: count >= 2 ? `${w} (${count})` : w,
          title: `<b>${w}</b><br>${count} anställda har jobbat här`,
          shape: 'box',
          margin: 10,
          shapeProperties: { borderRadius: 6 },
          font: {
            color: isHub ? '#ffffff' : '#e2e8f0',
            size: isHub ? 15 : 12,
            face: 'Outfit',
            bold: isHub
          },
          color: {
            background: isHub ? 'rgba(236, 72, 153, 0.85)' : 'rgba(6, 182, 212, 0.75)',
            border: isHub ? '#f472b6' : '#22d3ee',
            highlight: {
              background: '#f43f5e',
              border: '#ffffff'
            }
          },
          nodeType: 'workplace',
          workplaceName: w,
          employeeCount: count
        });
      }

      // Add edge (arrow pointing from person to workplace)
      edges.push({
        id: `e_${p.id}_${w}`,
        from: p.id,
        to: `wp_${w}`,
        arrows: {
          to: { enabled: true, scaleFactor: 0.6 }
        },
        color: {
          color: 'rgba(255, 255, 255, 0.18)',
          highlight: '#38bdf8',
          hover: '#38bdf8'
        },
        width: 1.5,
        smooth: { type: 'continuous' }
      });
    });
  });

  nodesDataSet.clear();
  nodesDataSet.add(nodes);

  edgesDataSet.clear();
  edgesDataSet.add(edges);
}

// Render vis.js Network
function renderNetwork() {
  const container = document.getElementById("mynetwork");
  const data = { nodes: nodesDataSet, edges: edgesDataSet };

  const options = {
    physics: {
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        gravitationalConstant: -38,
        centralGravity: 0.008,
        springLength: 90,
        springConstant: 0.08,
        damping: 0.4
      },
      maxVelocity: 50,
      minVelocity: 0.75,
      stabilization: {
        enabled: true,
        iterations: 200,
        updateInterval: 25
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 100,
      hideEdgesOnDrag: false,
      zoomView: true,
      dragView: true
    }
  };

  network = new vis.Network(container, data, options);

  // Network Events
  network.on("click", onNodeClick);
  network.on("hoverNode", () => { container.style.cursor = 'pointer'; });
  network.on("blurNode", () => { container.style.cursor = 'default'; });
}

// Node Click Handler
function onNodeClick(params) {
  if (params.nodes.length === 0) {
    resetHighlights();
    selectedNodeId = null;
    updateSidebar(null);
    return;
  }

  const nodeId = params.nodes[0];
  selectedNodeId = nodeId;
  const node = nodesDataSet.get(nodeId);

  highlightConnectedNetwork(nodeId);
  updateSidebar(node);
}

// Highlight connected nodes & dim others
function highlightConnectedNetwork(nodeId) {
  const connectedNodes = network.getConnectedNodes(nodeId);
  connectedNodes.push(nodeId);

  const connectedEdges = network.getConnectedEdges(nodeId);

  // Update node colors & opacities
  const allNodes = nodesDataSet.get();
  const nodeUpdates = allNodes.map(n => {
    const isConnected = connectedNodes.includes(n.id);
    return {
      id: n.id,
      opacity: isConnected ? 1.0 : 0.18
    };
  });
  nodesDataSet.update(nodeUpdates);

  // Update edge colors & opacities
  const allEdges = edgesDataSet.get();
  const edgeUpdates = allEdges.map(e => {
    const isConnected = connectedEdges.includes(e.id);
    return {
      id: e.id,
      color: {
        color: isConnected ? '#38bdf8' : 'rgba(255, 255, 255, 0.04)',
        opacity: isConnected ? 1.0 : 0.05
      },
      width: isConnected ? 3 : 1
    };
  });
  edgesDataSet.update(edgeUpdates);
}

// Reset Highlights
function resetHighlights() {
  const allNodes = nodesDataSet.get();
  nodesDataSet.update(allNodes.map(n => ({ id: n.id, opacity: 1.0 })));

  const allEdges = edgesDataSet.get();
  edgesDataSet.update(allEdges.map(e => ({
    id: e.id,
    color: { color: 'rgba(255, 255, 255, 0.18)' },
    width: 1.5
  })));
}

// Update Sidebar Information
function updateSidebar(node) {
  const badgeIcon = document.getElementById("nodeBadgeIcon");
  const nodeName = document.getElementById("nodeName");
  const nodeSubtitle = document.getElementById("nodeSubtitle");
  const nodeContent = document.getElementById("nodeContent");

  if (!node) {
    badgeIcon.textContent = "?";
    badgeIcon.style.background = "#6366f1";
    nodeName.textContent = "Klicka på en nod i kartan";
    nodeSubtitle.textContent = "Välj en kollega eller arbetsplats för mer detaljer";
    nodeContent.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted);">
      När du klickar på en nod upplyses alla kopplingar och du ser exakt vilka kollegor som delar arbetsplatser.
    </p>`;

    if (currentMode === 'quiz') {
      document.getElementById("personGuessSelect").disabled = true;
      document.getElementById("btnSubmitGuess").disabled = true;
      document.getElementById("quizTargetText").textContent = "Markera en anonym nod (t.ex. Nod 01) i kartan för att gissa.";
    }
    return;
  }

  if (node.nodeType === 'person') {
    const p = node.personData;
    const isAnon = currentMode === 'anon' || (currentMode === 'quiz' && !quizAnswers[p.id]?.correct);
    const displayName = isAnon ? p.anonId : p.name;
    const initials = isAnon ? "?" : p.name.split(" ").map(n => n[0]).join("");

    badgeIcon.textContent = initials;
    badgeIcon.style.background = p.avatarColor;
    nodeName.textContent = displayName;
    nodeSubtitle.textContent = isAnon ? "Anonymiserad Kollega (Gissningsnod)" : `${p.workplaces.length} tidigare arbetsplatser`;

    let html = `<div style="margin-bottom: 8px; font-weight: 600; font-size: 0.82rem;">Tidigare Arbetsplatser:</div><div class="chips-list">`;
    p.workplaces.forEach(w => {
      html += `<span class="chip highlight">🏢 ${w}</span>`;
    });
    html += `</div>`;
    nodeContent.innerHTML = html;

    if (currentMode === 'quiz') {
      const isAlreadyCorrect = quizAnswers[p.id]?.correct;
      const select = document.getElementById("personGuessSelect");
      const btn = document.getElementById("btnSubmitGuess");

      if (isAlreadyCorrect) {
        document.getElementById("quizTargetText").innerHTML = `✅ <strong style="color:#10b981;">Rätt gissat!</strong> Detta var ${p.name}.`;
        select.disabled = true;
        btn.disabled = true;
      } else {
        document.getElementById("quizTargetText").innerHTML = `Vem tror du gömmer sig bakom <strong>${p.anonId}</strong>?`;
        select.disabled = false;
        btn.disabled = false;
      }
    }

  } else if (node.nodeType === 'workplace') {
    const wName = node.workplaceName;
    const connectedEdges = edgesDataSet.get().filter(e => e.to === node.id);
    const connectedPersonIds = connectedEdges.map(e => e.from);
    const colleagues = employeesData.filter(p => connectedPersonIds.includes(p.id));

    badgeIcon.textContent = "🏢";
    badgeIcon.style.background = node.employeeCount >= 3 ? COLOR_HUB : COLOR_WORKPLACE;
    nodeName.textContent = wName;
    nodeSubtitle.textContent = `${colleagues.length} kollega/kollegor har jobbat här`;

    let html = `<div style="margin-bottom: 8px; font-weight: 600; font-size: 0.82rem;">Alumni på företaget:</div><div class="chips-list">`;
    colleagues.forEach(p => {
      const isAnon = currentMode === 'anon' || (currentMode === 'quiz' && !quizAnswers[p.id]?.correct);
      const nameStr = isAnon ? p.anonId : p.name;
      html += `<span class="chip">👤 ${nameStr}</span>`;
    });
    html += `</div>`;
    nodeContent.innerHTML = html;

    if (currentMode === 'quiz') {
      document.getElementById("personGuessSelect").disabled = true;
      document.getElementById("btnSubmitGuess").disabled = true;
      document.getElementById("quizTargetText").textContent = "Du markerade en arbetsplats. Välj en anonym person-nod att gissa på.";
    }
  }
}

// Mode Switcher Logic
function switchMode(mode) {
  currentMode = mode;

  document.getElementById("btnModeMaster").classList.toggle("active", mode === 'master');
  document.getElementById("btnModeAnon").classList.toggle("active", mode === 'anon');
  document.getElementById("btnModeQuiz").classList.toggle("active", mode === 'quiz');

  const badge = document.getElementById("modeBadge");
  const quizBox = document.getElementById("quizBox");

  if (mode === 'master') {
    badge.textContent = "FACIT-LÄGE";
    badge.style.background = "rgba(6, 182, 212, 0.15)";
    badge.style.color = "var(--accent-cyan)";
    quizBox.style.display = "none";
  } else if (mode === 'anon') {
    badge.textContent = "LEK-LÄGE (ANONYMT)";
    badge.style.background = "rgba(245, 158, 11, 0.15)";
    badge.style.color = "var(--accent-amber)";
    quizBox.style.display = "none";
  } else if (mode === 'quiz') {
    badge.textContent = "INTERAKTIVT QUIZ";
    badge.style.background = "rgba(99, 102, 241, 0.15)";
    badge.style.color = "var(--accent-indigo)";
    quizBox.style.display = "flex";
  }

  buildNetworkData();
  resetHighlights();
  updateSidebar(selectedNodeId ? nodesDataSet.get(selectedNodeId) : null);
}

// Hub Filters Setup
function initHubFilters() {
  const container = document.getElementById("hubFilterPills");
  const stats = getWorkplaceStats();
  
  // Sort workplaces by count descending
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  let html = `<button class="filter-pill active" onclick="filterByHub(null, this)">Alla</button>`;
  sorted.slice(0, 8).forEach(([wp, count]) => {
    html += `<button class="filter-pill" onclick="filterByHub('${wp}', this)">${wp} (${count})</button>`;
  });
  container.innerHTML = html;
}

// Filter by Hub Workplace
function filterByHub(wpName, btn) {
  document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (!wpName) {
    resetHighlights();
    network.fit();
    return;
  }

  const wpNodeId = `wp_${wpName}`;
  if (nodesDataSet.get(wpNodeId)) {
    selectedNodeId = wpNodeId;
    network.focus(wpNodeId, { scale: 1.2, animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
    highlightConnectedNetwork(wpNodeId);
    updateSidebar(nodesDataSet.get(wpNodeId));
  }
}

// Quiz Select Options Setup
function initQuizSelect() {
  const select = document.getElementById("personGuessSelect");
  let html = `<option value="">-- Välj kollega i listan --</option>`;
  
  // Alphabetical list of employees
  const sorted = [...employeesData].sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach(p => {
    html += `<option value="${p.id}">${p.name}</option>`;
  });
  select.innerHTML = html;
}

// Submit Quiz Guess
function submitGuess() {
  if (!selectedNodeId) return;
  const node = nodesDataSet.get(selectedNodeId);
  if (!node || node.nodeType !== 'person') return;

  const guessSelect = document.getElementById("personGuessSelect");
  const guessedPersonId = guessSelect.value;
  if (!guessedPersonId) return;

  const actualPerson = node.personData;
  
  if (guessedPersonId === actualPerson.id) {
    quizAnswers[actualPerson.id] = { correct: true };
    quizScore++;
    alert(`🎉 RÄTT! ${actualPerson.anonId} var mycket riktigt ${actualPerson.name}!`);
  } else {
    alert(`❌ Fel gissning! Prova igen eller ställ fler frågor till kollegorna.`);
  }

  // Update Score Tracker
  document.getElementById("scoreTracker").textContent = `${quizScore} / ${employeesData.length} Rätt`;

  buildNetworkData();
  highlightConnectedNetwork(selectedNodeId);
  updateSidebar(nodesDataSet.get(selectedNodeId));
}

// Facit Table Modal Setup
function initFacitTable() {
  const tbody = document.getElementById("facitTableBody");
  let html = "";
  
  employeesData.forEach(p => {
    html += `<tr>
      <td><strong style="color: var(--accent-amber);">${p.anonId}</strong></td>
      <td><strong>${p.name}</strong></td>
      <td><span style="font-size:0.8rem; color:var(--text-muted);">${p.workplaces.join(", ")}</span></td>
    </tr>`;
  });
  tbody.innerHTML = html;
}

function openFacitModal() {
  document.getElementById("facitModal").classList.add("open");
}

function closeFacitModal() {
  document.getElementById("facitModal").classList.remove("open");
}

// Reset Zoom & View
function resetZoom() {
  resetHighlights();
  selectedNodeId = null;
  updateSidebar(null);
  network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
}

// High-Res Image Export
function exportAsPNG() {
  const container = document.getElementById("mynetwork");
  const canvas = container.querySelector("canvas");
  
  if (canvas) {
    const imageURL = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageURL;
    downloadLink.download = `CV-Neural-Network-${currentMode.toUpperCase()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } else {
    alert("Kunde inte generera bild från canvas.");
  }
}
