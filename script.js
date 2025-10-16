const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    color: 'green',
    speed: 5,
    shootCooldown: 500, // ms
    lastShotTime: 0
};

// Bullets
const bullet = {
    width: 5,
    height: 10,
    color: 'white',
    speed: 7
};
let bullets = [];

// Invaders
const invader = {
    width: 40,
    height: 30,
    color: 'red',
    speed: 2
};
let invaders = [];
const invaderRows = 5;
const invaderCols = 10;

// Game state
let score = 0;
let gameOver = false;
let wave = 1;

//- Event Listeners
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = false;
    }
}

function createInvaders(wave) {
    invaders = []; // Clear existing invaders
    const health = wave;
    const color = wave === 1 ? 'red' : 'orange';

    for (let c = 0; c < invaderCols; c++) {
        for (let r = 0; r < invaderRows; r++) {
            invaders.push({
                x: c * (invader.width + 10) + 30,
                y: r * (invader.height + 10) + 30,
                width: invader.width,
                height: invader.height,
                speed: invader.speed * wave, // Make them faster too
                health: health,
                initialHealth: health,
                color: color
            });
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullets[i].x, bullets[i].y, bullet.width, bullet.height);
    }
}

function drawInvaders() {
    for (let i = 0; i < invaders.length; i++) {
        ctx.fillStyle = invaders[i].color;
        ctx.fillRect(invaders[i].x, invaders[i].y, invaders[i].width, invaders[i].height);
    }
}

// Power-ups
const powerUpTypes = {
    SPEED_BOOST: { color: 'cyan', type: 'SPEED_BOOST' },
    RAPID_FIRE: { color: 'yellow', type: 'RAPID_FIRE' },
};
const powerUp = {
    width: 15,
    height: 15,
    speed: 3
};
let powerUps = [];

function drawPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        ctx.fillStyle = powerUps[i].color;
        ctx.fillRect(powerUps[i].x, powerUps[i].y, powerUps[i].width, powerUps[i].height);
    }
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Wave: ' + wave, canvas.width - 100, 20);
}

function update() {
    if (gameOver) {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();
    drawInvaders();
    drawPowerUps();
    drawScore();

    // Move player
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    } else if (leftPressed && player.x > 0) {
        player.x -= player.speed;
    }

    // Shoot bullets
    const now = Date.now();
    if (spacePressed && now - player.lastShotTime > player.shootCooldown) {
        player.lastShotTime = now;
        bullets.push({
            x: player.x + player.width / 2 - bullet.width / 2,
            y: player.y,
            width: bullet.width,
            height: bullet.height,
            color: bullet.color,
            speed: bullet.speed
        });
    }

    // Move bullets
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }

    // Move invaders
    let edge = false;
    for (let i = 0; i < invaders.length; i++) {
        invaders[i].x += invaders[i].speed;
        if (invaders[i].x + invaders[i].width > canvas.width || invaders[i].x < 0) {
            edge = true;
        }
    }

    if (edge) {
        for (let i = 0; i < invaders.length; i++) {
            invaders[i].speed *= -1;
            invaders[i].y += invader.height;
        }
    }

    // Collision detection
    let bulletsToRemove = [];
    let invadersToRemove = [];

    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < invaders.length; j++) {
            if (
                bullets[i].x > invaders[j].x &&
                bullets[i].x < invaders[j].x + invaders[j].width &&
                bullets[i].y > invaders[j].y &&
                bullets[i].y < invaders[j].y + invaders[j].height
            ) {
                bulletsToRemove.push(i);
                invaders[j].health--;

                if (invaders[j].health <= 0) {
                    // Mark for removal
                    invadersToRemove.push({ index: j, x: invaders[j].x, y: invaders[j].y });
                    score += 10 * invaders[j].initialHealth; // More points for tougher enemies
                } else {
                    invaders[j].color = 'red'; // Show damage
                }

                break; // This bullet has hit an invader, check the next bullet
            }
        }
    }

    // Remove invaders and bullets that have collided
    // Sort in descending order to avoid index shifting issues
    invadersToRemove.sort((a, b) => b.index - a.index).forEach(inv => {
        invaders.splice(inv.index, 1);
        // Chance to drop a power-up
        if (Math.random() < 0.2) { // 20% chance
            const typeKeys = Object.keys(powerUpTypes);
            const randomTypeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
            const type = powerUpTypes[randomTypeKey];

            powerUps.push({
                x: inv.x + invader.width / 2 - powerUp.width / 2,
                y: inv.y,
                width: powerUp.width,
                height: powerUp.height,
                speed: powerUp.speed,
                ...type
            });
        }
    });
    bulletsToRemove.sort((a, b) => b - a).forEach(index => bullets.splice(index, 1));

    // Update and draw power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        pu.y += pu.speed;

        // Check for collision with player
        if (
            pu.x < player.x + player.width &&
            pu.x + pu.width > player.x &&
            pu.y < player.y + player.height &&
            pu.y + pu.height > player.y
        ) {
            // Apply power-up effect based on type
            switch (pu.type) {
                case 'SPEED_BOOST':
                    player.speed += 2;
                    break;
                case 'RAPID_FIRE':
                    player.shootCooldown = Math.max(100, player.shootCooldown - 100);
                    break;
            }
            powerUps.splice(i, 1); // Remove power-up
        }

        // Remove power-up if it goes off-screen
        if (pu.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }

    // Game over
    for (let i = 0; i < invaders.length; i++) {
        if (invaders[i].y + invaders[i].height > player.y) {
            gameOver = true;
            break;
        }
    }

    if (invaders.length === 0) {
        if (wave >= 2) {
            // You win!
            ctx.font = '50px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
            gameOver = true;
            return;
        } else {
            wave++;
            createInvaders(wave);
        }
    }

    requestAnimationFrame(update);
}

createInvaders(wave);
update();
