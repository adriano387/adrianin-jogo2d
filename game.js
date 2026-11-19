
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");
const restartButton = document.getElementById("restartButton");

const WIDTH = 900;
const HEIGHT = 500;
const GROUND = 420;

let player;
let obstacles;
let camera;
let speed;
let score;
let gameOver;
let nextObstacle;

const keys = {};

function createPlayer() {
    return {
        x: 150,
        y: GROUND - 65,
        width: 42,
        height: 65,
        velocityY: 0,
        grounded: true,
        animation: 0
    };
}

function createObstacle(x) {
    const types = ["rock", "box", "log"];
    const type = types[Math.floor(Math.random() * types.length)];

    const dimensions = {
        rock: { width: 45, height: 35 },
        box: { width: 42, height: 45 },
        log: { width: 65, height: 30 }
    };

    obstacles.push({
        x: x,
        width: dimensions[type].width,
        height: dimensions[type].height,
        type: type
    });
}

function restartGame() {
    player = createPlayer();
    obstacles = [];
    camera = 0;
    speed = 5;
    score = 0;
    gameOver = false;
    nextObstacle = 750;

    createObstacle(650);

    gameOverScreen.classList.add("hidden");
}

document.addEventListener("keydown", function(event) {
    keys[event.code] = true;

    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();

        if (gameOver) {
            restartGame();
        }
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.code] = false;
});

restartButton.addEventListener("click", restartGame);

// DESENHAR FUNDO
function drawBackground() {
    // Céu
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Sol
    ctx.fillStyle = "#FFE17A";
    ctx.beginPath();
    ctx.arc(750, 85, 40, 0, Math.PI * 2);
    ctx.fill();

    // Montanhas distantes
    ctx.fillStyle = "#86A995";

    for (let i = -1; i < 8; i++) {
        let x = i * 300 - (camera * 0.2 % 300);

        ctx.beginPath();
        ctx.moveTo(x, 380);
        ctx.lineTo(x + 150, 190);
        ctx.lineTo(x + 300, 380);
        ctx.fill();
    }

    // Árvores
    for (let i = -1; i < 12; i++) {
        let x = i * 180 - (camera * 0.6 % 180);

        // Tronco
        ctx.fillStyle = "#70452C";
        ctx.fillRect(x + 30, 330, 18, 90);

        // Folhagem
        ctx.fillStyle = "#176B3A";
        ctx.beginPath();
        ctx.arc(x + 39, 315, 42, 0, Math.PI * 2);
        ctx.fill();
    }

    // Chão
    ctx.fillStyle = "#287A39";
    ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);

    // Detalhes do chão
    ctx.fillStyle = "#A0784C";

    for (let i = 0; i < 20; i++) {
        let x = i * 70 - (camera % 70);
        ctx.fillRect(x, 455, 35, 5);
    }
}

// DESENHAR BONEQUINHO
function drawPlayer() {
    const x = player.x;
    const y = player.y;

    const movement = player.grounded
        ? Math.sin(player.animation) * 6
        : 0;

    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(x + 21, GROUND + 2, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pernas
    ctx.strokeStyle = "#26334B";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x + 16, y + 47);
    ctx.lineTo(x + 13 + movement, y + 61);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 28, y + 47);
    ctx.lineTo(x + 30 - movement, y + 61);
    ctx.stroke();

    // Sapatos
    ctx.fillStyle = "#33251C";
    ctx.fillRect(x + 5 + movement, y + 57, 17, 7);
    ctx.fillRect(x + 23 - movement, y + 57, 17, 7);

    // Corpo
    ctx.fillStyle = "#2875D0";
    ctx.fillRect(x + 8, y + 24, 28, 27);

    // Braços
    ctx.strokeStyle = "#F1BB88";
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(x + 9, y + 29);
    ctx.lineTo(x + 3, y + 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 34, y + 29);
    ctx.lineTo(x + 40, y + 40);
    ctx.stroke();

    // Cabeça
    ctx.fillStyle = "#F1BB88";
    ctx.beginPath();
    ctx.arc(x + 22, y + 14, 15, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo
    ctx.fillStyle = "#53321E";
    ctx.beginPath();
    ctx.arc(x + 22, y + 8, 14, Math.PI, Math.PI * 2);
    ctx.fill();

    // Olho
    ctx.fillStyle = "#222222";
    ctx.fillRect(x + 29, y + 13, 3, 4);
}

// DESENHAR OBSTÁCULOS
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const x = obstacle.x - camera;
        const y = GROUND - obstacle.height;

        if (obstacle.type === "rock") {
            ctx.fillStyle = "#777777";

            ctx.beginPath();
            ctx.moveTo(x, GROUND);
            ctx.lineTo(x + 8, y + 10);
            ctx.lineTo(x + 25, y);
            ctx.lineTo(x + 38, y + 12);
            ctx.lineTo(x + obstacle.width, GROUND);
            ctx.fill();

        } else if (obstacle.type === "box") {
            ctx.fillStyle = "#92572C";
            ctx.fillRect(x, y, obstacle.width, obstacle.height);

            ctx.strokeStyle = "#57351E";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, obstacle.width, obstacle.height);

        } else {
            ctx.fillStyle = "#70452C";
            ctx.fillRect(x, y + 5, obstacle.width, 25);

            ctx.fillStyle = "#A8794C";
            ctx.fillRect(x + 8, y + 8, 8, 19);
        }
    });
}

// ATUALIZAR PERSONAGEM

function updatePlayer() {
    if (
        (keys["Space"] || keys["ArrowUp"]) &&
        player.grounded
    ) {
        player.velocityY = -13;
        player.grounded = false;
    }

    player.velocityY += 0.6;
    player.y += player.velocityY;

    if (player.y + player.height >= GROUND) {
        player.y = GROUND - player.height;
        player.velocityY = 0;
        player.grounded = true;
        player.jumps = 0;
    }

    player.animation += 0.15;
}
document.addEventListener("keyup", function(event) {
    keys[event.code] = false;
});


// VERIFICAR COLISÃO
function checkCollision(player, obstacle) {
    const obstacleX = obstacle.x - camera;
    const obstacleY = GROUND - obstacle.height;

    return (
        player.x + 6 < obstacleX + obstacle.width &&  
        player.x + player.width - 6 > obstacleX &&
        player.y + 5 < obstacleY + obstacle.height &&
        player.y + player.height > obstacleY
    );
}

// ATUALIZAR JOGO
function update() {
    if (gameOver) return;

    updatePlayer();

    // Câmera e mundo
    camera += speed;

    // Pontuação
    score++;
    speed = 5 + Math.min(score / 1500, 4);

    // Criar novos obstáculos
    if (nextObstacle < camera + WIDTH + 100) {
        createObstacle(nextObstacle);
        nextObstacle += 400 + Math.random() * 250;
    }

    // Colisão
    for (const obstacle of obstacles) {
        if (checkCollision(player, obstacle)) {
            gameOver = true;
            gameOverScreen.classList.remove("hidden");
            break;
        }
    }

    // Remover obstáculos antigos
    obstacles = obstacles.filter(
        obstacle => obstacle.x - camera > -100
    );
}

// DESENHAR JOGO
function draw() {
    drawBackground();
    drawObstacles();
    drawPlayer();

    ctx.fillStyle = "white";
    ctx.font = "bold 25px Arial";
    ctx.fillText("PONTOS: " + Math.floor(score / 10), 25, 40);
}

// LOOP PRINCIPAL
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// INICIAR
restartGame();
gameLoop();
// Botões do celular
function apertar(tecla) {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: tecla}));
}
function soltar(tecla) {
  document.dispatchEvent(new KeyboardEvent('keyup', {key: tecla}));
}

let btnEsq = document.getElementById('btn-esquerda');
let btnDir = document.getElementById('btn-direita');
let btnPular = document.getElementById('btn-pular');

btnEsq.addEventListener('touchstart', () => apertar('ArrowLeft'));
btnEsq.addEventListener('touchend', () => soltar('ArrowLeft'));

btnDir.addEventListener('touchstart', () => apertar('ArrowRight'));
btnDir.addEventListener('touchend', () => soltar('ArrowRight'));

btnPular.addEventListener('touchstart', () => apertar(' '));
btnPular.addEventListener('touchend', () => soltar(' '));