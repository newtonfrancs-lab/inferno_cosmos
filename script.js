window.onload = function () {
  const jet = document.getElementById("jet");
  const gameArea = document.getElementById("gameArea");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");

  let jetX = 175;
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let enemySpeed = 4;
  let keys = {};

  // --- ⌨️ KEYBOARD CONTROLS ---
  document.addEventListener("keydown", (e) => { keys[e.key] = true; });
  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  function gameLoop() {
    if (gameOver) return;
    if (keys["ArrowLeft"] && jetX > 0) jetX -= 7;
    if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - jet.offsetWidth) jetX += 7;
    jet.style.left = jetX + "px";
    requestAnimationFrame(gameLoop);
  }
  gameLoop();

  // --- 📱 MOBILE TOUCH LOGIC (REWRITTEN) ---
  function handleTouch(e) {
    if (gameOver) return;
    e.preventDefault(); // STOPS the screen from bouncing/scrolling

    const touch = e.touches[0];
    const rect = gameArea.getBoundingClientRect();
    
    // Calculate X relative to the game container
    let relativeX = touch.clientX - rect.left;
    
    // Center the jet on the finger
    jetX = relativeX - (jet.offsetWidth / 2);

    // Boundary Protection
    if (jetX < 0) jetX = 0;
    if (jetX > rect.width - jet.offsetWidth) jetX = rect.width - jet.offsetWidth;

    jet.style.left = jetX + "px";
  }

  // Bind move and start to the same logic
  gameArea.addEventListener("touchstart", (e) => {
    handleTouch(e);
    shoot(); // Tap once to shoot
  }, { passive: false });

  gameArea.addEventListener("touchmove", handleTouch, { passive: false });

  // --- 🔫 COMBAT SYSTEM ---
  function shoot() {
    if (gameOver) return;
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = (jetX + jet.offsetWidth / 2 - 2) + "px";
    bullet.style.top = (jet.offsetTop - 10) + "px";
    gameArea.appendChild(bullet);

    let bY = jet.offsetTop - 10;
    let moveBullet = setInterval(() => {
      bY -= 10;
      bullet.style.top = bY + "px";
      if (bY < 0 || gameOver) { clearInterval(moveBullet); bullet.remove(); }

      document.querySelectorAll(".enemy").forEach(enemy => {
        if (isColliding(bullet, enemy)) {
          enemy.remove(); bullet.remove(); clearInterval(moveBullet);
          score++; scoreDisplay.innerText = score;
          if (score % 10 === 0) enemySpeed += 0.5;
        }
      });
    }, 20);
  }

  // --- 👾 ENEMY SPAWNING ---
  function createEnemy() {
    if (gameOver) return;
    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.innerText = "👾";
    enemy.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";
    let eY = -50;
    gameArea.appendChild(enemy);

    let moveEnemy = setInterval(() => {
      if (gameOver) { clearInterval(moveEnemy); enemy.remove(); return; }
      eY += enemySpeed;
      enemy.style.top = eY + "px";

      if (eY > gameArea.offsetHeight) {
        clearInterval(moveEnemy); enemy.remove();
        lives--; livesDisplay.innerText = lives;
        screenShake();
        if (lives <= 0) endGame();
      }

      if (isColliding(jet, enemy, 10)) endGame();
    }, 30);
  }

  let spawnInterval = setInterval(createEnemy, 1000);

  // --- 📏 UTILITIES ---
  function isColliding(a, b, buffer = 0) {
    let r1 = a.getBoundingClientRect();
    let r2 = b.getBoundingClientRect();
    return !(r1.top+buffer > r2.bottom-buffer || r1.right-buffer < r2.left+buffer || 
             r1.bottom-buffer < r2.top+buffer || r1.left+buffer > r2.right-buffer);
  }

  function screenShake() {
    gameArea.style.animation = "shake 0.2s ease-in-out";
    setTimeout(() => gameArea.style.animation = "", 200);
  }

  function endGame() {
    if (gameOver) return;
    gameOver = true;
    clearInterval(spawnInterval);
    document.getElementById("game-overlay-msg").innerHTML = `
      <div style="text-align:center;">
        <h1 style="color:#ff4d4d;">MISSION FAILED</h1>
        <button onclick="location.reload()" class="cta-btn">REDEPLOY</button>
      </div>`;
    jet.style.display = "none";
  }
};

