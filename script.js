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

  // --- ⌨️ KEYBOARD ENGINE ---
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.code === "Space") {
      e.preventDefault();
      shoot();
    }
  });
  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  // --- 🖱️ & 📱 UNIVERSAL SHOOTING (THE FIX) ---
  // We attach this to 'window' to ensure it captures every tap/click
  window.addEventListener("mousedown", (e) => {
    if (!gameOver && e.target.closest('#gameArea')) shoot();
  });

  window.addEventListener("touchstart", (e) => {
    if (!gameOver && e.target.closest('#gameArea')) {
      e.preventDefault(); // Stop mobile zoom/scroll
      shoot();
      handleTouch(e);
    }
  }, { passive: false });

  window.addEventListener("touchmove", (e) => {
    if (!gameOver) handleTouch(e);
  }, { passive: false });

  // --- ✈️ MOVEMENT ENGINE ---
  function gameLoop() {
    if (gameOver) return;
    if (keys["ArrowLeft"] && jetX > 0) jetX -= 8;
    if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - jet.offsetWidth) jetX += 8;
    jet.style.left = jetX + "px";
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  function handleTouch(e) {
    const touch = e.touches[0];
    const rect = gameArea.getBoundingClientRect();
    jetX = (touch.clientX - rect.left) - (jet.offsetWidth / 2);
    if (jetX < 0) jetX = 0;
    if (jetX > rect.width - jet.offsetWidth) jetX = rect.width - jet.offsetWidth;
    jet.style.left = jetX + "px";
  }

  // --- 🔫 THE SHOOT FUNCTION ---
  function shoot() {
    if (gameOver) return;
    console.log("BANG!"); // If you see this in console, the code works!

    const bullet = document.createElement("div");
    bullet.className = "bullet";
    
    // Positioning bullet at the nose of the jet
    let bX = jetX + (jet.offsetWidth / 2) - 2;
    let bY = jet.offsetTop - 10;

    bullet.style.left = bX + "px";
    bullet.style.top = bY + "px";
    gameArea.appendChild(bullet);

    let moveBullet = setInterval(() => {
      bY -= 15; // Increased speed
      bullet.style.top = bY + "px";

      if (bY < -20 || gameOver) {
        clearInterval(moveBullet);
        bullet.remove();
      }

      // Collision Detection
      document.querySelectorAll(".enemy").forEach(enemy => {
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

  // --- 👾 ENEMY & GAME LOGIC ---
  function createEnemy() {
    if (gameOver) return;
    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.innerText = "👾";
    let eX = Math.random() * (gameArea.offsetWidth - 40);
    let eY = -50;
    enemy.style.left = eX + "px";
    gameArea.appendChild(enemy);

    let moveEnemy = setInterval(() => {
      if (gameOver) { clearInterval(moveEnemy); enemy.remove(); return; }
      eY += enemySpeed;
      enemy.style.top = eY + "px";

      if (isColliding(jet, enemy, 10)) endGame();
      if (eY > gameArea.offsetHeight) {
        clearInterval(moveEnemy);
        enemy.remove();
        lives--;
        livesDisplay.innerText = lives;
        if (lives <= 0) endGame();
      }
    }, 30);
  }

  function isColliding(a, b, buffer = 0) {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();
    return !(r1.top+buffer > r2.bottom-buffer || r1.right-buffer < r2.left+buffer || 
             r1.bottom-buffer < r2.top+buffer || r1.left+buffer > r2.right-buffer);
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
    overlay.innerHTML = `
      <div style="text-align:center;">
        <h1 style="color:#ff4d4d; text-shadow: 0 0 20px #ff4d4d;">MISSION FAILED</h1>
        <button onclick="location.reload()" class="cta-btn" style="border-color:#ff4d4d; color:#ff4d4d;">REDEPLOY</button>
      </div>`;
  }

  function loseLife() {
  lives--;
  livesDisplay.innerText = lives;
  
  // Trigger the CSS Glitch effect
  gameArea.classList.add("damaged");
  setTimeout(() => gameArea.classList.remove("damaged"), 400);

  screenShake();
  if (lives <= 0) endGame();
}

  let spawnInterval = setInterval(createEnemy, 1000);
};
