// Game Data
const gameData = {
  mansion_layout: {
    "Hall": {
      connections: ["Study", "Dining Room", "Conservatory"],
      clue: "",
      hazard: "",
      position: {x: 2, y: 2}
    },
    "Study": {
      connections: ["Hall", "Library"],
      clue: "Suspicious ledger with payments to Chef",
      hazard: "",
      position: {x: 1, y: 2}
    },
    "Library": {
      connections: ["Study"],
      clue: "Bloodstained glove (belongs to Heiress)",
      hazard: "",
      position: {x: 0, y: 2}
    },
    "Dining Room": {
      connections: ["Hall", "Kitchen"],
      clue: "Shattered wine glass (Butler broke it)",
      hazard: "",
      position: {x: 2, y: 1}
    },
    "Kitchen": {
      connections: ["Dining Room", "Cellar"],
      clue: "Missing knife (red herring)",
      hazard: "",
      warnings: ["You smell gas from the Cellar"],
      position: {x: 3, y: 1}
    },
    "Cellar": {
      connections: ["Kitchen"],
      clue: "",
      hazard: "Gas leak - entering without caution = game over",
      position: {x: 4, y: 1}
    },
    "Conservatory": {
      connections: ["Hall", "Secret Passage"],
      clue: "",
      hazard: "",
      warnings: ["You hear rumbling from the Secret Passage"],
      position: {x: 2, y: 3}
    },
    "Secret Passage": {
      connections: ["Conservatory"],
      clue: "",
      hazard: "May collapse - you hear rumbling nearby",
      position: {x: 1, y: 3}
    }
  },
  suspects: {
    "Butler": {
      name: "James",
      personality: "Calm, polite, but evasive",
      guilty: false,
      suspicion_level: 3,
      dialogue: {
        initial: "I was in the Dining Room polishing silverware when the Master collapsed.",
        questions: {
          wine_glass: {
            truth: "Yes, I dropped it in panic after he collapsed. I should have said so earlier.",
            lie: "No, I never touched it!"
          },
          cellar: {
            truth: "Briefly... but the fumes drove me out. It's unsafe down there.",
            lie: "I never went to the Cellar."
          }
        }
      }
    },
    "Maid": {
      name: "Clara",
      personality: "Nervous and chatty",
      guilty: false,
      suspicion_level: 2,
      dialogue: {
        initial: "I was dusting the Library. I don't know what happened in the Dining Room.",
        questions: {
          library: {
            truth: "Fine... I saw the Heiress slip into the Library earlier. She dropped a glove.",
            lie: "I saw nothing unusual in the Library."
          },
          chef: {
            truth: "The Chef had knives, but I don't think he's the killer.",
            lie: "Yes, maybe it was the Chef... he had knives!"
          }
        }
      }
    },
    "Chef": {
      name: "Marco",
      personality: "Defensive and grumpy",
      guilty: false,
      suspicion_level: 4,
      dialogue: {
        initial: "I was in the Kitchen preparing food. The Master asked for a late-night drink.",
        questions: {
          knife: {
            truth: "Yes, but knives don't shatter wine glasses. Someone wants me framed.",
            lie: "All my knives are accounted for!"
          },
          wine: {
            truth: "The Heiress insisted on a special bottle from the cellar stores.",
            lie: "I served wine but never touched the glass."
          }
        }
      }
    },
    "Heiress": {
      name: "Sophia",
      personality: "Elegant, clever, manipulative",
      guilty: true,
      suspicion_level: 1,
      dialogue: {
        initial: "I was reading in the Study. My father called for wine, but I never saw him.",
        questions: {
          glove: {
            truth: "Maybe I was in the Conservatory briefly... what are you implying?",
            lie: "Impossible! The Maid must be lying... she's always clumsy."
          },
          wine: {
            truth: "You'll never prove it. The estate is mine now regardless.",
            lie: "Nonsense. The Chef is covering for his own mistakes."
          }
        }
      }
    }
  },
  clues: [
    {
      name: "Bloodstained Glove",
      location: "Library",
      description: "A lady's glove with bloodstains, belongs to Heiress",
      points_against: "Heiress",
      weight: 8
    },
    {
      name: "Shattered Wine Glass",
      location: "Dining Room",
      description: "Wine glass broken accidentally by Butler",
      points_against: "Nobody",
      weight: 5
    },
    {
      name: "Suspicious Ledger",
      location: "Study",
      description: "Shows payments from Heiress to Chef for silence",
      points_against: "Heiress",
      weight: 6
    },
    {
      name: "Missing Knife",
      location: "Kitchen",
      description: "Red herring - not the murder weapon",
      points_against: "Nobody",
      weight: 9
    }
  ]
};

// Game State
let gameState = {
  currentRoom: "Hall",
  visitedRooms: new Set(["Hall"]),
  collectedClues: [],
  interrogatedSuspects: new Set(),
  gameOver: false,
  confidence: 0
};

// BFS Pathfinding Algorithm
function bfsPath(start, end) {
  if (start === end) return [start];
  
  const queue = [[start]];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const currentRoom = path[path.length - 1];
    
    const connections = gameData.mansion_layout[currentRoom].connections;
    
    for (const neighbor of connections) {
      if (neighbor === end) {
        return [...path, neighbor];
      }
      
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  
  return null; // No path found
}

// Wumpus Inference System
function checkHazards(room) {
  const warnings = [];
  const roomData = gameData.mansion_layout[room];
  
  if (roomData.warnings) {
    warnings.push(...roomData.warnings);
  }
  
  // Check connections for hazards
  for (const connection of roomData.connections) {
    const connectedRoom = gameData.mansion_layout[connection];
    if (connectedRoom.hazard) {
      if (connection === "Cellar") {
        warnings.push("⚠️ You smell gas nearby - the Cellar may be dangerous!");
      }
      if (connection === "Secret Passage") {
        warnings.push("⚠️ You hear ominous rumbling - the Secret Passage seems unstable!");
      }
    }
  }
  
  return warnings;
}

// Constraint Satisfaction Problem - Suspect Ranking
function calculateSuspectRankings() {
  const rankings = {};
  
  // Initialize all suspects with base suspicion
  Object.keys(gameData.suspects).forEach(suspect => {
    rankings[suspect] = gameData.suspects[suspect].suspicion_level;
  });
  
  // Add evidence weights
  gameState.collectedClues.forEach(clueName => {
    const clueData = gameData.clues.find(c => c.name === clueName);
    if (clueData && clueData.points_against !== "Nobody") {
      const suspect = clueData.points_against;
      rankings[suspect] = (rankings[suspect] || 0) + clueData.weight;
    }
  });
  
  // Convert to sorted array
  const sortedRankings = Object.entries(rankings)
    .sort((a, b) => b[1] - a[1])
    .map(([suspect, score]) => ({suspect, score}));
  
  return sortedRankings;
}

// Minimax Algorithm for Interrogation
function minimaxInterrogation(suspect, question, depth = 0, isMaximizing = true, alpha = -Infinity, beta = Infinity) {
  const suspectData = gameData.suspects[suspect];
  
  if (depth === 2) {
    // Terminal node - return heuristic value
    return suspectData.guilty ? -10 : 5;
  }
  
  if (isMaximizing) {
    // Detective's turn - trying to get truth
    let maxEval = -Infinity;
    
    // Try truth response
    const truthValue = minimaxInterrogation(suspect, question, depth + 1, false, alpha, beta);
    maxEval = Math.max(maxEval, truthValue);
    alpha = Math.max(alpha, truthValue);
    
    if (beta <= alpha) {
      return maxEval; // Alpha-beta pruning
    }
    
    return maxEval;
  } else {
    // Suspect's turn - trying to avoid suspicion
    let minEval = Infinity;
    
    const suspicionLevel = suspectData.suspicion_level;
    const lieChance = suspectData.guilty ? 0.8 : 0.3;
    
    // Suspect chooses lie or truth based on their guilt
    if (Math.random() < lieChance) {
      const lieValue = minimaxInterrogation(suspect, question, depth + 1, true, alpha, beta);
      minEval = Math.min(minEval, lieValue - suspicionLevel);
    } else {
      const truthValue = minimaxInterrogation(suspect, question, depth + 1, true, alpha, beta);
      minEval = Math.min(minEval, truthValue + suspicionLevel);
    }
    
    beta = Math.min(beta, minEval);
    
    if (beta <= alpha) {
      return minEval; // Alpha-beta pruning
    }
    
    return minEval;
  }
}

// UI Functions
function startGame() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const gameScreen = document.getElementById('game-screen');
  
  welcomeScreen.classList.remove('active');
  welcomeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  gameScreen.classList.add('active');
  
  initializeMansion();
  updateUI();
}

function initializeMansion() {
  const grid = document.getElementById('mansion-grid');
  grid.innerHTML = '';
  
  // Create 5x4 grid
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 5; x++) {
      const cell = document.createElement('div');
      cell.className = 'room';
      
      // Find room at this position
      const room = Object.entries(gameData.mansion_layout).find(([name, data]) => 
        data.position.x === x && data.position.y === y
      );
      
      if (room) {
        const [roomName, roomData] = room;
        cell.textContent = roomName;
        cell.dataset.room = roomName;
        
        // Add classes based on room state
        if (roomName === gameState.currentRoom) {
          cell.classList.add('current');
        }
        
        if (roomData.clue && !gameState.collectedClues.includes(roomData.clue.split(' ')[0] + ' ' + roomData.clue.split(' ')[1])) {
          cell.classList.add('has-clue');
        }
        
        if (roomData.clue && gameState.collectedClues.some(clue => roomData.clue.includes(clue.split(' ')[0]))) {
          cell.classList.add('clue-found');
        }
        
        if (roomData.hazard) {
          cell.classList.add('hazardous');
        }
        
        // Check if accessible from current room
        const currentRoomData = gameData.mansion_layout[gameState.currentRoom];
        if (currentRoomData.connections.includes(roomName)) {
          cell.classList.add('accessible');
        }
        
        cell.addEventListener('click', () => moveToRoom(roomName));
      }
      
      grid.appendChild(cell);
    }
  }
}

function moveToRoom(roomName) {
  const currentRoomData = gameData.mansion_layout[gameState.currentRoom];
  
  // Check if room is accessible
  if (!currentRoomData.connections.includes(roomName)) {
    alert("You can't reach that room from here!");
    return;
  }
  
  // Check for hazards
  const roomData = gameData.mansion_layout[roomName];
  if (roomData.hazard) {
    if (!confirm(`Warning: ${roomData.hazard}\n\nAre you sure you want to enter?`)) {
      return;
    }
    
    // Game over for hazardous rooms
    alert("💀 You have been overcome by the hazard! Game Over!");
    gameState.gameOver = true;
    showGameResult(false, "You succumbed to a hazard before solving the case!");
    return;
  }
  
  // Show BFS path
  const path = bfsPath(gameState.currentRoom, roomName);
  if (path && path.length > 1) {
    document.getElementById('path-display').textContent = `BFS Path: ${path.join(' → ')}`;
  }
  
  // Move to room
  gameState.currentRoom = roomName;
  gameState.visitedRooms.add(roomName);
  
  // Collect clue if present
  if (roomData.clue && !gameState.collectedClues.some(clue => clue.includes(roomData.clue.split(' ')[0]))) {
    const clueData = gameData.clues.find(c => c.location === roomName);
    if (clueData) {
      gameState.collectedClues.push(clueData.name);
      
      // Show clue collected message
      setTimeout(() => {
        alert(`🔍 Clue Found: ${roomData.clue}`);
        updateUI();
      }, 500);
    }
  }
  
  // Check for hazard warnings
  const warnings = checkHazards(roomName);
  const warningsDiv = document.getElementById('hazard-warnings');
  if (warnings.length > 0) {
    warningsDiv.innerHTML = warnings.join('<br>');
    warningsDiv.classList.add('show');
  } else {
    warningsDiv.classList.remove('show');
  }
  
  updateUI();
}

function updateUI() {
  // Update current room
  document.getElementById('current-room').textContent = gameState.currentRoom;
  
  // Update clues found
  document.getElementById('clues-found').textContent = `${gameState.collectedClues.length}/4`;
  
  // Calculate and update confidence
  const confidence = Math.min(100, (gameState.collectedClues.length / 4) * 100);
  gameState.confidence = confidence;
  document.getElementById('confidence').textContent = `${Math.round(confidence)}%`;
  
  // Update evidence list
  updateEvidenceList();
  
  // Update suspect rankings
  updateSuspectRankings();
  
  // Update mansion grid
  initializeMansion();
  
  // Enable accusation button if enough evidence
  const accusationBtn = document.getElementById('accusation-btn');
  if (gameState.collectedClues.length >= 3) {
    accusationBtn.disabled = false;
  }
}

function updateEvidenceList() {
  const evidenceList = document.getElementById('evidence-list');
  
  if (gameState.collectedClues.length === 0) {
    evidenceList.innerHTML = '<p class="no-evidence">No evidence collected yet...</p>';
    return;
  }
  
  evidenceList.innerHTML = '';
  
  gameState.collectedClues.forEach(clueName => {
    const clueData = gameData.clues.find(c => c.name === clueName);
    if (clueData) {
      const evidenceItem = document.createElement('div');
      evidenceItem.className = 'evidence-item';
      evidenceItem.innerHTML = `
        <h5>${clueData.name}</h5>
        <p>${clueData.description}</p>
      `;
      evidenceList.appendChild(evidenceItem);
    }
  });
}

function updateSuspectRankings() {
  const rankings = calculateSuspectRankings();
  const rankingsDiv = document.getElementById('suspect-rankings');
  
  rankingsDiv.innerHTML = '';
  
  rankings.forEach((ranking, index) => {
    const rankingItem = document.createElement('div');
    rankingItem.className = 'ranking-item';
    rankingItem.innerHTML = `
      <span>${index + 1}. ${gameData.suspects[ranking.suspect].name}</span>
      <span class="ranking-score">${ranking.score}</span>
    `;
    rankingsDiv.appendChild(rankingItem);
  });
  
  // Update suspect card suspicion levels
  rankings.forEach((ranking, index) => {
    const card = document.querySelector(`[data-suspect="${ranking.suspect}"]`);
    if (card) {
      const meter = card.querySelector('.suspicion-meter');
      const level = Math.min(4, Math.max(1, Math.ceil(ranking.score / 5)));
      meter.setAttribute('data-level', level);
      
      const suspicionTexts = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
      meter.textContent = `Suspicion: ${suspicionTexts[level - 1]}`;
    }
  });
}

function interrogateSuspect(suspect) {
  gameState.interrogatedSuspects.add(suspect);
  
  const modal = document.getElementById('interrogation-modal');
  const title = document.getElementById('interrogation-title');
  const statement = document.getElementById('suspect-statement');
  const questionsSection = document.getElementById('questions-section');
  const responseSection = document.getElementById('response-section');
  const questionButtons = document.getElementById('question-buttons');
  
  const suspectData = gameData.suspects[suspect];
  
  title.textContent = `Interrogating ${suspectData.name}`;
  statement.textContent = `"${suspectData.dialogue.initial}"`;
  
  // Clear and populate questions
  questionButtons.innerHTML = '';
  responseSection.classList.add('hidden');
  questionsSection.classList.remove('hidden');
  
  Object.entries(suspectData.dialogue.questions).forEach(([questionKey, responses]) => {
    const button = document.createElement('button');
    button.className = 'btn btn--outline';
    
    // Generate question text based on key
    let questionText = '';
    switch(questionKey) {
      case 'wine_glass':
        questionText = 'Did you handle the wine glass?';
        break;
      case 'cellar':
        questionText = 'Did you go to the Cellar?';
        break;
      case 'library':
        questionText = 'What did you see in the Library?';
        break;
      case 'chef':
        questionText = 'What about the Chef?';
        break;
      case 'knife':
        questionText = 'What about the missing knife?';
        break;
      case 'wine':
        questionText = 'Who requested the wine?';
        break;
      case 'glove':
        questionText = 'This glove was found in the Library...';
        break;
      default:
        questionText = 'Tell me more...';
    }
    
    button.textContent = questionText;
    button.onclick = () => askQuestion(suspect, questionKey, responses);
    questionButtons.appendChild(button);
  });
  
  modal.classList.remove('hidden');
}

function askQuestion(suspect, questionKey, responses) {
  const questionsSection = document.getElementById('questions-section');
  const responseSection = document.getElementById('response-section');
  const suspectResponse = document.getElementById('suspect-response');
  
  // Use minimax to determine response
  const minimaxScore = minimaxInterrogation(suspect, questionKey);
  const suspectData = gameData.suspects[suspect];
  
  // Determine if suspect tells truth or lies based on guilt and minimax score
  let response;
  if (suspectData.guilty && Math.random() > 0.3) {
    response = responses.lie;
  } else if (!suspectData.guilty && Math.random() > 0.7) {
    response = responses.lie;
  } else {
    response = responses.truth;
  }
  
  suspectResponse.textContent = `"${response}"`;
  
  questionsSection.classList.add('hidden');
  responseSection.classList.remove('hidden');
}

function continueInterrogation() {
  closeInterrogation();
}

function closeInterrogation() {
  document.getElementById('interrogation-modal').classList.add('hidden');
}

function makeAccusation() {
  document.getElementById('accusation-modal').classList.remove('hidden');
}

function submitAccusation(suspect) {
  document.getElementById('accusation-modal').classList.add('hidden');
  
  const isCorrect = gameData.suspects[suspect].guilty;
  showGameResult(isCorrect, suspect);
}

function showGameResult(success, accusedSuspect) {
  const modal = document.getElementById('result-modal');
  const title = document.getElementById('result-title');
  const content = document.getElementById('result-content');
  
  if (success) {
    title.textContent = '🎉 Case Solved!';
    content.innerHTML = `
      <div class="result-success">
        <h3>Congratulations, Detective!</h3>
        <p>You correctly identified <strong>Heiress Sophia</strong> as the murderer!</p>
      </div>
      <div class="solution-details">
        <h4>The Solution:</h4>
        <ul>
          <li><strong>Murderer:</strong> Sophia the Heiress</li>
          <li><strong>Weapon:</strong> Poison in the wine</li>
          <li><strong>Motive:</strong> Inheritance of the estate</li>
          <li><strong>Key Evidence:</strong> Bloodstained glove and suspicious ledger payments</li>
        </ul>
        <p>The algorithms helped you:</p>
        <ul>
          <li><strong>BFS:</strong> Navigate efficiently through the mansion</li>
          <li><strong>CSP:</strong> Rank suspects based on evidence</li>
          <li><strong>Minimax:</strong> Optimize interrogation strategy</li>
          <li><strong>Wumpus Inference:</strong> Avoid dangerous areas</li>
        </ul>
      </div>
    `;
  } else {
    title.textContent = '❌ Case Unsolved';
    content.innerHTML = `
      <div class="result-failure">
        <h3>The murderer has escaped!</h3>
        <p>You accused <strong>${gameData.suspects[accusedSuspect]?.name || 'someone'}</strong>, but the real killer was <strong>Heiress Sophia</strong>!</p>
      </div>
      <div class="solution-details">
        <h4>What you missed:</h4>
        <p>The Heiress used poison in the wine to kill her father for the inheritance. The bloodstained glove and suspicious ledger payments were key evidence pointing to her guilt.</p>
        <p>Better use of the CSP algorithm would have revealed her high suspicion score!</p>
      </div>
    `;
  }
  
  modal.classList.remove('hidden');
}

function restartGame() {
  // Reset game state
  gameState = {
    currentRoom: "Hall",
    visitedRooms: new Set(["Hall"]),
    collectedClues: [],
    interrogatedSuspects: new Set(),
    gameOver: false,
    confidence: 0
  };
  
  // Hide result modal
  document.getElementById('result-modal').classList.add('hidden');
  
  // Reset UI
  updateUI();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Game starts with welcome screen active
  console.log('Classic Mansion Murder - AI Algorithm Demonstration loaded');
});