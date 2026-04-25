window.onload = function () {
    const jet = document.getElementById("jet");
    const gameArea = document.getElementById("gameArea");
    const scoreDisplay = document.getElementById("score");
    const livesDisplay = document.getElementById("lives");

    let jetX = 225;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let enemySpeed = 3;

    // Movement
    document.addEventListener("keydown", (e) => {
        if (gameOver) return;
        if (e.key === "ArrowLeft" && jetX > 0) jetX -= 20;
        if (e.key === "ArrowRight" && jetX < gameArea.offsetWidth - 50) jetX += 20;
        if (e.key === " ") shoot();
        jet.style.left = jetX + "px";
    });

    function shoot() {
        if (gameOver) return;
        const bullet = document.createElement("div");
        bullet.className = "bullet";
        bullet.style.left = (jetX + 23) + "px";
        bullet.style.bottom = "80px";
        gameArea.appendChild(bullet);

        let bMove = setInterval(() => {
            let bBottom = parseInt(bullet.style.bottom);
            bullet.style.bottom = (bBottom + 10) + "px";

            if (bBottom > gameArea.offsetHeight) {
                clearInterval(bMove);
                bullet.remove();
            }

            document.querySelectorAll(".enemy").forEach(en => {
                if (isColliding(bullet, en, 0)) {
                    en.remove();
                    bullet.remove();
                    clearInterval(bMove);
                    score += 1;
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

            // If enemy passes player
            if (eTop > gameArea.offsetHeight) {
                clearInterval(eMove);
                enemy.remove();
                lives--;
                livesDisplay.innerText = lives;
                if (lives <= 0) endGame();
            }

            // HITBOX BUFFER: Added 15px safety margin to prevent "fake" deaths
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
        gameOver = true;
        document.getElementById("game-overlay-msg").innerHTML = `
            <div style="text-align:center; background:rgba(0,0,0,0.9); padding:30px; border:1px solid var(--neon-red); border-radius:15px;">
                <h1 style="color:var(--neon-red); font-family:Orbitron;">MISSION ABORTED</h1>
                <p>SCORE: ${score}</p>
                <button onclick="location.reload()" class="cta-btn" style="margin-top:20px; border-color:var(--neon-red); color:var(--neon-red);">REDEPLOY</button>
            </div>
        `;
    }

    setInterval(createEnemy, 1000);
};
