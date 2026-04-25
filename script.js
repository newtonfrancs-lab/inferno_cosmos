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
  const shotDelay = 250; // Milliseconds between shots (prevents lag)

  // --- ⌨️ DESKTOP KEYBOARD ENGINE ---
  document.addEventListener("keydown", (e) => { 
    keys[e.key] = true; 
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      handleFire();
    }
  });
  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  function gameLoop() {
    if (gameOver) return;
    
    // Smooth movement logic
    if (keys["ArrowLeft"] && jetX > 0) jetX -= 8;
    if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - jet.offsetWidth) jetX += 8;
    
    jet.style.left = jetX + "px";
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  // --- 📱 NEXT-GEN MOBILE TOUCH ENGINE ---
  function handleTouch(e) {
    if (gameOver) return;
    e.preventDefault(); // Critical: stops page scrolling/bouncing

    const touch = e.touches[0];
    const rect = gameArea.getBoundingClientRect();
    
    // Calculate position relative to gameArea
    let touchX = touch.clientX - rect.left;
    
    // Update jet position (centered on finger)
    jetX = touchX - (jet.offsetWidth / 2);

    // Boundary Constraints
    if (jetX < 0) jetX = 0;
    if (jetX > rect.width - jet.offsetWidth) jetX = rect.width - jet.offsetWidth;

    jet.style.left = jetX + "px";
  }

  // Shooting on Mobile: Unified Tap and Move
  gameArea.addEventListener("touchstart", (e) => {
    handleTouch(e);
    handleFire();
  }, { passive: false });

  gameArea.addEventListener("touchmove", (e) => {
    handleTouch(e);
  }, { passive: false });

  // --- 🔫 WEAPON SYSTEM ---
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
    
    // Precise bullet positioning
    let bX = jetX + (jet.offsetWidth / 2) - 2;
    let bY = jet.offsetTop - 10;

    bullet.style.left = bX + "px";
    bullet.style.top = bY + "px";
    gameArea.appendChild(bullet);

    let moveBullet = setInterval(() => {
      bY -= 12;
      bullet.style.top = bY + "px";

      if (bY < 0 || gameOver) {
        clearInterval(moveBullet);
        bullet.remove();
      }

      // Optimization: Only check collision for active enemies
      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach(enemy => {
        if (isColliding(bullet, enemy)) {
          createExplosion(enemy.offsetLeft, enemy.offsetTop);
          enemy.remove();
          bullet.remove();
          clearInterval(moveBullet);
          updateScore();
        }
      });
    }, 20);
  }

  // --- 👾 ENEMY SWARM ENGINE ---
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

      // Collision with Jet (Buffer of 10px for fairness)
      if (isColliding(jet, enemy, 10)) {
        endGame();
      }

      // Passed Bottom
      if (eY > gameArea.offsetHeight) {
        clearInterval(moveEnemy);
        enemy.remove();
        loseLife();
      }
    }, 30);
  }

  // --- 🛠️ GAME UTILITIES ---
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
    // Difficulty Ramp
    if (score % 10 === 0) enemySpeed += 0.5;
  }

  function loseLife() {
    lives--;
    livesDisplay.innerText = lives;
    screenShake();
    if (lives <= 0) endGame();
  }

  function screenShake() {
    gameArea.style.animation = "shake 0.2s ease-in-out";
    setTimeout(() => { gameArea.style.animation = ""; }, 200);
  }

  function createExplosion(x, y) {
    const exp = document.createElement("div");
    exp.className = "explosion";
    exp.innerText = "💥";
    exp.style.left = x + "px";
    exp.style.top = y + "px";
    gameArea.appendChild(exp);
    setTimeout(() => exp.remove(), 400);
  }

  function endGame() {
    if (gameOver) return;
    gameOver = true;
    clearInterval(spawnInterval);
    
    jet.style.display = "none";
    
    let highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) localStorage.setItem("highScore", score);

    overlay.innerHTML = `
      <div style="text-align:center;">
        <h1 style="color:#ff4d4d; text-shadow: 0 0 20px #ff4d4d;">MISSION FAILED</h1>
        <p style="color:#aaa; margin:10px 0;">SCORE: ${score}</p>
        <button onclick="location.reload()" class="cta-btn" style="border-color:#ff4d4d; color:#ff4d4d;">REDEPLOY</button>
      </div>`;
  }

  // --- ⏱️ INITIALIZATION ---
  let spawnInterval = setInterval(createEnemy, 1000);
};
