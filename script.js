// script.js

const boardElement = document.getElementById('board');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');
const messageElement = document.querySelector('.message');
const scoreboard = document.getElementById('scoreboard');

let board = ['', '', '', '', '', '', '', '', ''];
let userTurn = true;  // true = usuário, false = máquina
let gameActive = false;
let playerSymbol = 'X';
let computerSymbol = 'O';
let firstGame = true;
let matchCount = 0;
let userWins = 0;
let computerWins = 0;
let draws = 0;
let seriesOver = false;

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function createBoard() {
  boardElement.innerHTML = '';
  boardElement.style.borderColor = getBorderColor();
  board.forEach((cell, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.dataset.index = index;
    cellDiv.textContent = cell;
    cellDiv.addEventListener('click', onCellClick);
    boardElement.appendChild(cellDiv);
  });
}

function getBorderColor() {
  // Cores diferentes para cada partida (mod 5)
  const colors = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c'];
  return colors[matchCount % colors.length];
}

function onCellClick(e) {
  if (!gameActive) return;
  const index = e.target.dataset.index;
  if (board[index] !== '') return;
  if (!userTurn) return;

  makeMove(index, playerSymbol);
  if (checkResult(playerSymbol)) return;
  userTurn = false;

  setTimeout(() => {
    computerPlay();
  }, 400);
}

function makeMove(index, symbol) {
  board[index] = symbol;
  updateBoard();
}

function updateBoard() {
  const cells = boardElement.querySelectorAll('.cell');
  cells.forEach((cell, idx) => {
    cell.textContent = board[idx];
  });
}

function checkResult(symbol) {
  if (checkWin(symbol)) {
    gameActive = false;
    updateScore(symbol);
    showMessage(symbol === playerSymbol ? "Você teve sorte desta vez" : "Computador venceu esta partida");
    checkSeriesOver();
    return true;
  }
  if (board.every(cell => cell !== '')) {
    gameActive = false;
    draws++;
    updateScore();
    showMessage("Empate!");
    checkSeriesOver();
    return true;
  }
  return false;
}

function checkWin(symbol) {
  return winningCombinations.some(comb => comb.every(idx => board[idx] === symbol));
}

function updateScore(winner) {
  if (winner === playerSymbol) userWins++;
  else if (winner === computerSymbol) computerWins++;
  // Empates já contados na função anterior
  scoreboard.textContent = `Vitórias Usuário: ${userWins} | Vitórias Máquina: ${computerWins} | Empates: ${draws}`;
}

function showMessage(msg) {
  messageElement.textContent = msg;
}

function computerPlay() {
  if (!gameActive) return;

  let move;

  // Lógica para primeira partida: deixa usuário ganhar, mas sistema joga normalmente
  if (firstGame) {
    move = bestMove();
  } else {
    // A partir da 2ª partida, foca em empate, evita perder
    move = defensiveMove();
  }

  makeMove(move, computerSymbol);

  if (checkResult(computerSymbol)) return;

  userTurn = true;
  showMessage("Sua vez");
}

function bestMove() {
  // Escolhe melhor movimento (ataca e defende)
  let move = findWinningMove(computerSymbol);
  if (move !== -1) return move;

  move = findWinningMove(playerSymbol);
  if (move !== -1) return move;

  if (board[4] === '') return 4;

  const corners = [0,2,6,8].filter(i => board[i] === '');
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];

  const sides = [1,3,5,7].filter(i => board[i] === '');
  if (sides.length) return sides[Math.floor(Math.random()*sides.length)];

  return board.findIndex(c => c === '');
}

function defensiveMove() {
  // Evita perder e tenta empatar
  // Se tem chance de ganhar, aproveita
  let move = findWinningMove(computerSymbol);
  if (move !== -1) return move;

  // Bloqueia vitória do usuário
  move = findWinningMove(playerSymbol);
  if (move !== -1) return move;

  // Caso contrário, tenta evitar jogadas que deixem usuário vencer

  // Para simplificação, segue mesma estratégia que bestMove mas prioriza bloqueios
  return bestMove();
}

function findWinningMove(symbol) {
  for (const comb of winningCombinations) {
    const marks = comb.map(idx => board[idx]);
    if (marks.filter(m => m === symbol).length === 2 && marks.includes('')) {
      return comb[marks.indexOf('')];
    }
  }
  return -1;
}

function nextMatch() {
  if (seriesOver) return;

  matchCount++;
  board.fill('');
  createBoard();

  // Alterna quem começa: partidas ímpares -> usuário; partidas pares -> computador
  if (matchCount % 2 === 1) {
    userTurn = true;
    showMessage("Sua vez (você começa a partida)");
  } else {
    userTurn = false;
    showMessage("Computador começa a partida");
    setTimeout(() => {
      computerPlay();
    }, 500);
  }

  // Define se é a primeira partida para a lógica especial de deixar usuário ganhar só na 1ª partida
  firstGame = (matchCount === 1);

  gameActive = true;
  nextBtn.disabled = true;
  resetBtn.disabled = false;
}

function resetSeries() {
  matchCount = 0;
  userWins = 0;
  computerWins = 0;
  draws = 0;
  seriesOver = false;
  board.fill('');
  createBoard();
  scoreboard.textContent = `Vitórias Usuário: 0 | Vitórias Máquina: 0 | Empates: 0`;
  showMessage("Clique em 'Próxima Partida' para iniciar");
  nextBtn.disabled = false;
  resetBtn.disabled = true;
  gameActive = false;
}

function checkSeriesOver() {
  if (userWins === 3 || computerWins === 3) {
    seriesOver = true;
    gameActive = false;
    nextBtn.disabled = true;
    resetBtn.disabled = false;
    showMessage(`Parabéns ao vencedor: ${userWins === 3 ? "Usuário" : "Computador"}`);
  } else {
    nextBtn.disabled = false;
  }
}

// Eventos
nextBtn.addEventListener('click', nextMatch);
resetBtn.addEventListener('click', resetSeries);

// Inicialização
resetSeries();
