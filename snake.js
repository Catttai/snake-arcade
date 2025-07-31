const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

// Game settings
const gridSize = 20;
const tileSize = canvas.width / gridSize;

// Snake state
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: -1 };
let food = randomFood();
let score = 0;
let gameOver = false;
let moveQueue = [];
let gameStarted = false;

// Retro effects
let screenShake = 0;
let glowIntensity = 0;
let lastFoodEaten = false;

// Sound effects
let audioContext;
let sounds = {};

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log('Audio not supported');
  }
}

function createSound(frequency, duration, type = 'square') {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playEatSound() {
  createSound(800, 0.1, 'square');
  setTimeout(() => createSound(1000, 0.1, 'square'), 50);
}

function playGameOverSound() {
  createSound(200, 0.2, 'sawtooth');
  setTimeout(() => createSound(150, 0.2, 'sawtooth'), 100);
  setTimeout(() => createSound(100, 0.3, 'sawtooth'), 200);
}

function playMoveSound() {
  createSound(300, 0.05, 'triangle');
}

function playStartSound() {
  createSound(400, 0.1, 'sine');
  setTimeout(() => createSound(600, 0.1, 'sine'), 100);
  setTimeout(() => createSound(800, 0.1, 'sine'), 200);
}

function randomFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function drawGrid() {
  ctx.strokeStyle = '#003300';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const x = segment.x * tileSize;
    const y = segment.y * tileSize;
    
    if (i === 0) {
      // Head with glow effect
      ctx.fillStyle = '#00ff00';
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 10 + glowIntensity;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.shadowBlur = 0;
      ctx.fillRect(x + 6, y + 6, 3, 3);
      ctx.fillRect(x + 11, y + 6, 3, 3);
    } else {
      // Body segments with gradient
      const intensity = Math.max(0.3, 1 - (i / snake.length));
      ctx.fillStyle = `rgba(0, ${Math.floor(255 * intensity)}, 0, ${intensity})`;
      ctx.shadowBlur = 0;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
    }
  }
}

function drawFood() {
  const x = food.x * tileSize;
  const y = food.y * tileSize;
  
  // Pulsing food effect
  const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
  const size = tileSize * pulse;
  const offset = (tileSize - size) / 2;
  
  ctx.fillStyle = '#ff0000';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 15;
  ctx.fillRect(x + offset, y + offset, size, size);
  ctx.shadowBlur = 0;
  
  // Food sparkle effect
  if (Math.random() < 0.1) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + Math.random() * tileSize, y + Math.random() * tileSize, 2, 2);
  }
}

function draw() {
  // Apply screen shake
  const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  
  ctx.save();
  ctx.translate(shakeX, shakeY);
  
  // Clear with dark background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw subtle grid
  drawGrid();
  
  // Draw food
  drawFood();
  
  // Draw snake
  drawSnake();
  
  // Game over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText('PRESS SPACE TO RESTART', canvas.width / 2, canvas.height / 2);
  }
  
  // Start screen
  if (!gameStarted && !gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS SPACE TO START', canvas.width / 2, canvas.height / 2);
  }
  
  ctx.restore();
  
  // Reduce effects over time
  if (screenShake > 0) screenShake *= 0.9;
  if (glowIntensity > 0) glowIntensity *= 0.95;
  if (lastFoodEaten) lastFoodEaten = false;
}

function update() {
  if (gameOver || !gameStarted) return;

  if (moveQueue.length) {
    const nextDir = moveQueue.shift();
    if (nextDir.x !== -direction.x || nextDir.y !== -direction.y) {
      direction = nextDir;
    }
  }

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    endGame();
    return;
  }

  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = 'SCORE: ' + score;
    food = randomFood();
    
    // Visual feedback
    screenShake = 5;
    glowIntensity = 20;
    lastFoodEaten = true;
    playEatSound();
  } else {
    snake.pop();
  }
  playMoveSound();
}

function endGame() {
  gameOver = true;
  screenShake = 10;
  scoreEl.textContent += ' - GAME OVER!';
  playGameOverSound();
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: -1 };
  food = randomFood();
  score = 0;
  gameOver = false;
  moveQueue = [];
  gameStarted = true;
  screenShake = 0;
  glowIntensity = 0;
  scoreEl.textContent = 'SCORE: 0';
  playStartSound();
}

function gameLoop() {
  update();
  draw();
  if (!gameOver || !gameStarted) {
    setTimeout(gameLoop, 100);
  }
}

// Mobile touch controls
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  e.preventDefault();
  console.log('Touch start detected');
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  e.preventDefault();
  console.log('Touch end detected');
  
  if (!gameStarted || gameOver) {
    // Handle tap to start/restart
    console.log('Starting/restarting game via touch');
    if (gameOver) {
      resetGame();
      gameLoop();
    } else if (!gameStarted) {
      gameStarted = true;
      playStartSound();
      gameLoop();
    }
    return;
  }
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  console.log('Swipe detected:', { deltaX, deltaY });
  
  // Minimum swipe distance to register
  const minSwipeDistance = 20;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right
        console.log('Swipe right');
        moveQueue.push({ x: 1, y: 0 });
      } else {
        // Swipe left
        console.log('Swipe left');
        moveQueue.push({ x: -1, y: 0 });
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe down
        console.log('Swipe down');
        moveQueue.push({ x: 0, y: 1 });
      } else {
        // Swipe up
        console.log('Swipe up');
        moveQueue.push({ x: 0, y: -1 });
      }
    }
  }
}

function handleTouchMove(e) {
  e.preventDefault();
}

function handleTap(e) {
  if (gameOver) {
    resetGame();
    gameLoop();
  } else if (!gameStarted) {
    gameStarted = true;
    playStartSound();
    gameLoop();
  }
}

document.addEventListener('keydown', e => {
  if (e.key === ' ') {
    if (gameOver) {
      resetGame();
      gameLoop();
    } else if (!gameStarted) {
      gameStarted = true;
      playStartSound();
      gameLoop();
    }
    return;
  }
  
  if (!gameStarted || gameOver) return;
  
  switch (e.key) {
    case 'ArrowUp': moveQueue.push({ x: 0, y: -1 }); break;
    case 'ArrowDown': moveQueue.push({ x: 0, y: 1 }); break;
    case 'ArrowLeft': moveQueue.push({ x: -1, y: 0 }); break;
    case 'ArrowRight': moveQueue.push({ x: 1, y: 0 }); break;
  }
});

// Add mobile touch controls
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('click', handleTap);

// Initialize
draw();
initAudio();