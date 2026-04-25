window.onload = function () {
    const jet = document.getElementById("jet");
    const gameArea = document.getElementById("gameArea");
    const scoreDisplay = document.getElementById("score");
    const livesDisplay = document.getElementById("lives");

    // Game State
    let jetX = gameArea.offsetWidth / 2 - 20;
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let enemySpeed = 4;
    let keys = {};

    // Entities Arrays
    let bullets = [];
    let enemies = [];
    let particles = [];

    // Initialize Jet Position
    jet.style.left = jetX + "px";

    // Event Listeners
    document.addEventListener("keydown", (e) => { keys[e.key] = true; if(e.key === " ") shoot(); });
    document.addEventListener("keyup", (e) => { keys[e.key] = false; jet.style.transform = "rotate(0deg)"; });

    function shoot() {
        if (gameOver) return;
        const bulletEl = document.createElement("div");
        bulletEl.className = "bullet";
        gameArea.appendChild(bulletEl);
        bullets.push({
            el: bulletEl,
            x: jetX + 21,
            y: 75 // distance from bottom
        });
    }

    function createEnemy() {
        if (gameOver) return;
        const enemyEl = document.createElement("div");
        enemyEl.className = "enemy";
        enemyEl.innerText = "🛸";
        const x = Math.random() * (gameArea.offsetWidth - 40);
        enemyEl.style.left = x + "px";
        gameArea.appendChild(enemyEl);
        enemies.push({ el: enemyEl, x: x, y: -50 });
    }

    function createExplosion(x, y) {
        // Create 8-10 debris particles
        for (let i = 0; i < 8; i++) {
            const pEl = document.createElement("div");
            pEl.className = "particle";
            gameArea.appendChild(pEl);
            
            particles.push({
                el: pEl,
                x: x + 15,
                y: y + 15,
                velX: (Math.random() - 0.5) * 10,
                velY: (Math.random() - 0.5) * 10,
                life: 1.0 // opacity
            });
        }
    }

    // MAIN GAME LOOP (Smooth 60FPS)
    function update() {
        if (gameOver) return;

        // 1. Move Jet
        if (keys["ArrowLeft"] && jetX > 0) {
            jetX -= 7; 
            jet.style.transform = "rotate(-15deg)";
        }
        if (keys["ArrowRight"] && jetX < gameArea.offsetWidth - 45) {
            jetX += 7;
            jet.style.transform = "rotate(15deg)";
        }
        jet.style.left = jetX + "px";

        // 2. Update Bullets
        bullets.forEach((b, bIdx) => {
            b.y += 10;
            b.el.style.bottom = b.y + "px";
            b.el.style.left = b.x + "px";

            // Remove bullets off screen
            if (b.y > gameArea.offsetHeight) {
                b.el.remove();
                bullets.splice(bIdx, 1);
            }
        });

        // 3. Update Enemies
        enemies.forEach((en, eIdx) => {
            en.y += enemySpeed;
            en.el.style.top = en.y + "px";

            // Check Collision with Jet
            const jetRect = jet.getBoundingClientRect();
            const enRect = en.el.getBoundingClientRect();
            
            if (!(jetRect.top + 20 > enRect.bottom - 20 || jetRect.bottom - 20 < enRect.top + 20 || 
                  jetRect.right - 20 < enRect.left + 20 || jetRect.left + 20 > enRect.right - 20)) {
                endGame();
            }

            // Check Collision with Bullets
            bullets.forEach((b, bIdx) => {
                const bRect = b.el.getBoundingClientRect();
                if (!(bRect.top > enRect.bottom || bRect.bottom < enRect.top || 
                      bRect.right < enRect.left || bRect.left > enRect.right)) {
                    
                    createExplosion(en.x, en.y);
                    en.el.remove();
                    enemies.splice(eIdx, 1);
                    b.el.remove();
                    bullets.splice(bIdx, 1);
                    
                    score++;
                    scoreDisplay.innerText = score;
                    if (score % 10 === 0) enemySpeed += 0.3;
                }
            });

            // Missed enemy
            if (en.y > gameArea.offsetHeight) {
                en.el.remove();
                enemies.splice(eIdx, 1);
                lives--;
                livesDisplay.innerText = lives;
                if (lives <= 0) endGame();
            }
        });

        // 4. Update Particles
        particles.forEach((p, pIdx) => {
            p.x += p.velX;
            p.y += p.velY;
            p.life -= 0.02;
            p.el.style.left = p.x + "px";
            p.el.style.top = p.y + "px";
            p.el.style.opacity = p.life;

            if (p.life <= 0) {
                p.el.remove();
                particles.splice(pIdx, 1);
            }
        });

        requestAnimationFrame(update);
    }

    function endGame() {
        gameOver = true;
        document.getElementById("game-overlay-msg").innerHTML = `
            <h1 style="color:var(--neon-red); font-family:Orbitron;">MISSION FAILED</h1>
            <button onclick="location.reload()" class="cta-btn" style="border-color:var(--neon-red); color:var(--neon-red);">REDEPLOY</button>`;
        jet.style.display = "none";
    }

    // Spawn cycle
    setInterval(createEnemy, 1000);
    
    // Start the loop
    requestAnimationFrame(update);
};
