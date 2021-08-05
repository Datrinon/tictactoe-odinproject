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
const player = (name, markType, isCPU) => {
  name = name ?? "new";
  mark = _initializeMark(markType);

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
    name,
    mark,
    isCPU
  }
}

const gameboardTile = () => {

  let played; 

  const createTile = () => {
    let tile = document.createElement("div");
    tile.classList.add("game-tile");

    tile.addEventListener("click", _markTile);

    return tile;
  }

  const _markTile = (e) => {
    // DEBUG
    // Just test the xMark.
    e.currentTarget.appendChild(_xMark);
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
      let tile = gameboardTile();
      gameboardState.push(tile);
      
      gameboard.appendChild(tile.createTile());

    }

    container.appendChild(gameboard);
  };

  return {
    displayGameboardView,
    size,
    gameboardState
  }
})();

const options = (function(){
  

  const _markActive = (e) => {
    e.currentTarget.parentNode.querySelectorAll("button").forEach(button => {
      button.classList.remove("selection-active");
    })
    e.currentTarget.classList.add("selection-active");
  }

  const _initializeHandlers = () => {
    document.querySelectorAll("#options-choices > button").forEach(button => {
      button.addEventListener("click", _markActive);
    })       
  }

  const initialize = () => {
    _initializeHandlers();
  }

  return {initialize};
})();

// main section
gameboard.displayGameboardView(document.querySelector("#game"));
options.initialize();

