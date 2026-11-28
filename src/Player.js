import Ship from '../src/Ship';
import Gameboard from '../src/Gameboard';

class Player {
    constructor(name, size) {
        this.name = name;
        this.gameboard = new Gameboard(size);
        this.showShips = true;
    }

    // Attack the opponent's gameboard at the given coordinates
    attack(player, location){
        player.gameboard.receiveAttack(location)
    }

    randomPlacement(ships){

        // Store the two possible ship directions
        const directions = ['horizontal', 'vertical']

        while (ships.length > 0) {
            const ship = ships[0];

            // Track whether the current ship was successfully placed
            let successOfShip = false;

            // Keep trying random positions and directions until placement succeeds
            while (successOfShip !== true) {
                successOfShip = this.gameboard.placeShip(
                    ship,
                    [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
                    directions[Math.floor(Math.random() * 2)]
                );
            }

            // Remove the successfully placed ship
            ships.splice(0, 1);
        }
    }
}


// Create a ComputerPlayer class that inherits from Player
class ComputerPlayer extends Player {
    constructor(name, size) {

        // Run the parent Player constructor
        super(name, size)
    }

    
    computerAttack(player) {

        const gameboard = player.gameboard;
        const size = gameboard.size;

        // ------------------------------------------
        // Previous attacks
        // ------------------------------------------

        const attacked = gameboard.attackedCoordinates;
        const missed = gameboard.missedAttacks;

        const isAttacked = ([row, column]) => {
            return attacked.some(([r, c]) => r === row && c === column);
        };

        const isMissed = ([row, column]) => {
            return missed.some(([r, c]) => r === row && c === column);
        };

        const isHit = ([row, column]) => {
            return isAttacked([row, column]) && !isMissed([row, column]);
        };

        // ------------------------------------------
        // Find remaining unsunk ships
        // ------------------------------------------

        const remainingShips = gameboard.ships.filter(ship => !ship.isSunk());

        // ------------------------------------------
        // Find all successful hits
        // ------------------------------------------

        const hits = attacked.filter(([row, column]) => {
            return isHit([row, column]);
        });

        // ------------------------------------------
        // Find hits belonging to unsunk ships
        // ------------------------------------------

        const activeHits = [];

        for (const hit of hits) {

            const [row, column] = hit;
            const ship = gameboard.board[row][column];

            if (ship && !ship.isSunk()) {
                activeHits.push(hit);
            }
        }

        // ------------------------------------------
        // Generate all possible board coordinates
        // ------------------------------------------

        const availableSpaces = [];

        for (let row = 0; row < size; row++) {
            for (let column = 0; column < size; column++) {

                if (!isAttacked([row, column])) {
                    availableSpaces.push([row, column]);
                }
            }
        }

        if (availableSpaces.length === 0) return;

        // ------------------------------------------
        // Target mode
        // ------------------------------------------

        const targetChoices = [];

        for (const [row, column] of activeHits) {

            const directions = [
                [row + 1, column],
                [row - 1, column],
                [row, column + 1],
                [row, column - 1]
            ];

            for (const choice of directions) {

                const [r, c] = choice;

                if (
                    r >= 0 &&
                    r < size &&
                    c >= 0 &&
                    c < size &&
                    !isAttacked(choice)
                ) {
                    targetChoices.push(choice);
                }
            }
        }

        // Remove duplicate coordinates
        const uniqueTargetChoices = targetChoices.filter((choice, index, array) => {
            return array.findIndex(([r, c]) => {
                return r === choice[0] && c === choice[1];
            }) === index;
        });

        // ------------------------------------------
        // Direction detection
        // ------------------------------------------

        const horizontalHits = new Set();
        const verticalHits = new Set();

        for (const [row, column] of activeHits) {

            const horizontalConnected = activeHits.some(([r, c]) => {
                return r === row && Math.abs(c - column) === 1;
            });

            const verticalConnected = activeHits.some(([r, c]) => {
                return c === column && Math.abs(r - row) === 1;
            });

            if (horizontalConnected) {
                horizontalHits.add(row);
            }

            if (verticalConnected) {
                verticalHits.add(column);
            }
        }

        // If a ship is horizontal, only target the ends of its line
        if (horizontalHits.size > 0) {

            const row = [...horizontalHits][0];

            const columns = activeHits
                .filter(([r]) => r === row)
                .map(([, c]) => c);

            const minColumn = Math.min(...columns);
            const maxColumn = Math.max(...columns);

            const choices = [
                [row, minColumn - 1],
                [row, maxColumn + 1]
            ].filter(([r, c]) => {
                return r >= 0 && r < size &&
                    c >= 0 && c < size &&
                    !isAttacked([r, c]);
            });

            if (choices.length > 0) {
                this.attack(player, choices[Math.floor(Math.random() * choices.length)]);
                return;
            }
        }

        // If a ship is vertical, only target the ends of its line
        if (verticalHits.size > 0) {

            const column = [...verticalHits][0];

            const rows = activeHits
                .filter(([, c]) => c === column)
                .map(([r]) => r);

            const minRow = Math.min(...rows);
            const maxRow = Math.max(...rows);

            const choices = [
                [minRow - 1, column],
                [maxRow + 1, column]
            ].filter(([r, c]) => {
                return r >= 0 && r < size &&
                    c >= 0 && c < size &&
                    !isAttacked([r, c]);
            });

            if (choices.length > 0) {
                this.attack(player, choices[Math.floor(Math.random() * choices.length)]);
                return;
            }
        }

        // ------------------------------------------
        // Target adjacent squares
        // ------------------------------------------

        if (uniqueTargetChoices.length > 0) {

            this.attack(
                player,
                uniqueTargetChoices[Math.floor(Math.random() * uniqueTargetChoices.length)]
            );

            return;
        }

        // ------------------------------------------
        // Hunt mode: probability calculation
        // ------------------------------------------

        const probability = new Map();

        for (const [row, column] of availableSpaces) {
            probability.set(`${row},${column}`, 0);
        }

        for (const ship of remainingShips) {

            const length = ship.length;

            // Check horizontal placements
            for (let row = 0; row < size; row++) {
                for (let column = 0; column <= size - length; column++) {

                    const placement = [];

                    for (let i = 0; i < length; i++) {
                        placement.push([row, column + i]);
                    }

                    if (placement.some(([r, c]) => isMissed([r, c]))) continue;

                    if (placement.some(([r, c]) => {
                        return isHit([r, c]) &&
                            !activeHits.some(([hr, hc]) => hr === r && hc === c);
                    })) continue;

                    for (const [r, c] of placement) {
                        const key = `${r},${c}`;

                        if (probability.has(key)) {
                            probability.set(key, probability.get(key) + 1);
                        }
                    }
                }
            }

            // Check vertical placements
            for (let row = 0; row <= size - length; row++) {
                for (let column = 0; column < size; column++) {

                    const placement = [];

                    for (let i = 0; i < length; i++) {
                        placement.push([row + i, column]);
                    }

                    if (placement.some(([r, c]) => isMissed([r, c]))) continue;

                    if (placement.some(([r, c]) => {
                        return isHit([r, c]) &&
                            !activeHits.some(([hr, hc]) => hr === r && hc === c);
                    })) continue;

                    for (const [r, c] of placement) {
                        const key = `${r},${c}`;

                        if (probability.has(key)) {
                            probability.set(key, probability.get(key) + 1);
                        }
                    }
                }
            }
        }

        // ------------------------------------------
        // Choose the highest probability coordinate
        // ------------------------------------------

        let bestChoices = [];
        let highestProbability = -1;

        for (const [coordinate, score] of probability) {

            if (score > highestProbability) {
                highestProbability = score;
                bestChoices = [coordinate];
            } else if (score === highestProbability) {
                bestChoices.push(coordinate);
            }
        }

        // Convert coordinate strings back into arrays
        const choices = bestChoices.map(coordinate => {
            return coordinate.split(',').map(Number);
        });

        // Randomly choose between equally likely coordinates
        const selectedCoordinate = choices.length > 0
            ? choices[Math.floor(Math.random() * choices.length)]
            : availableSpaces[Math.floor(Math.random() * availableSpaces.length)];

        this.attack(player, selectedCoordinate);
    }



    // Automatically place all computer ships in random valid positions
    placeAllShips(ships){

        // Store the two possible ship directions
        const directions = ['horizontal', 'vertical']

        // Loop through each ship that needs to be placed
        for(const ship of ships) {

            // Track whether the current ship was successfully placed
            let successOfShip = false

            // Keep trying random positions and directions until placement succeeds
            while(successOfShip !== true) {
                successOfShip = this.gameboard.placeShip(ship, [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)], directions[Math.floor(Math.random() * 2)])
            }
        }
    }

}
export { ComputerPlayer };
export default Player;