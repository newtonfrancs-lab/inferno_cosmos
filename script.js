window.onload = function () {
    const jet = document.getElementById("jet");
    const gameArea = document.getElementById("gameArea");
    const scoreDisplay = document.getElementById("score");
    const livesDisplay = document.getElementById("lives");

    let jetX = gameArea.offsetWidth / 2 - 20;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let enemySpeed = 4;

    jet.style.left = jetX + "px";

    document.addEventListener("keydown", (e) => {
        if (gameOver) return;
        if (e.key === "ArrowLeft" && jetX > 10) { jetX -= 25; jet.style.transform = "rotate(-15deg)"; }
        if (e.key === "ArrowRight" && jetX < gameArea.offsetWidth - 50) { jetX += 25; jet.style.transform = "rotate(15deg)"; }
        if (e.key === " ") shoot();
        jet.style.left = jetX + "px";
    });

    document.addEventListener("keyup", () => { jet.style.transform = "rotate(0deg)"; });

    function shoot() {
        if (gameOver) return;
        const bullet = document.createElement("div");
        bullet.className = "bullet";
        bullet.style.left = (jetX + 18) + "px";
        bullet.style.bottom = "75px";
        gameArea.appendChild(bullet);

        let bMove = setInterval(() => {
            let bBottom = parseInt(bullet.style.bottom);
            bullet.style.bottom = (bBottom + 12) + "px";
            if (bBottom > gameArea.offsetHeight) { clearInterval(bMove); bullet.remove(); }

            document.querySelectorAll(".enemy").forEach(en => {
                if (isColliding(bullet, en, 0)) {
                    createExplosion(en.offsetLeft, en.offsetTop);
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
        enemy.innerText = "🛸";
        enemy.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";
        enemy.style.top = "-50px";
        gameArea.appendChild(enemy);

        let eMove = setInterval(() => {
            if (gameOver) { clearInterval(eMove); enemy.remove(); return; }
            let eTop = parseInt(enemy.style.top);
            enemy.style.top = (eTop + enemySpeed) + "px";

            if (eTop > gameArea.offsetHeight) {
                clearInterval(eMove); enemy.remove();
                lives--; livesDisplay.innerText = lives;
                if (lives <= 0) endGame();
            }

            if (isColliding(jet, enemy, 22)) endGame();
        }, 30);
    }

    function createExplosion(x, y) {
        const boom = document.createElement("div");
        boom.innerText = "💥"; boom.style.position = "absolute";
        boom.style.left = x + "px"; boom.style.top = y + "px";
        gameArea.appendChild(boom);
        setTimeout(() => boom.remove(), 300);
    }

    function isColliding(a, b, buffer) {
        let aR = a.getBoundingClientRect();
        let bR = b.getBoundingClientRect();
        return !(aR.top + buffer > bR.bottom - buffer || aR.bottom - buffer < bR.top + buffer || 
                 aR.right - buffer < bR.left + buffer || aR.left + buffer > bR.right - buffer);
    }

    function endGame() {
        if (gameOver) return;
        gameOver = true;
        document.getElementById("game-overlay-msg").innerHTML = `
            <h1 style="color:var(--neon-red); font-family:Orbitron;">MISSION FAILED</h1>
            <p style="margin:10px 0; color:#888;">SCORE: ${score}</p>
            <button onclick="location.reload()" class="cta-btn" style="border-color:var(--neon-red); color:var(--neon-red);">REDEPLOY</button>`;
        jet.style.display = "none";
    }

    setInterval(createEnemy, 1000);
};
