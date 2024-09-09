let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let bombProbability = 3;
let maxProbability = 15;

const difficulties = {
    easy: { rowCount: 9, colCount: 9, bombProbability: 3 },
    medium: { rowCount: 16, colCount: 16, bombProbability: 5 },
    hard: { rowCount: 24, colCount: 24, bombProbability: 7 }
};

document.getElementById('startGame').addEventListener('click', () => {
    const difficulty = document.getElementById('difficulty').value;
    bombProbability = parseInt(document.getElementById('bombProbability').value);
    maxProbability = parseInt(document.getElementById('maxProbability').value);

    startGame(difficulty);
});

document.getElementById('restartGame').addEventListener('click', () => {
    document.getElementById('winMessage').style.display = 'none';
    document.getElementById('restartGame').style.display = 'none';
    document.getElementById('startGame').style.display = 'inline';
    const difficulty = document.getElementById('difficulty').value;
    startGame(difficulty);
});

function startGame(difficulty) {
    const config = difficulties[difficulty];
    generateBoard(config.rowCount, config.colCount);
    renderBoard();
}

function generateBoard(rowCount, colCount) {
    board = [];
    bombCount = 0;
    openedSquares = [];
    flaggedSquares = [];
    squaresLeft = rowCount * colCount;

    // Generate empty board
    for (let i = 0; i < rowCount; i++) {
        board[i] = [];
        for (let j = 0; j < colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    // Place bombs based on bomb probability
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
                updateBombCountAround(i, j);
            }
        }
    }
}

function updateBombCountAround(row, col) {
    for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, board.length - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, board[i].length - 1); j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround++;
            }
        }
    }
}

function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateRows = `repeat(${board.length}, 1fr)`;
    gameBoard.style.gridTemplateColumns = `repeat(${board[0].length}, 1fr)`;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = document.createElement('div');
            square.classList.add('board-square');
            square.dataset.row = i;
            square.dataset.col = j;

            square.addEventListener('click', handleSquareClick);
            square.addEventListener('contextmenu', handleRightClick);

            gameBoard.appendChild(square);
        }
    }
}

function handleSquareClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col].hasBomb) {
        alert('Game Over! You hit a bomb.');
        revealBoard();
    } else {
        openSquare(row, col);
    }
}

function handleRightClick(event) {
    event.preventDefault();
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (!openedSquares.includes(`${row}-${col}`)) {
        event.target.classList.toggle('flagged');
    }
}

function openSquare(row, col) {
    if (openedSquares.includes(`${row}-${col}`)) return;

    const square = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    square.classList.add('open');
    openedSquares.push(`${row}-${col}`);

    if (board[row][col].bombsAround > 0) {
        square.textContent = board[row][col].bombsAround;
    } else {
        for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, board.length - 1); i++) {
            for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, board[i].length - 1); j++) {
                openSquare(i, j);
            }
        }
    }

    squaresLeft--;
    if (squaresLeft === bombCount) {
        displayWinMessage();
        revealBoard();
    }
}

function revealBoard() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = document.querySelector(`[data-row='${i}'][data-col='${j}']`);
            if (board[i][j].hasBomb) {
                square.classList.add('bomb');
            } else if (board[i][j].bombsAround > 0) {
                square.textContent = board[i][j].bombsAround;
            }
        }
    }
}

function displayWinMessage() {
    document.getElementById('winMessage').style.display = 'block';
    document.getElementById('restartGame').style.display = 'inline';
    document.getElementById('startGame').style.display = 'none';
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}
