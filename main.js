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

  let cellFilled; 

  const createTile = () => {
    let tile = document.createElement("div");
    tile.classList.add("game-tile");

    tile.addEventListener("click", (e) => {
      _markTile(e);
      if(game.player2.isCPU) {
        _markTile(e, true);
    });

    return tile;
  }

  const _markTile = (e, cpuPlaying = false) => {
    let tile = e.currentTarget;
    let markGraphic;
    let markText;
    if (game.player1turn) {
      markGraphic = game.player1.mark;
      markText = game.player1.markType;
    } else {
      markGraphic = game.player2.mark;
      markText = game.player2.markType;
    }

    tile.appendChild(markGraphic);
    gameboard.gameboardState[tile.id] = markText;
    game.player1turn = !game.player1turn;
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

  const regenerateGameboard = (e) => {
    while (Views.gameView.firstChild) {
      Views.gameView.removeChild(Views.gameView.firstChild);
    }

    size = e.currentTarget.value;
    gameboardState = [];

    displayGameboardView(Views.gameView);
  };

  /**
   * Generates a view of the gameboard (default size: 3x3).
   * @param {Element} container - DOM parent node to place the gameboard underneath.
   */
  const displayGameboardView = (container) => {

    let gameboard = document.createElement("div");
    
    gameboard.id = "gameboard";
    gameboard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gameboard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    for (let i = 0; i < (size * size); i++) {      
      // use differential inheritance to preserve memory rather than copying methods.
      let tile = gameboardTile().createTile();
      tile.id = i;

      gameboardState.push("-");

      gameboard.appendChild(tile);

    }

    container.appendChild(gameboard);
  };

  return {
    displayGameboardView,
    regenerateGameboard,
    size,
    gameboardState
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
        gameboard.regenerateGameboard);

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
  let player1turn = true;

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
    game.rounds = document.querySelector("#grid-size-input").value

  }

  const performCPUMove = (e) => {
    // select a random number. Use reduce to find out the available spaces.
    // 
  };

  return {
    startGame,
    player1turn,
    player1,
    player2,
    rounds
  }
})();

const Views = {
  gameView : document.querySelector("#game"),
}


gameboard.displayGameboardView(Views.gameView);
options.initialize();

