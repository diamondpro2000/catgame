let scene, camera, renderer, controls;
let ws; // WebSocket
let currentRoomCode = null;
let playerId = null;
let playerName = "";
let playerColor = "";

// Basic initialization of 3D scene
init3D();

// UI elements
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const playerNameInput = document.getElementById('playerName');
const playerColorInput = document.getElementById('playerColor');
const joinCodeInput = document.getElementById('joinCode');
const displayRoomCode = document.getElementById('displayRoomCode');
const gameInfoDiv = document.getElementById('gameInfo');
const roomSetupDiv = document.getElementById('roomSetup');

// Replace this with the server URL once you set up the Node.js server on Render
// For now, leave it empty or local:
let serverUrl = "https://catgame-server.onrender.com"; 

createRoomBtn.addEventListener('click', () => {
  playerName = playerNameInput.value.trim() || "Player";
  playerColor = playerColorInput.value.trim() || "#ffcc00";
  connectAndSend({ type: 'CREATE_ROOM', name: playerName, color: playerColor });
});

joinRoomBtn.addEventListener('click', () => {
  playerName = playerNameInput.value.trim() || "Player";
  playerColor = playerColorInput.value.trim() || "#ffcc00";
  const code = joinCodeInput.value.trim();
  if (code) {
    connectAndSend({ type: 'JOIN_ROOM', roomCode: code, name: playerName, color: playerColor });
  }
});

function connectAndSend(message) {
  if (!serverUrl.startsWith("wss://")) {
    alert("You must update serverUrl with your server's WebSocket URL before creating/joining rooms.");
    return;
  }

  ws = new WebSocket(serverUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify(message));
  };
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);

    switch (data.type) {
      case 'ROOM_JOINED':
        currentRoomCode = data.roomCode;
        displayRoomCode.textContent = currentRoomCode;
        roomSetupDiv.style.display = "none";
        gameInfoDiv.style.display = "block";
        break;
      case 'PLAYERS_UPDATE':
        // Just log the players for now
        console.log("Players in room:", data.players);
        break;
      case 'ERROR':
        alert(data.message);
        break;
      default:
        console.log("Received unknown message:", data);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

function init3D() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 40);
  
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Example nodes and edges would be added here...
  // For now, just leave it empty.

  window.addEventListener('resize', onWindowResize, false);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
