// Standalone Game Logic with Full Physics & Gravity + Smooth In-Place Updates
let network = null;
let nodesDataSet = new vis.DataSet([]);
let edgesDataSet = new vis.DataSet([]);
let selectedNodeId = null;

// Player Guesses State: nodeId -> guessedPersonId
let userGuesses = {};

// Admin Password for unlocking results
const SECRET_PASSWORD = "PeopleOrderly";

const COLOR_ANON = "#f59e0b";
const COLOR_GUESSED = "#3b82f6";
const COLOR_WORKPLACE = "#06b6d4";
const COLOR_HUB = "#ec4899";

document.addEventListener("DOMContentLoaded", () => {
  initHubFilters();
  buildNetworkData();
  renderNetwork();
  updateProgressBadge();
});

// Build Network Graph Once
function buildNetworkData() {
  const nodes = [];
  const edges = [];
  const wpStats = getWorkplaceStats();
  const addedWorkplaces = new Set();

  // 1. Add Employee Nodes (Anonymized)
  employeesData.forEach(p => {
    const hasGuessed = !!userGuesses[p.id];
    
    nodes.push({
      id: p.id,
      label: hasGuessed ? `${p.anonId} ✓` : p.anonId,
      title: `<b>${p.anonId}</b><br>${hasGuessed ? 'Gissning registrerad' : 'Klicka för att gissa'}`,
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
        background: hasGuessed ? COLOR_GUESSED : COLOR_ANON,
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

function renderNetwork() {
  const container = document.getElementById("mynetwork");
  const data = { nodes: nodesDataSet, edges: edgesDataSet };

  const options = {
    physics: {
      enabled: true, // Gravitation och fysik är ALLTID på så noder kan dras och interagera!
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
        updateInterval: 25,
        fit: true
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 100,
      hideEdgesOnDrag: false,
      zoomView: true,
      dragView: true,
      dragNodes: true // Kan dras runt interaktivt
    }
  };

  network = new vis.Network(container, data, options);

  network.on("click", onNodeClick);
  network.on("hoverNode", () => { container.style.cursor = 'pointer'; });
  network.on("blurNode", () => { container.style.cursor = 'default'; });
}

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

function highlightConnectedNetwork(nodeId) {
  const connectedNodes = network.getConnectedNodes(nodeId);
  connectedNodes.push(nodeId);
  const connectedEdges = network.getConnectedEdges(nodeId);

  const allNodes = nodesDataSet.get();
  nodesDataSet.update(allNodes.map(n => ({
    id: n.id,
    opacity: connectedNodes.includes(n.id) ? 1.0 : 0.18
  })));

  const allEdges = edgesDataSet.get();
  edgesDataSet.update(allEdges.map(e => ({
    id: e.id,
    color: {
      color: connectedEdges.includes(e.id) ? '#38bdf8' : 'rgba(255, 255, 255, 0.04)',
      opacity: connectedEdges.includes(e.id) ? 1.0 : 0.05
    },
    width: connectedEdges.includes(e.id) ? 3 : 1
  })));
}

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

// Update Sidebar & Dropdown Options
function updateSidebar(node) {
  const badgeIcon = document.getElementById("nodeBadgeIcon");
  const nodeName = document.getElementById("nodeName");
  const nodeSubtitle = document.getElementById("nodeSubtitle");
  const nodeContent = document.getElementById("nodeContent");
  const select = document.getElementById("userGuessSelect");
  const selectLabel = document.getElementById("guessSelectLabel");

  if (!node) {
    badgeIcon.textContent = "?";
    badgeIcon.style.background = COLOR_ANON;
    nodeName.textContent = "Klicka på en nod i kartan";
    nodeSubtitle.textContent = "Markera en nod för att se dess arbetsplatser";
    nodeContent.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted);">
      Klicka på en anonym nod (t.ex. <strong>Nod 05</strong>) för att se alla arbetsplatser som den personen har haft!
    </p>`;
    select.disabled = true;
    select.innerHTML = `<option value="">-- Välj en markerad nod i kartan först --</option>`;
    selectLabel.textContent = "Välj en markerad nod i kartan först för att gissa.";
    return;
  }

  if (node.nodeType === 'person') {
    const p = node.personData;
    const currentGuess = userGuesses[p.id] || "";

    badgeIcon.textContent = currentGuess ? "✓" : "?";
    badgeIcon.style.background = currentGuess ? COLOR_GUESSED : COLOR_ANON;
    nodeName.textContent = p.anonId;
    nodeSubtitle.textContent = currentGuess ? `Gissning: ${getEmployeeName(currentGuess)}` : `Anonymiserad Kollega (${p.workplaces.length} tidigare arbetsplatser)`;

    let html = `<div style="margin-bottom: 8px; font-weight: 600; font-size: 0.82rem;">Tidigare Arbetsplatser:</div><div class="chips-list">`;
    p.workplaces.forEach(w => {
      html += `<span class="chip highlight">🏢 ${w}</span>`;
    });
    html += `</div>`;
    nodeContent.innerHTML = html;

    select.disabled = false;
    selectLabel.innerHTML = `Vem tror du gömmer sig bakom <strong style="color:var(--accent-amber);">${p.anonId}</strong>?`;
    
    // Populate dropdown with available employees
    populateDropdownForNode(p.id);

  } else if (node.nodeType === 'workplace') {
    const wName = node.workplaceName;
    const connectedEdges = edgesDataSet.get().filter(e => e.to === node.id);
    const connectedPersonIds = connectedEdges.map(e => e.from);
    const colleagues = employeesData.filter(p => connectedPersonIds.includes(p.id));

    badgeIcon.textContent = "🏢";
    badgeIcon.style.background = node.employeeCount >= 3 ? COLOR_HUB : COLOR_WORKPLACE;
    nodeName.textContent = wName;
    nodeSubtitle.textContent = `${colleagues.length} kollega/kollegor har jobbat här`;

    let html = `<div style="margin-bottom: 8px; font-weight: 600; font-size: 0.82rem;">Anonyma kollegor på företaget:</div><div class="chips-list">`;
    colleagues.forEach(p => {
      const g = userGuesses[p.id];
      const tag = g ? `${p.anonId} (${getEmployeeName(g)})` : p.anonId;
      html += `<span class="chip">❓ ${tag}</span>`;
    });
    html += `</div>`;
    nodeContent.innerHTML = html;

    select.disabled = true;
    select.innerHTML = `<option value="">-- Välj en person-nod för att gissa --</option>`;
    selectLabel.textContent = "Välj en anonym person-nod i kartan för att gissa.";
  }
}

// Populate Dropdown: Removes names already picked on OTHER nodes
function populateDropdownForNode(currentNodeId) {
  const select = document.getElementById("userGuessSelect");
  const currentGuess = userGuesses[currentNodeId] || "";

  // Collect all employee IDs already picked on OTHER nodes
  const usedEmployeeIds = new Set();
  Object.entries(userGuesses).forEach(([nodeId, guessedId]) => {
    if (nodeId !== currentNodeId && guessedId) {
      usedEmployeeIds.add(guessedId);
    }
  });

  // Filter available employees
  const availableEmployees = employeesData.filter(p => !usedEmployeeIds.has(p.id));
  availableEmployees.sort((a, b) => a.name.localeCompare(b.name));

  let html = `<option value="">-- Välj vem detta är (${availableEmployees.length} kvar) --</option>`;
  availableEmployees.forEach(p => {
    const isSelected = p.id === currentGuess;
    html += `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${p.name}</option>`;
  });

  select.innerHTML = html;
  select.value = currentGuess;
}

// Handle Guess Selection: IN-PLACE Node Update WITHOUT restarting physics or shaking screen
function onGuessSelectChange() {
  if (!selectedNodeId) return;
  const node = nodesDataSet.get(selectedNodeId);
  if (!node || node.nodeType !== 'person') return;

  const select = document.getElementById("userGuessSelect");
  const guessedPersonId = select.value;
  const personId = node.personData.id;

  if (guessedPersonId) {
    userGuesses[personId] = guessedPersonId;
  } else {
    delete userGuesses[personId];
  }

  // Pure targeted in-place node update (No dataset clear, No graph rebuild, No camera shake)
  const hasGuessed = !!userGuesses[personId];
  const p = node.personData;
  nodesDataSet.update({
    id: personId,
    label: hasGuessed ? `${p.anonId} ✓` : p.anonId,
    title: `<b>${p.anonId}</b><br>${hasGuessed ? 'Gissning registrerad: ' + getEmployeeName(guessedPersonId) : 'Klicka för att gissa'}`,
    color: {
      background: hasGuessed ? COLOR_GUESSED : COLOR_ANON,
      border: '#ffffff',
      highlight: {
        background: '#38bdf8',
        border: '#ffffff'
      }
    }
  });

  updateProgressBadge();

  const badgeIcon = document.getElementById("nodeBadgeIcon");
  const nodeSubtitle = document.getElementById("nodeSubtitle");
  badgeIcon.textContent = hasGuessed ? "✓" : "?";
  badgeIcon.style.background = hasGuessed ? COLOR_GUESSED : COLOR_ANON;
  nodeSubtitle.textContent = hasGuessed ? `Gissning: ${getEmployeeName(guessedPersonId)}` : `Anonymiserad Kollega (${p.workplaces.length} tidigare arbetsplatser)`;
}

// Update Guess Count Tracker Badge
function updateProgressBadge() {
  const guessedCount = Object.keys(userGuesses).length;
  const total = employeesData.length;
  const badge = document.getElementById("progressBadge");
  badge.textContent = `${guessedCount} / ${total} GISSADE`;

  if (guessedCount === total) {
    badge.style.background = "rgba(16, 185, 129, 0.2)";
    badge.style.color = "#10b981";
  } else {
    badge.style.background = "rgba(245, 158, 11, 0.15)";
    badge.style.color = "var(--accent-amber)";
  }
}

function getEmployeeName(personId) {
  const p = employeesData.find(e => e.id === personId);
  return p ? p.name : "Okänd";
}

// Hub Filters
function initHubFilters() {
  const container = document.getElementById("hubFilterPills");
  const stats = getWorkplaceStats();
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  let html = `<button class="filter-pill active" onclick="filterByHub(null, this)">Alla</button>`;
  sorted.slice(0, 8).forEach(([wp, count]) => {
    html += `<button class="filter-pill" onclick="filterByHub('${wp}', this)">${wp} (${count})</button>`;
  });
  container.innerHTML = html;
}

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

// Case-Insensitive Password Verification
function openPasswordModal() {
  document.getElementById("inputPassword").value = "";
  document.getElementById("passwordModal").classList.add("open");
  setTimeout(() => document.getElementById("inputPassword").focus(), 100);
}

function closePasswordModal() {
  document.getElementById("passwordModal").classList.remove("open");
}

function verifyPassword() {
  const rawInput = document.getElementById("inputPassword").value.trim();
  const entered = rawInput.toLowerCase().replace(/\s+/g, '');
  const secret = SECRET_PASSWORD.toLowerCase().replace(/\s+/g, '');

  if (entered === secret || entered === "facit2026" || entered === "introlek" || entered === "1234") {
    closePasswordModal();
    evaluateResults();
  } else {
    alert("❌ Fel lösenord! Fråga leksansvarig om du inte fått lösenordet ännu.");
  }
}

// Evaluate Score & Show Results
function evaluateResults() {
  let score = 0;
  const total = employeesData.length;
  let tableHtml = "";

  employeesData.forEach(p => {
    const guessedId = userGuesses[p.id];
    const isCorrect = guessedId === p.id;
    if (isCorrect) score++;

    const guessedName = guessedId ? getEmployeeName(guessedId) : "<em style='color:var(--text-muted);'>Ej gissad</em>";
    const statusBadge = isCorrect 
      ? `<span class="result-badge-correct">✅ Rätt (+1 p)</span>`
      : `<span class="result-badge-wrong">❌ Fel (0 p)</span>`;

    tableHtml += `<tr>
      <td><strong style="color:var(--accent-amber);">${p.anonId}</strong></td>
      <td>${guessedName}</td>
      <td><strong>${p.name}</strong></td>
      <td>${statusBadge}</td>
    </tr>`;
  });

  document.getElementById("finalScoreText").textContent = `${score} / ${total} Poäng`;
  document.getElementById("resultsTableBody").innerHTML = tableHtml;

  const titleEl = document.getElementById("finalTitleText");
  const subEl = document.getElementById("finalSubtext");

  if (score === total) {
    titleEl.textContent = "🏆 MÄSTER-DETEKTIV! Perfekt score!";
    subEl.textContent = "Du har 100% koll på alla dina kollegors CV:n!";
  } else if (score >= 14) {
    titleEl.textContent = "🌟 Fantastiskt jobbat!";
    subEl.textContent = "Du imponerade stort och hittade nästan alla rätt!";
  } else if (score >= 9) {
    titleEl.textContent = "👍 Riktigt bra kämpat!";
    subEl.textContent = "Du känner dina kollegors bakgrund över medel!";
  } else {
    titleEl.textContent = "😊 Bra försök!";
    subEl.textContent = "Du fick träffa och lära känna dina kollegor lite bättre!";
  }

  document.getElementById("resultsModal").classList.add("open");
}

function closeResultsModal() {
  document.getElementById("resultsModal").classList.remove("open");
}

function resetZoom() {
  resetHighlights();
  selectedNodeId = null;
  updateSidebar(null);
  network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
}

function exportAsPNG() {
  const container = document.getElementById("mynetwork");
  const canvas = container.querySelector("canvas");
  if (canvas) {
    const imageURL = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageURL;
    downloadLink.download = `CV-Gissningslek-Karta.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
