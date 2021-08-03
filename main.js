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

// Generate a view of the gameboard. Don't use global code.
// Use a module to display the gameboard.
// and try to not use main() this time.
const gameboard = (function() {
  
  let _size = 3;

  /**
   * Generates a view of the gameboard.
   * @param {Element} container - DOM parent node to place the gameboard underneath.
   */
  const displayGameboardView = (container) => {
    let gameboard = document.createElement("div");
    
    gameboard.id = "gameboard";
    gameboard.style.gridTemplateColumns = `repeat(${_size}, 1fr)`;
    gameboard.style.gridTemplateRows = `repeat(${_size}, 1fr)`;

    let tile = document.createElement("div");
    tile.classList.add("game-tile");
    tile.textContent = "Tile";

    for (let i = 0; i < (_size * _size); i++) {      
      gameboard.appendChild(tile.cloneNode(true));
    }

    container.appendChild(gameboard);
  };

  let setSize = (size) => {
    _size = size;
  };

  let getSize = () => {
    return _size;
  };

  return {
    displayGameboardView,
    setSize,
    getSize,
  }
})();

// main section
gameboard.displayGameboardView(document.querySelector("#game"));

