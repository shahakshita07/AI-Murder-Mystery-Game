// Game Data - Three Storylines
const STORYLINES = {
  mansion: {
      title: "🎭 Ashford Mansion Investigation",
      victim: "Lord Reginald Ashford",
      
      mansion_layout: {
          "Hall": { connections: ["Study", "Dining Room", "Conservatory"], clue: "", hazard: "", position: {x: 2, y: 2} },
          "Study": { connections: ["Hall", "Library"], clue: "Suspicious ledger with payments to Chef", hazard: "", position: {x: 1, y: 2} },
          "Library": { connections: ["Study"], clue: "Bloodstained glove (belongs to Heiress)", hazard: "", position: {x: 0, y: 2} },
          "Dining Room": { connections: ["Hall", "Kitchen"], clue: "Shattered wine glass (Butler broke it)", hazard: "", position: {x: 2, y: 1} },
          "Kitchen": { connections: ["Dining Room", "Cellar"], clue: "Missing knife (red herring)", hazard: "", warnings: ["You smell gas from the Cellar"], position: {x: 3, y: 1} },
          "Cellar": { connections: ["Kitchen"], clue: "", hazard: "Gas leak", position: {x: 4, y: 1} },
          "Conservatory": { connections: ["Hall", "Secret Passage"], clue: "", hazard: "", warnings: ["You hear rumbling from the Secret Passage"], position: {x: 2, y: 3} },
          "Secret Passage": { connections: ["Conservatory"], clue: "", hazard: "May collapse", position: {x: 1, y: 3} }
      },
      suspects: {
          "Butler": { name: "James", personality: "Calm, polite, but evasive", guilty: false, suspicion_level: 3 },
          "Maid": { name: "Clara", personality: "Nervous and chatty", guilty: false, suspicion_level: 2 },
          "Chef": { name: "Marco", personality: "Defensive and grumpy", guilty: false, suspicion_level: 4 },
          "Heiress": { name: "Sophia", personality: "Elegant, clever, manipulative", guilty: true, suspicion_level: 1 }
      },
      solution: { murderer: "Heiress", weapon: "Poison", location: "Dining Room", motive: "Inheritance" }
  },
  gala: {
      title: "🔍 Midnight Gala Investigation",
      victim: "Lady Evelyn Crowhurst",
      mansion_layout: {
          "Ballroom": { connections: ["Backstage", "Private Lounge", "Kitchen"], clue: "", hazard: "", position: {x: 2, y: 2} },
          "Backstage": { connections: ["Ballroom", "Dressing Room", "Storage"], clue: "Sheet music with threatening messages", hazard: "", warnings: ["You smell chemicals"], position: {x: 1, y: 2} },
          "Dressing Room": { connections: ["Backstage", "Roof Terrace"], clue: "Guest list with names crossed out", hazard: "", position: {x: 0, y: 2} },
          "Private Lounge": { connections: ["Ballroom", "Kitchen"], clue: "Broken champagne glass with poison", hazard: "", position: {x: 2, y: 1} },
          "Kitchen": { connections: ["Ballroom", "Private Lounge"], clue: "Cut security wires (red herring)", hazard: "", position: {x: 3, y: 2} },
          "Storage": { connections: ["Backstage"], clue: "", hazard: "Dangerous equipment", position: {x: 1, y: 1} },
          "Roof Terrace": { connections: ["Dressing Room"], clue: "", hazard: "High fall risk", position: {x: 0, y: 1} }
      },
      suspects: {
          "Duke": { name: "Alistair", personality: "Arrogant aristocrat", guilty: false, suspicion_level: 5 },
          "Actress": { name: "Bianca", personality: "Dramatic, jealous star", guilty: false, suspicion_level: 4 },
          "Doctor": { name: "Victor", personality: "Cold scientist", guilty: false, suspicion_level: 3 },
          "Socialite": { name: "Amelia", personality: "Charming but bitter", guilty: true, suspicion_level: 2 }
      },
      solution: { murderer: "Socialite", weapon: "Poison", location: "Private Lounge", motive: "Inheritance" }
  },
  crypt: {
      title: "👻 Crypt Keeper Investigation",
      victim: "Professor Benedict Ward",
      mansion_layout: {
          "Main Hall": { connections: ["Crypt", "Chapel", "Archives"], clue: "", hazard: "", position: {x: 2, y: 2} },
          "Crypt": { connections: ["Main Hall", "Secret Tunnel"], clue: "Ancient coins found", hazard: "Ancient traps", warnings: ["You hear clicking sounds"], position: {x: 1, y: 2} },
          "Chapel": { connections: ["Main Hall", "Archives"], clue: "Torn book pages with records", hazard: "", position: {x: 2, y: 1} },
          "Archives": { connections: ["Main Hall", "Chapel", "Library"], clue: "Forgery tools for fake relics", hazard: "", position: {x: 3, y: 1} },
          "Library": { connections: ["Archives", "Relic Room"], clue: "Staged footprints (red herring)", hazard: "", position: {x: 3, y: 2} },
          "Relic Room": { connections: ["Library", "Secret Tunnel"], clue: "", hazard: "", position: {x: 4, y: 2} },
          "Secret Tunnel": { connections: ["Crypt", "Relic Room", "Basement"], clue: "", hazard: "", warnings: ["You see broken boards"], position: {x: 1, y: 1} },
          "Basement": { connections: ["Secret Tunnel"], clue: "", hazard: "Unstable floor", position: {x: 0, y: 1} }
      },
      suspects: {
          "Historian": { name: "Nora", personality: "Obsessed with artifacts", guilty: false, suspicion_level: 4 },
          "Groundskeeper": { name: "Oliver", personality: "Quiet, lurking", guilty: false, suspicion_level: 3 },
          "Author": { name: "Penelope", personality: "Writes horror novels", guilty: false, suspicion_level: 2 },
          "Treasurer": { name: "Harold", personality: "Greedy, numbers-obsessed", guilty: true, suspicion_level: 5 }
      },
      solution: { murderer: "Treasurer", weapon: "Blunt object", location: "Crypt", motive: "Relic smuggling" }
  }
};

let gameState = {
  currentStory: null,
  currentRoom: '',
  cluesFound: [],
  suspectsInterrogated: [],
  confidence: 0,
  gameStarted: false
};

// Utility for suspect icon (optional, personal flair)
function getSuspectIcon(role) {
    if (/butler/i.test(role)) return "🤵";
    if (/maid/i.test(role)) return "👩";
    if (/chef/i.test(role)) return "👨‍🍳";
    if (/heiress/i.test(role)) return "👑";
    if (/duke/i.test(role)) return "👑";
    if (/actress/i.test(role)) return "🎭";
    if (/doctor/i.test(role)) return "🧪";
    if (/socialite/i.test(role)) return "💍";
    if (/historian/i.test(role)) return "🕵️‍♂️";
    if (/groundskeeper/i.test(role)) return "🧹";
    if (/author/i.test(role)) return "🖋️";
    if (/treasurer/i.test(role)) return "💼";
    return "";
}
function getSuspicionText(level) {
    if (level <= 1) return "Very Low";
    if (level === 2) return "Low";
    if (level === 3) return "Medium";
    if (level === 4) return "High";
    return "Very High";
}

// Init and main logic
function selectRandomStory() {
    const stories = Object.keys(STORYLINES);
    const key = stories[Math.floor(Math.random() * stories.length)];
    gameState.currentStory = STORYLINES[key];
    gameState.currentRoom = Object.keys(gameState.currentStory.mansion_layout)[0];
}

function startGame() {
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('active');
    gameState.gameStarted = true;
    selectRandomStory();
    initializeGame();
}
function initializeGame() {
    renderMansion();
    renderEvidence();
    renderSuspects();    // NEW: always call this!
    updateGameStatus();
    updateSuspectRankings();
    renderAccusationButtons();
}
function bfsPath(start, goal) {
    const mansion = gameState.currentStory.mansion_layout;
    if (start === goal) return [start];
    const queue = [[start, [start]]];
    const visited = new Set([start]);
    while (queue.length > 0) {
        const [current, path] = queue.shift();
        for (const neighbor of mansion[current].connections) {
            if (!visited.has(neighbor)) {
                const newPath = [...path, neighbor];
                if (neighbor === goal) return newPath;
                visited.add(neighbor);
                queue.push([neighbor, newPath]);
            }
        }
    }
    return null;
}
function calculateConfidence() {
    let total = 0, guilty = 0;
    gameState.cluesFound.forEach(clue => {
        total += 10;
        const murderer = gameState.currentStory.solution.murderer.toLowerCase();
        if (clue && (clue.toLowerCase().includes(murderer) || clue.includes('glove') || clue.includes('glass') || clue.includes('coins') || clue.includes('forgery')))
            guilty += 10;
    });
    return total > 0 ? Math.min(100, Math.round((guilty / total) * 100)) : 0;
}
function checkHazards(room) {
    const roomData = gameState.currentStory.mansion_layout[room];
    const warnings = roomData.warnings || [];
    const safe = !roomData.hazard;
    return { safe, warnings, hazardType: roomData.hazard };
}
function renderMansion() {
    const mapContainer = document.getElementById('mansion-grid');
    const mansion = gameState.currentStory.mansion_layout;
    mapContainer.innerHTML = '';
    const grid = Array(4).fill().map(() => Array(5).fill(null));
    Object.entries(mansion).forEach(([roomName, roomData]) => {
        const {x, y} = roomData.position;
        grid[y][x] = roomName;
    });
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 5; x++) {
            const roomDiv = document.createElement('div');
            const roomName = grid[y][x];
            if (roomName) {
                roomDiv.className = 'room';
                roomDiv.textContent = roomName;
                roomDiv.onclick = () => navigateToRoom(roomName);
                if (roomName === gameState.currentRoom) roomDiv.classList.add('current');
                const roomData = mansion[roomName];
                if (roomData.clue && !gameState.cluesFound.includes(roomData.clue)) { roomDiv.classList.add('has-clue'); }
                if (roomData.hazard) roomDiv.classList.add('hazardous');
                const currentRoomData = mansion[gameState.currentRoom];
                if (currentRoomData.connections.includes(roomName)) roomDiv.classList.add('accessible');
            } else {
                roomDiv.className = 'room';
                roomDiv.style.visibility = 'hidden';
            }
            mapContainer.appendChild(roomDiv);
        }
    }
}

function renderEvidence() {
    const container = document.getElementById('evidence-list');
    if (gameState.cluesFound.length === 0) {
        container.innerHTML = '<p class="no-evidence">No evidence collected yet...</p>';
        return;
    }
    container.innerHTML = '';
    gameState.cluesFound.forEach((clue, i) => {
        const div = document.createElement('div');
        div.className = 'evidence-item';
        div.innerHTML = `<h5>Evidence ${i + 1}</h5><p>${clue}</p>`;
        container.appendChild(div);
    });
}
function renderSuspects() {
    const suspectsContainer = document.getElementById('suspects-grid');
    const suspects = gameState.currentStory.suspects;
    suspectsContainer.innerHTML = '';
    Object.entries(suspects).forEach(([role, data]) => {
        const suspectDiv = document.createElement('div');
        suspectDiv.className = 'suspect-card';
        suspectDiv.innerHTML = `
            <div class="suspect-header">
                <h4>${getSuspectIcon(role)} ${role} ${data.name ? data.name : ""}</h4>
                <span class="suspicion-meter" data-level="${data.suspicion_level}">Suspicion: ${getSuspicionText(data.suspicion_level)}</span>
            </div>
            <p class="suspect-trait">${data.personality}</p>
            <button class="btn btn--secondary btn--sm" data-suspect="${role}">Interrogate</button>
        `;
        suspectsContainer.appendChild(suspectDiv);
    });
    // Attach listeners for interrogate dynamically
    document.querySelectorAll('[data-suspect]').forEach(btn => {
        btn.onclick = () => interrogateSuspect(btn.getAttribute('data-suspect'));
    });
}
function updateGameStatus() {
    document.getElementById('current-room').textContent = gameState.currentRoom;
    document.getElementById('clues-found').textContent = `${gameState.cluesFound.length}/4`;
    const confidence = calculateConfidence();
    gameState.confidence = confidence;
    document.getElementById('confidence').textContent = `${confidence}%`;
    document.getElementById('accusation-btn').disabled = gameState.cluesFound.length < 0;
}
function navigateToRoom(roomName) {
    const mansion = gameState.currentStory.mansion_layout;
    const currentRoomData = mansion[gameState.currentRoom];
    if (!currentRoomData.connections.includes(roomName) && roomName !== gameState.currentRoom) {
        alert(`Cannot reach ${roomName} from ${gameState.currentRoom}. Rooms are not connected!`);
        return;
    }
    const path = bfsPath(gameState.currentRoom, roomName);
    if (!path) { alert('No path found!'); return; }
    const hazardCheck = checkHazards(roomName);
    const warningsDiv = document.getElementById('hazard-warnings');
    if (hazardCheck.warnings.length > 0) {
        warningsDiv.innerHTML = `<p>⚠️ ${hazardCheck.warnings.join(' ')}</p>`;
        warningsDiv.classList.add('show');
    } else { warningsDiv.classList.remove('show'); }
    if (!hazardCheck.safe) {
        if (confirm(`⚠️ DANGER: ${hazardCheck.hazardType}! Enter anyway?`)) {
            alert('💀 Game Over! You succumbed to the hazard.');
            restartGame();
            return;
        } else return;
    }
    gameState.currentRoom = roomName;
    const pathDisplay = document.getElementById('path-display');
    if (pathDisplay) pathDisplay.textContent = `BFS Path: ${path.join(' → ')} (${path.length - 1} steps)`;
    const roomData = mansion[roomName];
    if (roomData.clue && !gameState.cluesFound.includes(roomData.clue)) {
        gameState.cluesFound.push(roomData.clue);
        alert(`🔍 CLUE FOUND: ${roomData.clue}`);
        renderEvidence();
        updateSuspectRankings();
    }
    updateGameStatus();
    renderMansion();
}
function interrogateSuspect(name) {
    const suspect = gameState.currentStory.suspects[name];
    alert(`🕵️ Interrogating ${name} (${suspect.name}):\n\n"${suspect.personality}"\n\nSuspicion: ${suspect.suspicion_level}/10`);
    if (!gameState.suspectsInterrogated.includes(name)) gameState.suspectsInterrogated.push(name);
}
function updateSuspectRankings() {
    const container = document.getElementById('suspect-rankings');
    const suspects = gameState.currentStory.suspects;
    const sorted = Object.entries(suspects).sort((a, b) => b[1].suspicion_level - a[1].suspicion_level);
    container.innerHTML = '';
    sorted.forEach(([role, data]) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        const icon = data.guilty ? '🔴' : '⚪';
        div.innerHTML = `<span>${icon} ${role}</span><span class="ranking-score">${data.suspicion_level}/10</span>`;
        container.appendChild(div);
    });
}
// Dynamic rendering for accusation modal
function renderAccusationButtons() {
    const container = document.getElementById('accusation-buttons');
    const suspects = gameState.currentStory.suspects;
    container.innerHTML = "";
    Object.entries(suspects).forEach(([role, data]) => {
        const btn = document.createElement('button');
        btn.className = "btn btn--outline";
        btn.innerText = (data.name ? `${role} ${data.name}` : role);
        btn.onclick = () => submitAccusation(role);
        container.appendChild(btn);
    });
}
function makeAccusation() {
    renderAccusationButtons();
    document.getElementById('accusation-modal').classList.remove('hidden');
}
function submitAccusation(accused) {
    const solution = gameState.currentStory.solution;
    const modal = document.getElementById('accusation-modal');
    const resultModal = document.getElementById('result-modal');
    const resultContent = document.getElementById('result-content');
    const resultTitle = document.getElementById('result-title');
    modal.classList.add('hidden');
    if (accused === solution.murderer) {
        resultTitle.textContent = '🎉 Case Solved!';
        resultContent.innerHTML = `
            <p class="result-success"><strong>Congratulations!</strong> You identified ${accused} as the murderer.</p>
            <div class="solution-details">
                <h4>Solution:</h4>
                <ul>
                    <li><strong>Murderer:</strong> ${solution.murderer}</li>
                    <li><strong>Weapon:</strong> ${solution.weapon}</li>
                    <li><strong>Location:</strong> ${solution.location}</li>
                    <li><strong>Motive:</strong> ${solution.motive}</li>
                </ul>
                <p><strong>Performance:</strong> ${gameState.confidence}% confidence, ${gameState.cluesFound.length}/4 clues</p>
            </div>
        `;
    } else {
        resultTitle.textContent = '❌ Wrong Accusation';
        resultContent.innerHTML = `
            <p class="result-failure"><strong>Incorrect!</strong> The real murderer was ${solution.murderer}.</p>
            <div class="solution-details">
                <ul>
                    <li><strong>Weapon:</strong> ${solution.weapon}</li>
                    <li><strong>Location:</strong> ${solution.location}</li>
                    <li><strong>Motive:</strong> ${solution.motive}</li>
                </ul>
            </div>
        `;
    }
    resultModal.classList.remove('hidden');
}
function closeInterrogation() { document.getElementById('interrogation-modal').classList.add('hidden'); }
function continueInterrogation() { closeInterrogation(); }
function restartGame() {
    gameState = { currentStory: null, currentRoom: '', cluesFound: [], suspectsInterrogated: [], confidence: 0, gameStarted: false };
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('accusation-modal').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('welcome-screen').classList.add('active');
    document.getElementById('mansion-grid').innerHTML = '';
    document.getElementById('evidence-list').innerHTML = '<p class="no-evidence">No evidence collected yet...</p>';
    document.getElementById('suspect-rankings').innerHTML = '';
    document.getElementById('suspects-grid').innerHTML = '';
}
document.addEventListener('DOMContentLoaded', function() {
    renderEvidence();
});
