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
        
        // SETTING THE PURPLE ALIEN EMOJI
        enemyEl.innerText = "👾"; 
        
        const x = Math.random() * (gameArea.offsetWidth - 40);
        enemyEl.style.left = x + "px";
        gameArea.appendChild(enemyEl);
        
        enemies.push({ 
            el: enemyEl, 
            x: x, 
            y: -50 
        });
    }

    // Inside your update() function, ensure the collision uses this buffer:
    // if (!(jetRect.top + 18 > enRect.bottom - 18 || ... ))

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

        // --- SMOOTH MOVEMENT LOGIC ---
        if (keys["ArrowLeft"]) {
            velocityX -= acceleration;
            currentTilt = -20; // Target tilt
        } else if (keys["ArrowRight"]) {
            velocityX += acceleration;
            currentTilt = 20; // Target tilt
        } else {
            currentTilt = 0; // Return to center
        }

        // Apply Friction (Air resistance/Space drag)
        velocityX *= friction;

        // Cap the speed
        if (velocityX > maxSpeed) velocityX = maxSpeed;
        if (velocityX < -maxSpeed) velocityX = -maxSpeed;

        // Apply Velocity to Position
        jetX += velocityX;

        // Boundary Brackets (Don't fly off screen)
        if (jetX < 0) {
            jetX = 0;
            velocityX = 0;
        }
        if (jetX > gameArea.offsetWidth - 44) {
            jetX = gameArea.offsetWidth - 44;
            velocityX = 0;
        }

        // Apply position and tilt
        jet.style.left = jetX + "px";
        // Smoothly interpolate the rotation for a "leaning" effect
        jet.style.transform = `rotate(${velocityX * 2}deg)`; 

        // --- REST OF THE GAME ENGINE (Bullets, Enemies, Particles) ---
        updateEntities(); 

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
