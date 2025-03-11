// Laad afbeeldingen
const baksteenImg = new Image();
baksteenImg.src = 'assets/baksteen.png';
const orangeDotImg = new Image();
orangeDotImg.src = 'assets/orange_dot.png';
const logoImg = new Image();
logoImg.src = 'assets/stipt_logo.png';
const powerupImg = new Image();
powerupImg.src = 'assets/powerup.png';
const bossImg = new Image();
bossImg.src = 'assets/boss.png';

// Laad geluiden
const shootSound = new Audio('assets/shoot.mp3');
const breakSound = new Audio('assets/break.mp3');
const powerupSound = new Audio('assets/powerup.mp3');
const warningSound = new Audio('assets/warning.mp3');

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.8;

// Spelvariabelen
let bullets = [];
let bricks = [];
let powerups = [];
let score = 0;
let level = 1;
let isGameRunning = false;
let isPaused = false;
let bulletIntervalId;
let brickSpeed = 0.25; // Start snelheid stenen
let brickOffsetY = 0;
const brickWidth = 80;
const brickHeight = 30;
let boss = null;
const bossHitsRequired = 20;
let bulletSpeed = 5; // Start kogel snelheid
let powerupTimer = null;
const powerupDuration = 10000; // 10 seconden
const levelUpScore = 1000; // Score voor level-up
const warningHeight = canvas.height - 200; // Waarschuwingshoogte

// Schieter
const shooter = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50
};

// Muispositie
let mouseX = shooter.x + shooter.width / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});
canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
});

// Maak bakstenen
function createBricks() {
    const rows = 100;
    const cols = Math.floor(canvas.width / brickWidth);
    const offset = brickWidth / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = col * brickWidth + (row % 2 === 0 ? offset : 0);
            if (x + brickWidth <= canvas.width) {
                bricks.push({
                    x: x,
                    baseY: -brickHeight * (rows - row),
                    width: brickWidth,
                    height: brickHeight,
                    visible: true
                });
            }
        }
    }
}

// Maak eindbaas
function createBoss() {
    boss = {
        x: canvas.width / 2 - 100,
        y: canvas.height / 4,
        width: 200,
        height: 100,
        hitsLeft: bossHitsRequired,
        visible: true
    };
}

// Powerup klasse
class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 1;
    }
    update() {
        this.y += this.speed;
    }
    draw() {
        ctx.drawImage(powerupImg, this.x, this.y, this.width, this.height);
    }
}

// Kogel klasse
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.speed = bulletSpeed;
    }
    update() {
        this.y -= this.speed;
    }
    draw() {
        ctx.drawImage(orangeDotImg, this.x, this.y, this.width, this.height);
    }
}

// Activeer powerup (snellere kogels én sneller schieten)
function activatePowerup() {
    bulletSpeed = 15; // Snellere kogels
    clearInterval(bulletIntervalId); // Stop het huidige schietinterval
    bulletIntervalId = setInterval(() => { // Start een sneller interval
        if (isGameRunning && !isPaused) {
            bullets.push(new Bullet(shooter.x + shooter.width / 2 - 5, shooter.y));
            let shootClone = new Audio(shootSound.src);
            shootClone.play();
        }
    }, 100); // Schiet elke 100ms (2x zo snel als normaal)
    if (powerupTimer) clearTimeout(powerupTimer);
    powerupTimer = setTimeout(() => {
        bulletSpeed = 5; // Terug naar normale snelheid
        clearInterval(bulletIntervalId); // Stop het snelle interval
        bulletIntervalId = setInterval(() => { // Terug naar normaal interval
            if (isGameRunning && !isPaused) {
                bullets.push(new Bullet(shooter.x + shooter.width / 2 - 5, shooter.y));
                let shootClone = new Audio(shootSound.src);
                shootClone.play();
            }
        }, 200); // Terug naar 200ms
    }, powerupDuration);
    let powerupClone = new Audio(powerupSound.src);
    powerupClone.play();
}

// Spel loop
function gameLoop() {
    if (!isGameRunning || isPaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Beweeg schieter
    shooter.x = mouseX - shooter.width / 2;
    if (shooter.x < 0) shooter.x = 0;
    if (shooter.x + shooter.width > canvas.width) shooter.x = canvas.width - shooter.width;
    ctx.drawImage(logoImg, shooter.x, shooter.y, shooter.width, shooter.height);

    // Beweeg stenen
    brickOffsetY += brickSpeed;

    // Update en teken kogels
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // Update en teken powerups
    powerups.forEach((powerup, index) => {
        powerup.update();
        powerup.draw();
        if (powerup.y > canvas.height) powerups.splice(index, 1);
        if (powerup.x < shooter.x + shooter.width &&
            powerup.x + powerup.width > shooter.x &&
            powerup.y < shooter.y + shooter.height &&
            powerup.y + powerup.height > shooter.y) {
            powerups.splice(index, 1);
            activatePowerup();
        }
    });

    // Teken stenen en check botsingen
    bricks.forEach((brick) => {
        if (brick.visible) {
            const drawY = brick.baseY + brickOffsetY;
            ctx.drawImage(baksteenImg, brick.x, drawY, brick.width, brick.height);

            bullets.forEach((bullet, bIndex) => {
                if (bullet.x < brick.x + brick.width &&
                    bullet.x + bullet.width > brick.x &&
                    bullet.y < drawY + brick.height &&
                    bullet.y + bullet.height > drawY) {
                    brick.visible = false;
                    bullets.splice(bIndex, 1);
                    score += 10;
                    if (Math.random() < 0.05) {
                        powerups.push(new Powerup(brick.x + brick.width / 2 - 10, drawY));
                    }
                    let breakClone = new Audio(breakSound.src);
                    breakClone.play();
                }
            });
        }
    });

    // Level up check
    if (score >= level * levelUpScore && level < 10) {
        level++;
        brickSpeed += 0.023;
        document.getElementById('level').textContent = `Level: ${level}`;
    }

    // Waarschuwingsgeluid
    if (isGameRunning && bricks.some(brick => brick.visible && (brick.baseY + brickOffsetY + brick.height) >= warningHeight)) {
        warningSound.play();
    } else {
        warningSound.pause();
        warningSound.currentTime = 0;
    }

    // Check of alle stenen weg zijn en spawn eindbaas
    if (bricks.every(brick => !brick.visible) && !boss) {
        createBoss();
    }

    // Teken en update eindbaas
    if (boss && boss.visible) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height);
        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y) {
                bullets.splice(bIndex, 1);
                boss.hitsLeft--;
                let breakClone = new Audio(breakSound.src);
                breakClone.play();
                if (boss.hitsLeft <= 0) {
                    boss.visible = false;
                    isGameRunning = false;
                    clearInterval(bulletIntervalId);
                    document.getElementById('winMessage').style.display = 'block';
                    document.getElementById('resetButton').style.display = 'block';
                    return;
                }
            }
        });
    }

    // Update score
    document.getElementById('score').textContent = `Score: ${score}`;

    // Game over check
    if (bricks.some(brick => brick.visible && (brick.baseY + brickOffsetY + brick.height) >= shooter.y)) {
        isGameRunning = false;
        clearInterval(bulletIntervalId);
        warningSound.pause();
        alert(`Game Over! Score: ${score}`);
        document.getElementById('resetButton').style.display = 'block';
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Start spel
function startGame() {
    isGameRunning = true;
    isPaused = false;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'block';
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('winMessage').style.display = 'none';
    brickOffsetY = 0;
    level = 1;
    score = 0;
    brickSpeed = 0.25;
    bulletSpeed = 15;
    bricks = [];
    bullets = [];
    powerups = [];
    boss = null;
    createBricks();
    bulletIntervalId = setInterval(() => {
        if (isGameRunning && !isPaused) {
            bullets.push(new Bullet(shooter.x + shooter.width / 2 - 5, shooter.y));
            let shootClone = new Audio(shootSound.src);
            shootClone.play();
        }
    }, 200); // Normaal schietinterval
    gameLoop();
}

// Reset spel
function resetGame() {
    isGameRunning = false;
    isPaused = false;
    clearInterval(bulletIntervalId);
    if (powerupTimer) clearTimeout(powerupTimer);
    score = 0;
    level = 1;
    brickSpeed = 0.3;
    bulletSpeed = 15;
    bricks = [];
    bullets = [];
    powerups = [];
    boss = null;
    brickOffsetY = 0;
    document.getElementById('score').textContent = `Score: 0`;
    document.getElementById('level').textContent = `Level: 1`;
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('winMessage').style.display = 'none';
    warningSound.pause();
    warningSound.currentTime = 0;
}

// Pauzeer spel
function togglePause() {
    if (!isGameRunning) return;
    isPaused = !isPaused;
    document.getElementById('pauseButton').textContent = isPaused ? 'Hervat' : 'Pauze';
    if (!isPaused) gameLoop();
    else warningSound.pause();
}

// Event listeners
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('resetButton').addEventListener('click', resetGame);
document.getElementById('pauseButton').addEventListener('click', togglePause);

// Initialiseer spel
resetGame();