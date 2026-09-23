// Frases por defecto iniciales
const defaultMissions = [
  { 
    text: "EL ROBOT EXPLORA EL PLANETA MARTE EN BUSCA DE AGUA", 
    reward: "🏆 Medalla de Explorador Espacial" 
  },
  { 
    text: "LA ENERGÍA DEL MOTOR PRINCIPAL ESTÁ AL CIEN POR CIENTO", 
    reward: "⚡ 500 Puntos de Calibración" 
  }
];

let missions = JSON.parse(localStorage.getItem('robo_missions')) || defaultMissions;
let currentMissionIndex = 0;
let stream = null;

document.addEventListener("DOMContentLoaded", () => {
  renderMission();
  renderAdminMissions();
});

// Renderiza la frase segmentada en palabras
function renderMission() {
  const displayContainer = document.getElementById("mission-display");
  displayContainer.innerHTML = "";

  if (missions.length === 0) {
    displayContainer.innerText = "NO HAY FRASES REGISTRADAS";
    return;
  }

  const currentText = missions[currentMissionIndex].text;
  
  // Separar por palabras para crear bloques independientes
  const words = currentText.split(" ");
  words.forEach(word => {
    if (word.trim() !== "") {
      const span = document.createElement("span");
      span.className = "word-block";
      span.innerText = word;
      displayContainer.appendChild(span);
    }
  });
}

// Abrir la cámara web / móvil
async function openScanner() {
  document.getElementById("scanner-section").classList.remove("hidden");
  const video = document.getElementById("webcam");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" } // Usa cámara trasera si está disponible
    });
    video.srcObject = stream;
    playBeepSound(600, 0.1);
  } catch (err) {
    alert("Error al acceder a la cámara. Revisa los permisos de tu navegador.");
    console.error(err);
  }
}

// Cerrar cámara y liberar recursos
function closeScanner() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  document.getElementById("scanner-section").classList.add("hidden");
}

// Simulación de escaneo y validación del Robot
function processScan() {
  playBeepSound(800, 0.2);
  setTimeout(() => playBeepSound(1200, 0.3), 200);

  closeScanner();

  setTimeout(() => {
    const currentMission = missions[currentMissionIndex];
    document.getElementById("reward-text").innerText = currentMission.reward;
    document.getElementById("result-card").classList.remove("hidden");
    
    playBeepSound(1500, 0.4);
  }, 500);
}

function nextMission() {
  document.getElementById("result-card").classList.add("hidden");
  currentMissionIndex = (currentMissionIndex + 1) % missions.length;
  renderMission();
}

// ----------------------------------------------------
// PANEL DE ADMINISTRACIÓN (ZONA MAESTRA)
// ----------------------------------------------------
function toggleAdminPanel() {
  const panel = document.getElementById("admin-panel");
  panel.classList.toggle("hidden");
}

function saveMission(event) {
  event.preventDefault();
  const textInput = document.getElementById("input-text");
  const rewardInput = document.getElementById("input-reward");

  const newMission = {
    text: textInput.value.toUpperCase().trim(),
    reward: rewardInput.value.trim()
  };

  missions.push(newMission);
  localStorage.setItem('robo_missions', JSON.stringify(missions));

  textInput.value = "";
  rewardInput.value = "";

  renderMission();
  renderAdminMissions();
}

function deleteMission(index) {
  missions.splice(index, 1);
  localStorage.setItem('robo_missions', JSON.stringify(missions));
  if (currentMissionIndex >= missions.length) {
    currentMissionIndex = 0;
  }
  renderMission();
  renderAdminMissions();
}

function renderAdminMissions() {
  const list = document.getElementById("missions-list");
  list.innerHTML = "";

  missions.forEach((m, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${m.text.substring(0, 30)}${m.text.length > 30 ? '...' : ''}</strong> (${m.reward})</span>
      <button class="btn-secondary" style="padding: 4px 8px;" onclick="deleteMission(${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

// Generador de efectos de sonido sintetizados (Sin MP3s externos)
function playBeepSound(freq, duration) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth"; // Tono robótico retro
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Silencioso si el audio está bloqueado por interacción
  }
}
