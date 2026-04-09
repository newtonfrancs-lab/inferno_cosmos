window.onload = function() {

const jet = document.getElementById("jet");
const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let jetX = 175;
let keys = {};
let score = 0;
let lives = 3;
let gameOver = false;

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

  if (keys["ArrowLeft"] && jetX > 0) jetX -= 5;
  if (keys["ArrowRight"] && jetX < 350) jetX += 5;

  if (keys[" "] || keys["Space"]) {
    shoot();
    keys[" "] = false;
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

  let bulletX = jetX + 22;
  let bulletY = 520;

  bullet.style.left = bulletX + "px";
  bullet.style.top = bulletY + "px";

  gameArea.appendChild(bullet);

  let moveBullet = setInterval(() => {
    if (gameOver) {
      clearInterval(moveBullet);
      return;
    }

    bulletY -= 10;
    bullet.style.top = bulletY + "px";

    if (bulletY < 0) {
      bullet.remove();
      clearInterval(moveBullet);
    }

    document.querySelectorAll(".enemy").forEach(enemy => {
      let eX = enemy.offsetLeft;
      let eY = enemy.offsetTop;

      if (
        bulletX < eX + 40 &&
        bulletX + 5 > eX &&
        bulletY < eY + 40 &&
        bulletY + 15 > eY
      ) {
        enemy.remove();
        bullet.remove();
        clearInterval(moveBullet);

        score++;
        scoreDisplay.innerText = "Score: " + score;
      }
    });

  }, 30);
}

// 👾 CREATE ENEMY
function createEnemy() {
  if (gameOver) return;

  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.innerText = "👾";

  let enemyX = Math.random() * 360;
  let enemyY = 0;

  enemy.style.left = enemyX + "px";
  enemy.style.top = enemyY + "px";

  gameArea.appendChild(enemy);

  let moveEnemy = setInterval(() => {
    if (gameOver) {
      clearInterval(moveEnemy);
      return;
    }

    enemyY += 4;
    enemy.style.top = enemyY + "px";

    // ❤️ MISSED ENEMY
    if (enemyY > 560) {
      enemy.remove();
      clearInterval(moveEnemy);

      lives--;
      livesDisplay.innerText = "Lives: " + lives;

      if (lives <= 0) endGame();
    }

    // 💥 COLLISION
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

  }, 50);
}

// 💥 END GAME
function endGame() {
  if (gameOver) return;
  gameOver = true;

  let highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }

  jet.classList.add("crash");

  setTimeout(() => {
    location.reload();
  }, 800);
}

// ⏱ SPAWN ENEMIES
setInterval(createEnemy, 1000);



// 📱 SWIPE / TOUCH CONTROLS

let isTouching = false;

gameArea.addEventListener("touchstart", (e) => {
  isTouching = true;

  // 🔫 Tap = shoot
  shoot();
});

gameArea.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  let touch = e.touches[0];
  let rect = gameArea.getBoundingClientRect();

  let touchX = touch.clientX - rect.left;

  jetX = touchX - 25;

  if (jetX < 0) jetX = 0;
  if (jetX > rect.width - 50) jetX = rect.width - 50;
});

gameArea.addEventListener("touchend", () => {
  isTouching = false;
});

};