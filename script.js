window.onload = function () {
    const jet = document.getElementById("jet");
    const gameArea = document.getElementById("gameArea");
    const scoreDisplay = document.getElementById("score");
    const livesDisplay = document.getElementById("lives");

    let jetX = gameArea.offsetWidth / 2 - 25;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let enemySpeed = 3.5;

    // Movement Logic
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
        bullet.style.left = (jetX + 22) + "px";
        bullet.style.bottom = "80px";
        gameArea.appendChild(bullet);

        let bMove = setInterval(() => {
            let bBottom = parseInt(bullet.style.bottom);
            bullet.style.bottom = (bBottom + 12) + "px";

            if (bBottom > gameArea.offsetHeight) {
                clearInterval(bMove);
                bullet.remove();
            }

            document.querySelectorAll(".enemy").forEach(en => {
                if (isColliding(bullet, en, 0)) {
                    en.remove();
                    bullet.remove();
                    clearInterval(bMove);
                    score++;
                    scoreDisplay.innerText = score;
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

        let eMove = setInterval(() => {
            if (gameOver) { clearInterval(eMove); enemy.remove(); return; }
            let eTop = parseInt(enemy.style.top);
            enemy.style.top = (eTop + enemySpeed) + "px";

            if (eTop > gameArea.offsetHeight) {
                clearInterval(eMove);
                enemy.remove();
                lives--;
                livesDisplay.innerText = lives;
                if (lives <= 0) endGame();
            }

            // HITBOX BUFFER: We subtract 15px so the player doesn't die 
            // from the invisible empty space around the emoji.
            if (isColliding(jet, enemy, 15)) {
                endGame();
            }
        }, 30);
    }

    function isColliding(a, b, buffer) {
        let aRect = a.getBoundingClientRect();
        let bRect = b.getBoundingClientRect();
        return !(
            aRect.top + buffer > bRect.bottom - buffer ||
            aRect.bottom - buffer < bRect.top + buffer ||
            aRect.right - buffer < bRect.left + buffer ||
            aRect.left + buffer > bRect.right - buffer
        );
    }

    function endGame() {
        if (gameOver) return;
        gameOver = true;
        document.getElementById("game-overlay-msg").innerHTML = `
            <h1 style="color:#ff4d4d; font-family:Orbitron;">MISSION FAILED</h1>
            <p style="margin:10px 0;">TACTICAL SCORE: ${score}</p>
            <button onclick="location.reload()" class="cta-btn" style="border-color:#ff4d4d; color:#ff4d4d;">REDEPLOY</button>
        `;
        jet.style.display = "none";
    }

    setInterval(createEnemy, 1000);

    // Mobile Support
    gameArea.addEventListener("touchmove", (e) => {
        let touchX = e.touches[0].clientX - gameArea.offsetLeft;
        jetX = touchX - 25;
        if (jetX < 0) jetX = 0;
        if (jetX > gameArea.offsetWidth - 50) jetX = gameArea.offsetWidth - 50;
        jet.style.left = jetX + "px";
    });
    gameArea.addEventListener("touchstart", (e) => { e.preventDefault(); shoot(); });
};
