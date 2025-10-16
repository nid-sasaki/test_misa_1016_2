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

function createInvaders() {
    for (let c = 0; c < invaderCols; c++) {
        for (let r = 0; r < invaderRows; r++) {
            invaders.push({
                x: c * (invader.width + 10) + 30,
                y: r * (invader.height + 10) + 30,
                width: invader.width,
                height: invader.height,
                color: invader.color,
                speed: invader.speed
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

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 10, 20);
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
    drawScore();

    // Move player
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    } else if (leftPressed && player.x > 0) {
        player.x -= player.speed;
    }

    // Shoot bullets
    if (spacePressed) {
        bullets.push({
            x: player.x + player.width / 2 - bullet.width / 2,
            y: player.y,
            width: bullet.width,
            height: bullet.height,
            color: bullet.color,
            speed: bullet.speed
        });
        spacePressed = false; // prevent multiple bullets from being fired at once
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
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < invaders.length; j++) {
            if (
                bullets[i].x > invaders[j].x &&
                bullets[i].x < invaders[j].x + invaders[j].width &&
                bullets[i].y > invaders[j].y &&
                bullets[i].y < invaders[j].y + invaders[j].height
            ) {
                bullets.splice(i, 1);
                i--;
                invaders.splice(j, 1);
                score += 10;
                break; // exit inner loop
            }
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
        // You win!
        ctx.font = '50px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
        gameOver = true;
    }

    requestAnimationFrame(update);
}

createInvaders();
update();
