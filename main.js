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
const gameboardTile = () => {
  let createTile = () => {
    let tile = document.createElement("div");
    tile.classList.add("game-tile");

    return tile;
  }

  return {
    createTile,
  }
};


// Generate a view of the gameboard. Don't use global code.
// Use a module to display the gameboard.
// and try to not use main() this time.
const gameboard = (function() {
  
  let _size = 3;
  let _gameboardState = [];

  /**
   * Generates a view of the gameboard (default size: 3x3).
   * @param {Element} container - DOM parent node to place the gameboard underneath.
   */
  const displayGameboardView = (container) => {
    let gameboard = document.createElement("div");
    
    gameboard.id = "gameboard";
    gameboard.style.gridTemplateColumns = `repeat(${_size}, 1fr)`;
    gameboard.style.gridTemplateRows = `repeat(${_size}, 1fr)`;

    
    for (let i = 0; i < (_size * _size); i++) {      
      // use differential inheritance to preserve memory rather than copying methods.
      let tile = gameboardTile();
      _gameboardState.push(tile);
      
      gameboard.appendChild(tile.createTile());

    }

    container.appendChild(gameboard);
  };

  const setSize = (size) => {
    _size = size;
  };

  const getSize = () => {
    return _size;
  };

  const getGameboardState = () => {
    return _gameboardState;
  };

  return {
    displayGameboardView,
    setSize,
    getSize,
    getGameboardState,
  }
})();

// main section
gameboard.displayGameboardView(document.querySelector("#game"));

