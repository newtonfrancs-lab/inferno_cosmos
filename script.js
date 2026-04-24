window.onload = function () {
  const jet = document.getElementById("jet");
  const gameArea = document.getElementById("gameArea");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");

  let jetX = 175;
  let keys = {};
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let enemySpeed = 4;
  let spawnRate = 1000;

  // 🎮 CONTROLS
  document.addEventListener("keydown", (e) => { keys[e.key] = true; });
  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  function gameLoop() {
    if (gameOver) return;
    if (keys["ArrowLeft"] && jetX > 0) jetX -= 6;
    if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - jet.offsetWidth) jetX += 6;
    jet.style.left = jetX + "px";
    requestAnimationFrame(gameLoop);
  }
  gameLoop();

  // 🔫 SHOOTING (Fixed to prevent spamming)
  document.addEventListener("keydown", (e) => {
    if (e.key === " " && !gameOver) shoot();
  });

  function shoot() {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    let bulletX = jetX + (jet.offsetWidth / 2) - 2;
    let bulletY = jet.offsetTop - 10;
    bullet.style.left = bulletX + "px";
    bullet.style.top = bulletY + "px";
    gameArea.appendChild(bullet);

    let moveBullet = setInterval(() => {
      bulletY -= 12;
      bullet.style.top = bulletY + "px";

      if (bulletY < 0 || gameOver) {
        bullet.remove();
        clearInterval(moveBullet);
      }

      document.querySelectorAll(".enemy").forEach((enemy) => {
        if (isColliding(bullet, enemy)) {
          createExplosion(enemy.offsetLeft, enemy.offsetTop);
          enemy.remove();
          bullet.remove();
          clearInterval(moveBullet);
          score++;
          scoreDisplay.innerText = score;
          if (score % 10 === 0) enemySpeed += 0.5;
        }
      });
    }, 20);
  }

  // 👾 ENEMY LOGIC (The Fix is Here)
  function createEnemy() {
    if (gameOver) return;
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.innerText = "👾";
    let enemyX = Math.random() * (gameArea.offsetWidth - 40);
    let enemyY = -50;
    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
    gameArea.appendChild(enemy);

    let moveEnemy = setInterval(() => {
      if (gameOver) {
        enemy.remove();
        clearInterval(moveEnemy);
        return;
      }

      enemyY += enemySpeed;
      enemy.style.top = enemyY + "px";

      // 1. Check if enemy passed the bottom (Lose Life, NOT Game Over)
      if (enemyY > gameArea.offsetHeight) {
        enemy.remove();
        clearInterval(moveEnemy);
        loseLife();
      }

      // 2. Check for Collision with Jet (Direct Hit)
      // We add a "buffer" of 10px so it feels fair
      if (isColliding(jet, enemy, 10)) {
        endGame();
      }
    }, 30);
  }

  // 📏 SMART COLLISION DETECTOR
  function isColliding(obj1, obj2, buffer = 0) {
    const r1 = obj1.getBoundingClientRect();
    const r2 = obj2.getBoundingClientRect();

    return !(
      r1.top + buffer > r2.bottom - buffer ||
      r1.right - buffer < r2.left + buffer ||
      r1.bottom - buffer < r2.top + buffer ||
      r1.left + buffer > r2.right - buffer
    );
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
    
    // Stop spawning
    clearInterval(spawnInterval);

    // Save High Score
    let highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) localStorage.setItem("highScore", score);

    // Show Overlay
    const overlay = document.getElementById("game-overlay-msg");
    overlay.innerHTML = `
      <div style="text-align: center;">
        <h1 style="color: #ff4d4d; font-size: 32px; text-shadow: 0 0 20px #ff4d4d;">MISSION FAILED</h1>
        <p style="color: #aaa; margin: 10px 0;">FINAL SCORE: ${score}</p>
        <button onclick="location.reload()" class="cta-btn" style="border-color: #ff4d4d; color: #ff4d4d;">REDEPLOY</button>
      </div>
    `;
    jet.style.display = "none";
  }

  let spawnInterval = setInterval(createEnemy, spawnRate);

  // 📱 TOUCH
  gameArea.addEventListener("touchmove", (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = gameArea.getBoundingClientRect();
    jetX = (touch.clientX - rect.left) - (jet.offsetWidth / 2);
    if (jetX < 0) jetX = 0;
    if (jetX > rect.width - jet.offsetWidth) jetX = rect.width - jet.offsetWidth;
    jet.style.left = jetX + "px";
  }, { passive: false });

  gameArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    shoot();
  }, { passive: false });
};
