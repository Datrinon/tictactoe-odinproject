'use strict'
/*
Goals based on the factory function section:
- Your main goal here is to have as little global code as possible.
Try tucking everything away inside of a module or factory.
Rule of thumb: if you only ever need ONE of something (gameBoard, displayController), use a module.
If you need multiples of something (players!), create them with factories.

- Store the gameboard as an array inside of a Gameboard object.
Functionalities:
- Names
- Replay button
- Dumb AI function and vs player.
*/

//Function factory for the tiles. Initializes event listeners and such.
//Note: Change this to a factory function since we need multiple (to be placed into array).
//Using 



const player = (markType, isCPU = false) => {
  let mark = _initializeMark(markType);

  function _initializeMark(markType="O") {
    let mark = document.createElement("i");
    mark.classList.add("mark")
    if(markType === "O") {
      mark.classList.add("far","fa-circle");
    } else {
      mark.classList.add("fas","fa-times");
    }
    
    return mark;
  }

  return {
    markType,
    mark,
    isCPU
  }
}

const gameboardTile = () => {

  const createTile = () => {
    let tile = document.createElement("div");
    tile.classList.add("game-tile");

    tile.addEventListener("click", _onTileClick);

    return tile;
  }

  const _onTileClick = (e) => {
    let id = e.currentTarget.getAttribute("data-index");

    if (game.gameRoundOver) {
      return;
    } 

    if (gameboard.gameboardState[id] !== "-") {
      dialogController.sendMessage(responsePresets.played);
      return;
    }

    if (!game.cpuPlaying) {
      _markTile(e);
    }
    // cpu response?
    if(game.player2.isCPU) {
      dialogController.sendMessage(responsePresets.p2move);
      game.cpuPlaying = true;
      setTimeout(() => _markTile(null, true), 10); // TODO: When finished debugging, set Timeout to 500 + random(1000)
    }
  };

  const _markTile = (event = null, cpuMove = false) => {
    let tile;
    let markGraphic;
    let markText;
    let id;

    if (!cpuMove) {
      tile = event.currentTarget;
      id = event.currentTarget.getAttribute("data-index");
    } else {
      id = game.performCPUMove();
      console.log(id);
      tile = Views.gameView.querySelector(`.game-tile[data-index="${id}"]`);
    }

    if (game.player1turn) {
      markGraphic = game.player1.mark.cloneNode();
      markText = game.player1.markType;
    } else {
      markGraphic = game.player2.mark.cloneNode();
      markText = game.player2.markType;
    }

    tile.appendChild(markGraphic);
    gameboard.gameboardState[tile.getAttribute("data-index")] = markText;
    game.player1turn = !game.player1turn;

    game.cpuPlaying = false;

    if (cpuMove){
      dialogController.sendMessage(responsePresets.p1move);
    }

    if (game.checkIfWin()) {
      game.endRound();
    }
  }

  return {
    createTile,
  }
};

// Generate a view of the gameboard. Don't use global code.
// Use a module to display the gameboard.
// and try to not use main() this time.
const gameboard = (function() {
  
  let size = 3;
  let gameboardState = [];
  let winningRows = [];
  let winningColumns = [];
  let winningDiagonals = [];

  const _determineWinStates = () => {
    let self = gameboard;

    self.winningRows = [];
    self.winningColumns = [];
    self.winningDiagonals = []; 
    
    for (let i = 0; i < size*size; i+=size) {
      let row = [];
      for (let j=i; j < i + size; j++) {
        row.push(j);
      }
      self.winningRows.push(row);
    }

    for (let i = 0; i < size; i++) {
      let column = [];
      for (let j = i; j < (size * size); j += size) {
        column.push(j);
      }
      self.winningColumns.push(column);
    }

    let diag = [];
    for (let i = 0; i < size*size; i+= size+1) {
      diag.push(i);
    }

    let crossdiag = [];
    for (let i = size-1; i <= (size * size) - size ; i += size-1) {
      crossdiag.push(i);
    }
    self.winningDiagonals.push(diag, crossdiag);
  }

  const generateGameboard = (e = null) => {
    while (Views.gameView.firstChild) {
      Views.gameView.removeChild(Views.gameView.firstChild);
    }
    if (e !== null) {
      size = +e.currentTarget.value;
    }

    gameboard.gameboardState = [];

    _determineWinStates();

    _displayGameboardView(Views.gameView);
  };

  /**
   * Generates a view of the gameboard (default size: 3x3).
   * @param {Element} container - DOM parent node to place the gameboard underneath.
   */
  const _displayGameboardView = (container) => {

    let gameboard = document.createElement("div");
    
    gameboard.id = "gameboard";
    gameboard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameboard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    for (let i = 0; i < (size * size); i++) {      
      // use differential inheritance to preserve memory rather than copying methods.
      let tile = gameboardTile().createTile();
      tile.setAttribute("data-index", i); 

      gameboard.appendChild(tile);
    }

    container.appendChild(gameboard);
  };

  return {
    generateGameboard,
    size,
    gameboardState,
    winningRows,
    winningColumns,
    winningDiagonals
  }
})();

const options = (function(){

  const _markActive = (e) => {
    document.querySelector("#options-confirm").removeAttribute("disabled");

    e.currentTarget.parentNode.querySelectorAll("button").forEach(button => {
      button.classList.remove("selection-active");
    })
    e.currentTarget.classList.add("selection-active");
  }

  /**
   * Initializes various views with handlers to respond to user interaction.
   */
  const _initializeHandlers = () => {
    document.querySelectorAll("#options-choices > button").forEach(button => {
      button.addEventListener("click", _markActive);
    });

    document.querySelector("#options-confirm").addEventListener("click", (e) => {
      document.querySelector("#menu").classList.add("disable-visibility");
      game.startGame();
    });

    document.querySelector("#grid-size-input").addEventListener("change",
        gameboard.generateGameboard);

  }

  const initialize = () => {
    _initializeHandlers();
  }

  return {initialize};
})();

const game = (function(){
  // main section
  let player1;
  let player2;
  let rounds;
  let _roundsPlayed;
  let _roundOver;
  let player1turn = true;
  let cpuPlaying = false;
  let winner;

  /**
   * Starts the game by:
   * - Creating players
   * - Setting the rounds
   */
  const startGame = (e) => {    

    let chosenMark = document.querySelector("#options-choices > .selection-active").textContent;
    let otherMark = document.querySelector("#options-choices > button:not(.selection-active)").textContent;

    game.player1 = player(chosenMark, false);
    game.player2 = player(otherMark, true);
    game.rounds = document.querySelector("#grid-size-input").value;
    
    for (let i = 0; i < (gameboard.size * gameboard.size); i++) {
      gameboard.gameboardState.push("-"); 
    }

    dialogController.sendMessage(responsePresets.p1move);
  }

  /**
   * Performs a CPU move by returning their decision as a number corresponding
   * to an available space on the grid.
   * 
   */
  const performCPUMove = () => {
    // select a random number. Use reduce to find out the available spaces.
    let availableSpaces = gameboard.gameboardState.reduce((available, elem, index) => {
      if (elem === "-") {
        available.push(index);
      }
      return available;
    }, []);
    let move = Math.round(Math.random() * availableSpaces.length-1);

    return availableSpaces[move];
  };

  /**
   * Checks if the game has been won. Call this function after a move has been 
   * played.
   */
  const checkIfWin = () => {
    let horizontalWin;
    let verticalWin;
    let diagonalWin;
    let winner;

    // extract an array of indices for both x and o.
    let markIndices = gameboard.gameboardState.reduce((indices, elem, index) => {
      if(elem === "X") {
        indices.x.push(index);
      } else if (elem === "O") {
        indices.o.push(index);
      }

      return indices;
    }, {x: [], o: []});

    console.log(JSON.stringify(markIndices));

    // TODO: logic that checks if you've won.
  // 2. check all wins based on the given move.
    // build a diagonal win state index array outside of loop
    // check first if diagonal's even possible.
    // example. 7
    for (let markType in markIndices) {
      for (let index of markIndices[markType]) {

        // 1. Is the length of the given array less than {gameboard.size} elements? 
        if (markIndices[markType].length < gameboard.size) {
          continue;
        }

        let rowCoord = parseInt(index / gameboard.size);
        let columnCoord = index % gameboard.size; 
        let rowMatches = 0;

        for (let winIndex of gameboard.winningRows[rowCoord]) {
          if (markIndices[markType].indexOf(winIndex) !== -1) {
            rowMatches++;
          }
          if (rowMatches === gameboard.size) {
            horizontalWin = true;
            winner = markType;
            break;
          } 
        }

        let columnMatches = 0;

        for (let winIndex of gameboard.winningColumns[columnCoord]) {
          if (markIndices[markType].indexOf(winIndex) !== -1) {
            columnMatches++;
          }
          if (columnMatches === gameboard.size) {
            verticalWin = true;
            winner = markType;
            break;
          } 
        }

        diagonalWin = true;
        for (let diagonalIndex of gameboard.winningDiagonals) {
          if (markIndices[markType].indexOf(diagonalIndex) !== -1) {
            diagonalWin = false;
          }
        }
        if (diagonalWin){
          winner = markType;
          break;
        }
      }
    }

    if (horizontalWin | verticalWin | diagonalWin) {
      if (winner === game.player1.markType) {
        dialogController.sendMessage(responsePresets.win);
        game.winner = game.player1;
      } else {
        dialogController.sendMessage(responsePresets.lose);
        game.winner = game.player2;
      }
    }

    return horizontalWin | verticalWin | diagonalWin;
  }

  const endRound = () => {
    game._roundOver = true;
    game._roundsPlayed++;
    // TODO: Show pop-up menu button after round has been completed.
  }

  const startNewRound = () => {
    // TODO: Start a new round, given that the round counter < round
  }

  return {
    startGame,
    player1turn,
    player1,
    player2,
    rounds,
    performCPUMove,
    checkIfWin,
    winner,
    endRound,
  }
})();


const dialogController = (() => {
  
  function sendMessage(msg){
    document.querySelector("#dialog").textContent = msg;
  }

  return {
    sendMessage,
  }
})();


const responsePresets = {
  menu: "Choose a mark and press play!",
  win: "Player 1 wins!",
  lose: "Player 2 wins!",
  p1move: "Player 1's move",
  p2move: "Player 2's move",
  played: "This square has already been marked! Pick another."
}

const Views = {
  gameView : document.querySelector("#game"),
}


gameboard.generateGameboard();
options.initialize();

