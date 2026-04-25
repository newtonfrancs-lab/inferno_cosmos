window.onload = function () {
  const jet = document.getElementById("jet");
  const gameArea = document.getElementById("gameArea");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");

  let jetX = 225;
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let enemySpeed = 4;
  let spawnInterval;

  // Key Listeners
  document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft" && jetX > 0) jetX -= 25;
    if (e.key === "ArrowRight" && jetX < gameArea.offsetWidth - 50) jetX += 25;
    if (e.key === " ") shoot();
    jet.style.left = jetX + "px";
  });

  function shoot() {
    if (gameOver) return;
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = (jetX + 20) + "px";
    bullet.style.bottom = "70px";
    gameArea.appendChild(bullet);

    let bPos = 70;
    let bMove = setInterval(() => {
      bPos += 10;
      bullet.style.bottom = bPos + "px";
      if (bPos > gameArea.offsetHeight) { clearInterval(bMove); bullet.remove(); }

      document.querySelectorAll(".enemy").forEach(en => {
        if (checkHit(bullet, en)) {
          en.remove(); bullet.remove(); clearInterval(bMove);
          score++; scoreDisplay.innerText = score;
          if (score % 10 === 0) enemySpeed += 0.5;
        }
      });
    }, 20);
  }

  function createEnemy() {
    if (gameOver) return;
    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.innerText = "👾";
    enemy.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";
    enemy.style.top = "-50px";
    gameArea.appendChild(enemy);

    let ePos = -50;
    let eMove = setInterval(() => {
      if (gameOver) { clearInterval(eMove); enemy.remove(); return; }
      ePos += enemySpeed;
      enemy.style.top = ePos + "px";

      if (ePos > gameArea.offsetHeight) {
        clearInterval(eMove); enemy.remove();
        lives--; livesDisplay.innerText = lives;
        gameArea.style.animation = "shake 0.2s";
        setTimeout(() => gameArea.style.animation = "", 200);
        if (lives <= 0) endGame();
      }

      // Buffer of 15px makes collision feel fair
      if (checkHit(jet, enemy, 15)) endGame();
    }, 30);
  }

  function checkHit(a, b, buffer = 0) {
    let aR = a.getBoundingClientRect();
    let bR = b.getBoundingClientRect();
    return !(aR.top + buffer > bR.bottom - buffer || aR.bottom - buffer < bR.top + buffer || 
             aR.right - buffer < bR.left + buffer || aR.left + buffer > bR.right - buffer);
  }

  function endGame() {
    if (gameOver) return;
    gameOver = true;
    clearInterval(spawnInterval);
    
    document.getElementById("game-overlay-msg").innerHTML = `
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); 
      background:rgba(0,0,0,0.9); padding:40px; border:1px solid #ff4d4d; text-align:center; z-index:100; width:80%;">
        <h1 style="color:#ff4d4d; font-family:Orbitron; font-size:24px;">MISSION FAILED</h1>
        <p style="margin:15px 0;">TACTICAL SCORE: ${score}</p>
        <button onclick="location.reload()" class="cta-btn" style="border-color:#ff4d4d; color:#ff4d4d;">Redeploy</button>
      </div>`;
    jet.style.display = "none";
  }

  spawnInterval = setInterval(createEnemy, 1000);

  // Mobile Touch Support
  gameArea.addEventListener("touchmove", (e) => {
    let touchX = e.touches[0].clientX - gameArea.offsetLeft;
    jetX = touchX - 25;
    if (jetX < 0) jetX = 0;
    if (jetX > gameArea.offsetWidth - 50) jetX = gameArea.offsetWidth - 50;
    jet.style.left = jetX + "px";
  });
  gameArea.addEventListener("touchstart", (e) => { e.preventDefault(); shoot(); });
};
