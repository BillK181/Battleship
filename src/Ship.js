import Gameboard from './Gameboard';

class Ship {
    constructor(length) {
        this.length = length
        this.hits = 0
    }

    // Increase the ship's hit count by one
    hit() {
        this.hits = this.hits + 1
    }

    // Check whether the ship has received enough hits to sink
    isSunk() {
        if(this.hits >= this.length) {
            return true
        }
        return false
    }
}

// Create and return an array of ships
function makeShips() {
    const ships = []

    // Create five ships with lengths ranging from 2 to 6
    for(let i = 1; i < 6; i++){

        // Create a new ship with a length one greater than the loop counter
        const ship = new Ship(i + 1)

        // Add the new ship to the ships array
        ships.push(ship)
    }

    // Return the completed array of ships
    return ships
}

function makeCustomShips(counts) {
    const ships = [];

    counts.forEach((amount, index) => {
        const shipLength = index + 1;
        for (let i = 0; i < amount; i++) {
            ships.push(new Ship(shipLength));
        }
    });

    return ships;
}

export default Ship;
export { makeShips, makeCustomShips };