import Ship from '../src/Ship';
import Gameboard from '../src/Gameboard';

class Player {
    constructor(name) {
        this.name = name

        // Give the player their own gameboard
        this.gameboard = new Gameboard()

        // Visibility of ships
        this.showShips = true
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
    constructor(name) {

        // Run the parent Player constructor
        super(name)
    }

    // Choose a coordinate and attack the human player's gameboard
    computerAttack(player){

        // Find all previous successful hits by excluding missed attacks
        const hits = player.gameboard.attackedCoordinates.filter((attack) => {
            return !player.gameboard.missedAttacks.some((miss) => {
                return miss[0] === attack[0] && miss[1] === attack[1]
            })
        })

        // Create an array to store every coordinate on the board
        const boardSpaces = []
        for(let i = 0; i < player.gameboard.size; i++) {
            const row = []

            // Add each column coordinate to the current row
            for(let j = 0; j < player.gameboard.size; j++) {
                row.push([i, j])
            }

            // Add the completed row to the board
            boardSpaces.push(row)
        }

        // Convert the 2D array of coordinates into a single array
        const flatSpaces = boardSpaces.flat()

        // Find all coordinates that have not already been attacked
        const availableSpaces = flatSpaces.filter((available) => {
            return !player.gameboard.attackedCoordinates.some((attacked) => {
                return attacked[0] === available[0] && attacked[1] === available[1]
            })
        })

        // Create an array to store coordinates adjacent to previous hits
        const choices = []

        // Check the coordinate directly below each previous hit
        for(let i = 0; i < hits.length; i++) {
            const choice = [...hits[i]]
            choice[0] = choice[0] + 1
            choices.push(choice)
        }
        
        // Check the coordinate directly to the right of each previous hit
        for(let i = 0; i < hits.length; i++) {
            const choice = [...hits[i]]
            choice[1] = choice[1] + 1
            choices.push(choice)
        }

        // Check the coordinate directly above each previous hit
        for(let i = 0; i < hits.length; i++) {
            const choice = [...hits[i]]
            choice[0] = choice[0] - 1
            choices.push(choice)
        }

        // Check the coordinate directly to the left of each previous hit
        for(let i = 0; i < hits.length; i++) {
            const choice = [...hits[i]]
            choice[1] = choice[1] - 1
            choices.push(choice)
        }

        // Remove coordinates that have already been attacked
        const realChoices = choices.filter((choice) => {
            return !player.gameboard.attackedCoordinates.some((alreadyattacked) => {
                return alreadyattacked[0] === choice[0] && alreadyattacked[1] === choice[1]
            })
        })

        // Remove coordinates that fall outside the gameboard
        const containedChoices = realChoices.filter((choice) => {
            return choice[0] >= 0 && choice[0] < player.gameboard.size && choice[1] >= 0 && choice[1] < player.gameboard.size
        })

        // If there are no valid adjacent coordinates, choose a random available space
        if(containedChoices.length === 0) {
            this.attack(player, availableSpaces[Math.floor(Math.random() * availableSpaces.length)])
        } else {

            // Otherwise, randomly choose one of the valid adjacent coordinates
            this.attack(player, containedChoices[Math.floor(Math.random() * containedChoices.length)])
        }
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