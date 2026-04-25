window.onload = function () {
  const jet = document.getElementById("jet");
  const gameArea = document.getElementById("gameArea");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");
  const overlay = document.getElementById("game-overlay-msg");

  let jetX = 175;
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let enemySpeed = 4;
  let keys = {};
  let lastShotTime = 0;
  const shotDelay = 200; // Rapid fire response

  // --- ⌨️ KEYBOARD ENGINE ---
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.code === "Space") {
      e.preventDefault();
      handleFire();
    }
  });
  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  // --- 📱 MOBILE & MOUSE ENGINE ---
  function handleTouch(e) {
    if (gameOver) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = gameArea.getBoundingClientRect();
    
    // Centering the jet on touch/cursor
    jetX = (clientX - rect.left) - (jet.offsetWidth / 2);

    // Boundary constraints
    if (jetX < 0) jetX = 0;
    if (jetX > rect.width - jet.offsetWidth) jetX = rect.width - jet.offsetWidth;

    jet.style.left = jetX + "px";
  }

  gameArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleTouch(e);
    handleFire();
  }, { passive: false });

  gameArea.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleTouch(e);
  }, { passive: false });

  // --- ✈️ CORE GAME LOOP ---
  function gameLoop() {
    if (gameOver) return;
    
    // Desktop smooth movement
    if (keys["ArrowLeft"] && jetX > 0) jetX -= 8;
    if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - jet.offsetWidth) jetX += 8;
    
    jet.style.left = jetX + "px";
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  // --- 🔫 WEAPONRY ---
  function handleFire() {
    const now = Date.now();
    if (now - lastShotTime > shotDelay) {
      shoot();
      lastShotTime = now;
    }
  }

  function shoot() {
    if (gameOver) return;

    const bullet = document.createElement("div");
    bullet.className = "bullet";
    
    let bX = jetX + (jet.offsetWidth / 2) - 2;
    let bY = jet.offsetTop - 10;

    bullet.style.left = bX + "px";
    bullet.style.top = bY + "px";
    gameArea.appendChild(bullet);

    let moveBullet = setInterval(() => {
      bY -= 15;
      bullet.style.top = bY + "px";

      if (bY < -20 || gameOver) {
        clearInterval(moveBullet);
        bullet.remove();
      }

// --- UPDATED COLLISION LOGIC INSIDE shoot() ---
document.querySelectorAll(".enemy").forEach(enemy => {
  if (isColliding(bullet, enemy)) {
    // 1. Capture the exact location before anything is removed
    const targetX = enemy.offsetLeft + (enemy.offsetWidth / 2);
    const targetY = enemy.offsetTop + (enemy.offsetHeight / 2);

    // 2. Trigger explosion at that spot
    createExplosion(targetX, targetY);

    // 3. Remove actors
    enemy.remove();
    bullet.remove();
    clearInterval(moveBullet);
    updateScore();
  }
});
    }, 20);
  }

  // --- 👾 ENEMY SYSTEMS ---
  function createEnemy() {
    if (gameOver) return;

    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.innerText = "👾";
    
    let eX = Math.random() * (gameArea.offsetWidth - 40);
    let eY = -50;
    
    enemy.style.left = eX + "px";
    enemy.style.top = eY + "px";
    gameArea.appendChild(enemy);

    let moveEnemy = setInterval(() => {
      if (gameOver) {
        clearInterval(moveEnemy);
        enemy.remove();
        return;
      }

      eY += enemySpeed;
      enemy.style.top = eY + "px";

      // Collision with Ship
      if (isColliding(jet, enemy, 12)) {
        endGame();
      }

      // Passed Hull (Missed Enemy)
      if (eY > gameArea.offsetHeight) {
        clearInterval(moveEnemy);
        enemy.remove();
        takeDamage();
      }
    }, 30);
  }

  // --- 🛠️ TACTICAL UTILITIES ---
  function isColliding(a, b, buffer = 0) {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    return !(
      r1.top + buffer > r2.bottom - buffer ||
      r1.right - buffer < r2.left + buffer ||
      r1.bottom - buffer < r2.top + buffer ||
      r1.left + buffer > r2.right - buffer
    );
  }

  function updateScore() {
    score++;
    scoreDisplay.innerText = score;
    if (score % 10 === 0) enemySpeed += 0.6;
  }

  function takeDamage() {
    lives--;
    livesDisplay.innerText = lives;
    
    // Trigger the Advanced CSS Glitch/Flicker
    gameArea.classList.add("damaged");
    setTimeout(() => gameArea.classList.remove("damaged"), 300);
    
    screenShake();
    if (lives <= 0) endGame();
  }

  function screenShake() {
    gameArea.style.animation = "shake 0.2s ease-in-out";
    setTimeout(() => { gameArea.style.animation = ""; }, 200);
  }

// --- UPDATED EXPLOSION GENERATOR ---
function createExplosion(x, y) {
  const exp = document.createElement("div");
  exp.className = "explosion";
  exp.innerHTML = "💥"; 
  
  // Center the explosion on the impact point
  exp.style.left = x + "px";
  exp.style.top = y + "px";
  
  gameArea.appendChild(exp);

  // Remove from DOM after animation
  setTimeout(() => exp.remove(), 500);
}

  function endGame() {
  if (gameOver) return;
  gameOver = true;
  clearInterval(spawnInterval);
  
  jet.style.display = "none";
  
  // ADD THIS LINE: This makes the box appear
  overlay.style.display = "block"; 

  let highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) localStorage.setItem("highScore", score);

  overlay.innerHTML = `
    <div style="text-align:center;">
      <h1 style="color:#fff; text-shadow: 0 0 15px var(--neon-red); font-size: 2rem;">CRITICAL FAILURE</h1>
      <p style="color:#888; margin: 15px 0; font-family: 'Orbitron';">TACTICAL SCORE: ${score}</p>
      <button onclick="location.reload()" class="cta-btn" style="border-color:var(--neon-red); color:var(--neon-red);">REDEPLOY</button>
    </div>`;
}
  let spawnInterval = setInterval(createEnemy, 1000);
};
