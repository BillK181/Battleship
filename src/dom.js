// Import horizontal ship images for the start, middle, and end pieces
import horizontalStart from './images/ship-horizontal-start.png';
import horizontalMiddle from './images/ship-horizontal-middle.png';
import horizontalEnd from './images/ship-horizontal-end.png';

// Import vertical ship images for the start, middle, and end pieces
import verticalStart from './images/ship-vertical-start.png';
import verticalMiddle from './images/ship-vertical-middle.png';
import verticalEnd from './images/ship-vertical-end.png';

// Import ship images based on their length
import ship2 from './images/length-2-ship.png';
import ship3 from './images/length-3-ship.png';
import ship4 from './images/length-4-ship.png';
import ship5 from './images/length-5-ship.png';
import ship6 from './images/length-6-ship.png';

// Store ship images in an object using ship length as the key
const shipImages = {
    2: ship2,
    3: ship3,
    4: ship4,
    5: ship5,
    6: ship6
};

// Create a visual ship piece inside a board square
function createShipPiece(square, image) {

    // Create a div to display the ship image
    const shipPiece = document.createElement('div');

    // Add the CSS class used to style the ship piece
    shipPiece.classList.add('shipPiece');

    // Set the ship image as the div's background image
    shipPiece.style.backgroundImage = `url(${image})`;

    // Add the ship piece to the board square
    square.appendChild(shipPiece);
}

// Store ships that have already played their sinking animation
const animatedSunkShips = new Set();


// Render the gameboard
function renderBoard(gameboard, element, showShips, lastAttack = null) {

    // Clear the existing board before creating the updated board
    element.innerHTML = '';

    // Filter attacked coordinates to find only successful hits
    const hits = gameboard.attackedCoordinates.filter((attack) => {
        return !gameboard.missedAttacks.some((miss) => {
            return miss[0] === attack[0] && miss[1] === attack[1];
        });
    });

    // Get all missed attack coordinates
    const missedAttacks = gameboard.missedAttacks;


    // Find ships that have sunk but haven't animated yet
    const newlySunkShips = new Set(
        gameboard.ships.filter((ship) => {
            return ship.isSunk() && !animatedSunkShips.has(ship);
        })
    );

    // Loop through each row of the board
    for (let i = 0; i < gameboard.size; i++) {

        // Loop through each column of the current row
        for (let j = 0; j < gameboard.size; j++) {
            const square = document.createElement('div');

            // Store the square's row and column as data attributes
            square.dataset.row = i;
            square.dataset.column = j;

            // Add the square CSS class
            square.classList.add('square');

            // Add the square to the board's HTML element
            element.appendChild(square);

            // Check if the current coordinates match a successful hit
            const isHit = hits.some((attack) => {
                return attack[0] === i && attack[1] === j;
            });

            if (isHit) {
                // Add the permanent hit appearance
                square.classList.add('hit');

                // Animate only the square that was hit most recently
                if (
                    lastAttack &&
                    lastAttack[0] === i &&
                    lastAttack[1] === j
                ) {
                    square.classList.add('hit-animation');
                }
            }

            // Check if the current coordinates match a missed attack
            const isMiss = missedAttacks.some((miss) => {
                return miss[0] === i && miss[1] === j;
            });

            if (isMiss) {
                // Add the miss CSS class
                square.classList.add('miss');
            }

            // Check if the current square contains a ship
            if (gameboard.board[i][j] !== null) {
                const ship = gameboard.board[i][j];

                // Check if the ship has sunk
                if (ship.isSunk()) {

                    // Add the permanent sunk appearance
                    square.classList.add('sunk');

                    // Animate every square belonging to a newly sunk ship
                    if (newlySunkShips.has(ship)) {
                        square.classList.add('sunk-animation');
                    }
                }

                // Only display ship images if showShips is true
                if (showShips === true) {

                    // Check whether the same ship occupies neighboring squares
                    const left = j > 0 && gameboard.board[i][j - 1] === ship;
                    const right = j < gameboard.size - 1 && gameboard.board[i][j + 1] === ship;
                    const above = i > 0 && gameboard.board[i - 1][j] === ship;
                    const below = i < gameboard.size - 1 && gameboard.board[i + 1][j] === ship;

                    // Horizontal ship pieces

                    // Display the middle piece if the same ship is on both sides
                    if (left && right) {
                        createShipPiece(square, horizontalMiddle);
                    }

                    // Display the starting piece if the same ship is to the right
                    if (!left && right) {
                        createShipPiece(square, horizontalStart);
                    }

                    // Display the ending piece if the same ship is to the left
                    if (left && !right) {
                        createShipPiece(square, horizontalEnd);
                    }

                    // Vertical ship pieces

                    // Display the middle piece if the same ship is above and below
                    if (above && below) {
                        createShipPiece(square, verticalMiddle);
                    }

                    // Display the starting piece if the same ship is below
                    if (!above && below) {
                        createShipPiece(square, verticalStart);
                    }

                    // Display the ending piece if the same ship is above
                    if (above && !below) {
                        createShipPiece(square, verticalEnd);
                    }
                }
            }
        }
    }

    // Add newly sunk ships to the Set so their animations don't replay
    newlySunkShips.forEach((ship) => {
        animatedSunkShips.add(ship);
    });
}


// Render the available ships for the player to select
function renderShips(ships, element) {

    // Clear the existing ship selection area
    element.innerHTML = '';

    // Loop through each available ship and its index
    ships.forEach((ship, index) => {
        const shipElement = document.createElement('div');
        const shipImage = document.createElement('img');

        // Store the ship's index as a data attribute
        shipElement.dataset.index = index;

        // Add the ship CSS class
        shipElement.classList.add('ships');

        // Assign the correct image based on the ship's length
        shipImage.src = shipImages[ship.length];
        shipImage.alt = `Ship (${ship.length})`;

        // Create a container for the direction buttons
        const directionOptions = document.createElement('div');
        directionOptions.classList.add('direction-options');

        // Create the horizontal direction button
        const horizontal = document.createElement('button');
        horizontal.textContent = 'Horizontal';
        horizontal.dataset.direction = 'horizontal';

        // Create the vertical direction button
        const vertical = document.createElement('button');
        vertical.textContent = 'Vertical';
        vertical.dataset.direction = 'vertical';

        // Add both direction buttons to their container
        directionOptions.append(horizontal, vertical);

        // Add the image and direction buttons to the ship element
        shipElement.append(shipImage, directionOptions);

        // Add the completed ship element to the selection area
        element.appendChild(shipElement);
    });
}


// Render the winner message
function renderWinner(element, winner) {

    // Create a container for the winner message
    const winnerContainer = document.createElement('div');
    winnerContainer.classList.add('winner');

    // Add the container to the winner HTML element
    element.appendChild(winnerContainer);

    // Create the winner heading
    const winnerText = document.createElement('h2');
    winnerText.classList.add('winner-text');

    // Set the heading text to identify the winner
    winnerText.textContent = `${winner.name} Wins!`;

    // Add the heading to the winner container
    winnerContainer.appendChild(winnerText);
}


// Render game mode selection buttons
function renderGameMode(element) {
    // Clear any existing content inside the element
    element.innerHTML = '';

    // Create the game mode selection heading
    const title = document.createElement('h2');
    title.textContent = 'Select Game Mode';

    // Create the Player vs Player button
    const pvpButton = document.createElement('button');
    pvpButton.textContent = 'Player vs Player';
    pvpButton.id = 'pvp';

    // Create the Player vs Computer button
    const pvcButton = document.createElement('button');
    pvcButton.textContent = 'Player vs Computer';
    pvcButton.id = 'pvc';

    // Add the heading and both buttons to the selected HTML element
    element.append(title, pvpButton, pvcButton);
}


// Render random ship placement button
function renderRandomPlacement(element){

    // Create the random placement button
    const randomPlacementButton = document.createElement('button');
    randomPlacementButton.textContent = 'Random Placement';
    randomPlacementButton.id = 'random-placement'

    // Add button to element
    element.append(randomPlacementButton)
}

export { renderBoard, renderShips, renderWinner, renderGameMode, renderRandomPlacement };
