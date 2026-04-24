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
  let enemySpeed = 4; // Base speed
  let spawnRate = 1000; // Base spawn rate (ms)

  // 🎮 KEYBOARD CONTROLS
  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  // 🚀 GAME LOOP
  function gameLoop() {
    if (gameOver) return;

    if (keys["ArrowLeft"] && jetX > 0) jetX -= 6;
    if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - jet.offsetWidth) jetX += 6;

    if (keys[" "] || keys["Space"]) {
      shoot();
      keys[" "] = false; // Prevents rapid fire machine gun glitch
    }

    jet.style.left = jetX + "px";
    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  // 🔫 SHOOT
  function shoot() {
    if (gameOver) return;

    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    // Center bullet relative to jet
    let bulletX = jetX + (jet.offsetWidth / 2) - 2;
    let bulletY = jet.offsetTop - 10;

    bullet.style.left = bulletX + "px";
    bullet.style.top = bulletY + "px";

    gameArea.appendChild(bullet);

    let moveBullet = setInterval(() => {
      if (gameOver) {
        bullet.remove();
        clearInterval(moveBullet);
        return;
      }

      bulletY -= 12;
      bullet.style.top = bulletY + "px";

      if (bulletY < 0) {
        bullet.remove();
        clearInterval(moveBullet);
      }

      // Collision Detection
      document.querySelectorAll(".enemy").forEach((enemy) => {
        let eX = enemy.offsetLeft;
        let eY = enemy.offsetTop;

        if (
          bulletX < eX + 40 &&
          bulletX + 5 > eX &&
          bulletY < eY + 40 &&
          bulletY + 15 > eY
        ) {
          createExplosion(eX, eY); // Visual feedback
          enemy.remove();
          bullet.remove();
          clearInterval(moveBullet);

          score++;
          scoreDisplay.innerText = score;
          
          // Difficulty increase every 10 points
          if (score % 10 === 0) {
            enemySpeed += 0.5;
          }
        }
      });
    }, 20);
  }

  // 👾 CREATE ENEMY
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

      // 💔 MISSED ENEMY (Hull Damage)
      if (enemyY > gameArea.offsetHeight) {
        enemy.remove();
        clearInterval(moveEnemy);
        loseLife();
      }

      // 💥 DIRECT COLLISION
      const jetRect = jet.getBoundingClientRect();
      const enemyRect = enemy.getBoundingClientRect();

      if (
        jetRect.left < enemyRect.right &&
        jetRect.right > enemyRect.left &&
        jetRect.top < enemyRect.bottom &&
        jetRect.bottom > enemyRect.top
      ) {
        endGame();
      }
    }, 30);
  }

  // ❤️ LIFE LOSS LOGIC
  function loseLife() {
    lives--;
    livesDisplay.innerText = lives;
    screenShake(); // Trigger the UI effect

    if (lives <= 0) {
      endGame();
    }
  }

  // 📳 SCREEN SHAKE EFFECT
  function screenShake() {
    gameArea.style.animation = "shake 0.2s ease-in-out";
    setTimeout(() => {
      gameArea.style.animation = "";
    }, 200);
  }

  // ✨ SIMPLE EXPLOSION EFFECT
  function createExplosion(x, y) {
    const exp = document.createElement("div");
    exp.innerText = "💥";
    exp.style.position = "absolute";
    exp.style.left = x + "px";
    exp.style.top = y + "px";
    exp.style.fontSize = "30px";
    gameArea.appendChild(exp);
    setTimeout(() => exp.remove(), 300);
  }

  // 💥 END GAME
  function endGame() {
    if (gameOver) return;
    gameOver = true;

    let highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }

    jet.style.display = "none";
    screenShake();

    const gameOverMsg = document.createElement("div");
    gameOverMsg.innerHTML = `<h1 style="color:red; margin-top:50%;">MISSION FAILED</h1><button onclick="location.reload()">REDEPLOY</button>`;
    gameArea.appendChild(gameOverMsg);
  }

  // ⏱ SPAWN SYSTEM
  let spawnInterval = setInterval(createEnemy, spawnRate);

  // 📱 UPDATED TOUCH CONTROLS
  gameArea.addEventListener("touchstart", (e) => {
    e.preventDefault();
    shoot();
  }, { passive: false });

  gameArea.addEventListener("touchmove", (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = gameArea.getBoundingClientRect();
    let touchX = touch.clientX - rect.left;
    
    jetX = touchX - (jet.offsetWidth / 2);

    // Bound detection
    if (jetX < 0) jetX = 0;
    if (jetX > rect.width - jet.offsetWidth) jetX = rect.width - jet.offsetWidth;

    jet.style.left = jetX + "px";
  }, { passive: false });
};
