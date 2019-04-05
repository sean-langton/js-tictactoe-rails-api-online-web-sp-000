// Code your JavaScript / jQuery solution here

var winningCombos =[[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

var turn = 0;
var currentGame = 0;

var player = () => turn % 2 ? 'O' : 'X';

function updateState(element) {
  $(element).text(player())
}

function setMessage(string) {
  $('#message').text(string)
}

function checkWinner() {
  var winner = false
  var board = {}

  $('td').text((index, element) => board[index] = element);

 winningCombos.some(function(combo) {
   if (board[combo[0]] !== "" && board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]]) {
    setMessage(`Player ${board[combo[0]]} Won!`);
     return winner = true;
   }
 });

 return winner;
}

function doTurn(element) {
  updateState(element);
  turn++;
  if (checkWinner()) {
    saveGame();
    clear();
  } else if (turn === 9) {
    setMessage("Tie game.");
    saveGame();
    clear();
  }
}

function clear() {
  $('td').empty();
  turn = 0;
}

$(document).ready(function() {
  attachListeners();
});

function attachListeners() {
  $('td').on('click', function() {
    if (!$.text(this) && !checkWinner()) {
      doTurn(this);
    }
  });
  $('#save').on('click', () => saveGame());
  $('#previous').on('click', () => previousGames());
  $('#clear').on('click', () => buttonClear());
}
function previousGames() {
  $('#games').empty();
  $.get('/games', (savedGames) => {
    savedGames.data.forEach(newGameButton);
  })
}

function newGameButton(game) {
  $('#games').append(`<button id="gameid-${game.id}">${game.id}</button><br>`);
  $(`#gameid-${game.id}`).on('click', () => loadGame(game.id));
}


function buttonClear() {
  clear();
  currentGame = 0;
}

function saveGame() {
  var state = [];
  var gameData;

  $('td').text((index, square) => {
    state.push(square);
  });

  gameData = { state: state };

  if (currentGame) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${currentGame}`,
      data: gameData
    });
  } else {
    $.post('/games', gameData, function(game) {
      currentGame = game.data.id;
      newGameButton(currentGame);
    });
  }
}

function loadGame(gameID) {
  const xhr = new XMLHttpRequest;
  xhr.open('GET', `/games/${gameID}`);
  xhr.onload = () => {
    const data = JSON.parse(xhr.responseText).data;
    const id = data.id;
    const board = data.attributes.state;

    let index = 0;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        document.querySelector(`[data-x="${x}"][data-y="${y}"]`).innerHTML = board[index];
        index++;
      }
    }

    turn = board.join('').length;
    currentGame = id;
  };
}
