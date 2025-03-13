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
canvas.width = 800; // Logische breedte
canvas.style.width = '800px'; // Visuele breedte
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
const bossHitsRequired = 60;
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

// Muis- en touchpositie
let mouseX = shooter.x + shooter.width / 2; // Start in het midden

// Muisbeweging
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Schaling corrigeren
    mouseX = Math.max(0, Math.min((e.clientX - rect.left) * scaleX, canvas.width));
});

// Touchbediening
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Schaling corrigeren
    mouseX = Math.max(0, Math.min((e.touches[0].clientX - rect.left) * scaleX, canvas.width));
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Schaling corrigeren
    mouseX = Math.max(0, Math.min((e.touches[0].clientX - rect.left) * scaleX, canvas.width));
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    // Laat mouseX staan waar hij is, shooter stopt
}, { passive: false });

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
    const topBrickY = bricks.length > 0 ? Math.min(...bricks.map(brick => brick.baseY)) - 50 : 0; // Boven de hoogste steen
    boss = {
        x: 0,
        y: topBrickY,
        width: canvas.width,
        height: 50,
        hitsLeft: bossHitsRequired,
        visible: true
    };
    console.log("Boss gespawned op y:", topBrickY);
    warningSound.pause();
    warningSound.currentTime = 0;
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

// Activeer powerup
function activatePowerup() {
    bulletSpeed = 15; // Snellere kogels
    clearInterval(bulletIntervalId);
    bulletIntervalId = setInterval(() => {
        if (isGameRunning && !isPaused) {
            bullets.push(new Bullet(shooter.x + shooter.width / 2 - 5, shooter.y));
            let shootClone = new Audio(shootSound.src);
            shootClone.play();
        }
    }, 100); // Schiet elke 100ms
    if (powerupTimer) clearTimeout(powerupTimer);
    powerupTimer = setTimeout(() => {
        bulletSpeed = 5;
        clearInterval(bulletIntervalId);
        bulletIntervalId = setInterval(() => {
            if (isGameRunning && !isPaused) {
                bullets.push(new Bullet(shooter.x + shooter.width / 2 - 5, shooter.y));
                let shootClone = new Audio(shootSound.src);
                shootClone.play();
            }
        }, 200);
    }, powerupDuration);
    let powerupClone = new Audio(powerupSound.src);
    powerupClone.play();
}

function gameLoop() {
    if (!isGameRunning || isPaused) return;

    // Wis canvas met witte achtergrond
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Beweeg schieter
    shooter.x = mouseX - shooter.width / 2;
    if (shooter.x < 0) shooter.x = 0;
    if (shooter.x + shooter.width > canvas.width) shooter.x = canvas.width - shooter.width;
    if (logoImg.complete && logoImg.naturalWidth !== 0) {
        ctx.drawImage(logoImg, shooter.x, shooter.y, shooter.width, shooter.height);
    }

    // Beweeg stenen
    brickOffsetY += brickSpeed;

    // Update en teken kogels
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (orangeDotImg.complete && orangeDotImg.naturalWidth !== 0) {
            bullet.draw();
        }
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // Update en teken powerups
    powerups.forEach((powerup, index) => {
        powerup.update();
        if (powerupImg.complete && powerupImg.naturalWidth !== 0) {
            powerup.draw();
        }
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
    bricks.forEach((brick, index) => {
        if (brick.visible) {
            const drawY = brick.baseY + brickOffsetY;
            if (baksteenImg.complete && baksteenImg.naturalWidth !== 0) {
                ctx.drawImage(baksteenImg, brick.x, drawY, brick.width, brick.height);
            }

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

    // Waarschuwingsgeluid (alleen als geen eindbaas)
    if (isGameRunning && !boss && bricks.some(brick => brick.visible && (brick.baseY + brickOffsetY + brick.height) >= warningHeight)) {
        warningSound.play();
    } else {
        warningSound.pause();
        warningSound.currentTime = 0;
    }

    // Teken en update eindbaas
    if (boss && boss.visible) {
        const bossY = boss.y + brickOffsetY;
        if (bossImg.complete && bossImg.naturalWidth !== 0) {
            ctx.drawImage(bossImg, boss.x, bossY, boss.width, boss.height);
        } else {
            console.error("Boss image failed to load");
        }

        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < bossY + boss.height &&
                bullet.y + bullet.height > bossY) {
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
                    console.log("Boss verslagen, je wint!");
                    return;
                }
            }
        });

        if (bossY + boss.height >= shooter.y) {
            isGameRunning = false;
            clearInterval(bulletIntervalId);
            warningSound.pause();
            alert(`Game Over! Score: ${score}`);
            document.getElementById('resetButton').style.display = 'block';
            console.log("Boss raakt shooter, game over");
            return;
        }
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

    // Herhaal de animatie
    requestAnimationFrame(gameLoop);
}

// Start spel
function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'block';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('level').style.display = 'block';
    score = 0;
    level = 1;
    brickSpeed = 0.4;
    brickOffsetY = 0;
    bricks = [];
    bullets = [];
    powerups = [];
    boss = null; // Reset boss
    createBricks();
    createBoss(); // Spawn boss aan het begin
    shooter.x = canvas.width / 2 - 25;
    bulletIntervalId = setInterval(() => {
        bullets.push(new Bullet(shooter.x + shooter.width / 2 - 5, shooter.y));
    }, 250);
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
    brickSpeed = 0.25;
    bulletSpeed = 5;
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