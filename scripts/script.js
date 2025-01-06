const grid = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");
const GRID_SIZE = 4;
const INITIAL_TILES = 2;
const TILE_STYLES = {
    2: { background: '#eee4da' },
    4: { background: '#ede0c8' },
    8: { background: '#f2b179', color: '#f9f6f2' },
    16: { background: '#f59564', color: '#f9f6f2' },
    32: { background: '#f67c5f', color: '#f9f6f2' },
    64: { background: '#f65e3b', color: '#f9f6f2' },
    128: { background: '#edcf72', color: '#f9f6f2', fontSize: '35px' },
    512: { background: '#edc850', color: '#f9f6f2', fontSize: '35px' },
    1024: { background: '#edc53f', color: '#f9f6f2', fontSize: '30px' },
    2048: { background: '#edc22e', color: '#f9f6f2', fontSize: '30px' },
};


let cells = Array(GRID_SIZE * GRID_SIZE).fill(0);
let score = 0;
let gameRunning = true;

let touchStartX = 0;
let touchStartY = 0;

function initGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
    }
}

function updateDisplay() {
    const tiles = document.querySelectorAll('.cell');

    cells.forEach((value, index) => {
        const tile = tiles[index];
        tile.textContent = value || '';
        tile.setAttribute('data-value', value);

        tile.style.background = '';
        tile.style.color = '';
        tile.style.fontSize = '';

        const style = TILE_STYLES[value];
        if (style) {
            Object.assign(tile.style, style);
        }
    });
    scoreElement.textContent = score;
}


function checkGameOver() {
    if (cells.includes(0)) return false;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 1; col++) {
            const currentIndex = row * GRID_SIZE + col;
            const nextIndex = currentIndex + 1;
            if (cells[currentIndex] === cells[nextIndex]) return false;
        }
    }

    for (let row = 0; row < GRID_SIZE - 1; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const currentIndex = row * GRID_SIZE + col;
            const belowIndex = currentIndex + GRID_SIZE;
            if (cells[currentIndex] === cells[belowIndex]) return false;
        }
    }
    return true;
}

function checkWin() {
    if (cells.includes(2048)) {
        gameOverScreen.querySelector('h2').textContent = "Fim de jogo!";
        gameOver('win');
        return true;
    }
    return false;
}

function restartGame() {
    gameRunning = true;
    score = 0;
    cells = Array(GRID_SIZE * GRID_SIZE).fill(0);

    gameOverScreen.style.display = 'none';
    scoreElement.textContent = '0';

    initGrid();
    addNewTile();
    addNewTile();
    updateDisplay();
}

function addNewTile() {
    const emptyCells = cells.reduce((acc, cell, index) => {
        if (cell === 0) acc.push(index);
        return acc;
    }, []);

    if (emptyCells.length > 0) {
        const randomCellIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        cells[randomCellIndex] = Math.random() < 0.9 ? 2 : 4;
    }
}

initGrid();
for (let i = 0; i < INITIAL_TILES; i++) {
    addNewTile();
}
updateDisplay();

function gameOver(type = 'lose') {
    gameRunning = false;
    gameOverScreen.style.display = 'flex';

    const message = type === 'win'
        ? 'Você conseguiu, parabéns!'
        : `Fim de jogo! Pontuação: ${score}`;

    gameOverScreen.querySelector('h2').textContent = message;
}

function getLine(direction, i) {
    switch (direction) {
        case 'ArrowUp': return [i, i + GRID_SIZE, i + 2 * GRID_SIZE, i + 3 * GRID_SIZE];
        case 'ArrowDown': return [i + 3 * GRID_SIZE, i + 2 * GRID_SIZE, i + GRID_SIZE, i];
        case 'ArrowLeft': return [i * GRID_SIZE, i * GRID_SIZE + 1, i * GRID_SIZE + 2, i * GRID_SIZE + 3];
        case 'ArrowRight': return [i * GRID_SIZE + 3, i * GRID_SIZE + 2, i * GRID_SIZE + 1, i * GRID_SIZE];
    }
}

function slideLine(line) {
    return line.filter(x => x !== 0);
}

function mergeLine(line) {
    let result = slideLine(line);
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === result[i + 1]) {
            result[i] *= 2;
            score += result[i];
            result.splice(i + 1, 1);
            i--;
        }
    }

    while (result.length < GRID_SIZE) {
        result.push(0);
    }

    return result;
}

function moveLine(direction, i) {
    const line = getLine(direction, i);
    const values = line.map(pos => cells[pos]);
    const merged = mergeLine(values);
    line.forEach((pos, index) => {
        cells[pos] = merged[index];
    });
}
function move(direction) {
    if (!gameRunning) return;
    const oldCells = [...cells];

    for (let i = 0; i < GRID_SIZE; i++) {
        moveLine(direction, i)
    }

    const moved = cells.some((cell, index) => cell !== oldCells[index]);

    if (moved) {
        addNewTile();
        updateDisplay();
        if (!checkWin()) {
            if (checkGameOver()) {
                gameOver('lose');
            }
        }
    }
}

grid.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
});

grid.addEventListener('touchend', (e) => {
    if (!gameRunning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const distX = touchEndX - touchStartX;
    const distY = touchEndY - touchStartY;

    const absDistX = Math.abs(distX);
    const absDistY = Math.abs(distY);


    if (absDistX > 20 || absDistY > 20) {
        let direction = '';
        if (absDistX > absDistY) {
            direction = distX > 0 ? 'ArrowRight' : 'ArrowLeft';
        } else {
            direction = distY > 0 ? 'ArrowDown' : 'ArrowUp';
        }

        move(direction);
    }

});

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move(e.key);
    }
});

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

const audio = document.getElementById('musica');
audio.play().catch(error => console.log("Reprodução automática bloqueada: ", error));

document.addEventListener('DOMContentLoaded', function () {
    const musica = document.getElementById('musica');

    if (musica) {
        musica.volume = 0.5;
        musica.play();
    }

});