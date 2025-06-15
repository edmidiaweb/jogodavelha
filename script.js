const boardElement = document.getElementById('board');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');
const messageElement = document.querySelector('.message');
const scoreboard = document.getElementById('scoreboard');

let board = Array(9).fill('');
let userTurn = true;
let playerSymbol = 'X';
let computerSymbol = 'O';
let matchCount = 0;
let userWins = 0;
let computerWins = 0;
let draws = 0;
let seriesOver = false;
let firstGame = true;

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];
function createBoard() {
  boardElement.innerHTML = '';
  boardElement.style.borderColor = getBorderColor();
  board.forEach((_, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.dataset.index = index;
    cellDiv.addEventListener('click', onCellClick);
    boardElement.appendChild(cellDiv);
  });
}

function getBorderColor() {
  const colors = ['#00ffff', '#ff6600', '#00ff00', '#9900cc', '#ff3333'];
  return colors[matchCount % colors.length];
}

function onCellClick(e) {
  if (!userTurn || seriesOver || board[e.target.dataset.index] !== '') return;
  makeMove(e.target.dataset.index, playerSymbol);
  if (!checkResult(playerSymbol)) {
    userTurn = false;
    setTimeout(computerPlay, 400);
  }
}
function makeMove(index, symbol) {
  board[index] = symbol;
  updateBoard();
}

function updateBoard() {
  boardElement.querySelectorAll('.cell').forEach((cell, idx) => {
    cell.textContent = board[idx];
  });
}

function checkResult(symbol) {
  if (checkWin(symbol)) {
    gameActive = false;
    animateVictory();
    updateScore(symbol);
    let msg = symbol === playerSymbol ? "Você teve sorte desta vez" : getRandomTaunt();
    showMessage(msg);
    checkSeriesOver();
    return true;
  }
  if (board.every(cell => cell !== '')) {
    draws++;
    updateScore();
    showMessage("Empate! " + getRandomTaunt());
    checkSeriesOver();
    return true;
  }
  return false;
}

function checkWin(symbol) {
  return winningCombinations.some(comb => comb.every(i => board[i] === symbol));
}

function animateVictory() {
  boardElement.classList.add('borda-piscando');
  setTimeout(() => boardElement.classList.remove('borda-piscando'), 600);
}
function computerPlay() {
  let move = firstGame ? bestMove() : defensiveMove();
  makeMove(move, computerSymbol);
  if (!checkResult(computerSymbol)) {
    userTurn = true;
    showMessage("Sua vez");
  }
}

function bestMove() {
  return strategicMove(computerSymbol, playerSymbol);
}

function defensiveMove() {
  return strategicMove(playerSymbol, computerSymbol);
}

function strategicMove(primary, secondary) {
  let move = findWinningMove(secondary);
  if (move !== -1) return move;
  move = findWinningMove(primary);
  if (move !== -1) return move;
  if (board[4] === '') return 4;
  return [0,2,6,8,1,3,5,7].find(i => board[i] === '') ?? -1;
}

function findWinningMove(sym) {
  for (const [a,b,c] of winningCombinations) {
    const line = [board[a], board[b], board[c]];
    const idx = line.indexOf('');
    if (line.filter(x => x === sym).length === 2 && idx !== -1)
      return [a,b,c][idx];
  }
  return -1;
}
function nextMatch() {
  if (seriesOver) return;
  matchCount++;
  board.fill('');
  createBoard();
  firstGame = matchCount === 1;
  userTurn = matchCount % 2 === 1;
  showMessage(userTurn ? "Você começa!" : "Computador começa!");
  gameActive = true;
  nextBtn.disabled = true;
  resetBtn.disabled = false;
  if (!userTurn) setTimeout(computerPlay, 600);
}

function resetSeries() {
  matchCount = userWins = computerWins = draws = 0;
  board.fill('');
  createBoard();
  updateScore();
  showMessage("Clique em 'Próxima Partida' para iniciar.");
  nextBtn.disabled = false;
  resetBtn.disabled = true;
  seriesOver = false;
}

function updateScore(winner) {
  if (winner === playerSymbol) userWins++;
  else if (winner === computerSymbol) computerWins++;
  scoreboard.textContent = `Vitórias Usuário: ${userWins} | Vitórias Máquina: ${computerWins} | Empates: ${draws}`;
}

function checkSeriesOver() {
  if (userWins === 3 || computerWins === 3) {
    seriesOver = true;
    showMessage(`Parabéns ao vencedor: ${userWins === 3 ? "Usuário" : "Computador"}`);
    nextBtn.disabled = true;
    resetBtn.disabled = false;
  } else {
    nextBtn.disabled = false;
  }
}

function showMessage(msg) {
  messageElement.textContent = msg;
}

function getRandomTaunt() {
  const frases = [
    "Tente de novo, humano!",
    "Hoje não é seu dia!",
    "Você realmente achou que ia ganhar?",
    "Empatar é o seu limite!",
    "Computador 1 x 0 Humanidade!"
  ];
  return frases[Math.floor(Math.random() * frases.length)];
}

// Eventos
nextBtn.addEventListener('click', nextMatch);
resetBtn.addEventListener('click', resetSeries);

// Inicializar
resetSeries();
