import Ship from '../src/Ship';

class Gameboard {
    constructor() {
        this.size = 10
        this.attackedCoordinates = []
        this.missedAttacks = []
        this.ships = []
        // Create a new board when a Gameboard instance is created
        this.board = this.createBoard()
    }


    // Create a board using this.size
    createBoard() {
        const spaces = [];

        // Loop through the board size to create each row
        for(let i = 0; i < this.size; i++) {
            const row = [];

            // Loop through the board size to create each column
            for(let j = 0; j < this.size; j++) {

                // Add an empty space (null) to the row
                row.push(null);
            }

            // Add the completed row to the board
            spaces.push(row);
        }

        // Return the completed 2D array representing the board
        return spaces;
    }


    // Reset the board
    cleanBoard(){

        // Reset the hit count for every ship on the board
        for(const ship of this.ships){
            ship.hits = 0
        }

        // Clear the attack history
        this.attackedCoordinates = []
        this.missedAttacks = []

        // Remove all ships from the board
        this.ships = []

        // Create a fresh, empty board
        this.board = this.createBoard()
    }


    // Place a ship on board
    placeShip(ship, location, direction) {

        // Check if the selected direction is horizontal
        if (direction == 'horizontal') {

            // Check if the ship fits within the board horizontally
            if(ship.length <= (this.size - location[1])) {

                /// Check if any of the spaces are already occupied
                for(let i = 0; i < ship.length; i++) {
                    if(this.board[location[0]][location[1]+i] !== null){
                        // Stop placement if a space is occupied
                        return false
                    }
                }

                // Place the ship across the selected columns
                for(let i = 0; i < ship.length; i++) {
                        this.board[location[0]][location[1]+i] = ship
                } 
            }

            // Stop if ship doesnt fit
            else {
                return false
            }

        // Otherwise, place the ship vertically
        } else {

            // Check if the ship fits within the board vertically
            if(ship.length <= (this.size - location[0])) {

                // Check if any of the spaces are already occupied
                for(let i = 0; i < ship.length; i++) {
                    if(this.board[location[0]+i][location[1]] !== null){

                        // Stop placement if a space is occupied
                        return false
                    }
                }

                // Place the ship down the selected rows
                for(let i = 0; i < ship.length; i++) {
                        this.board[location[0]+i][location[1]] = ship
                } 
            }

            // Stop if ship doesnt fit
            else {
                return false
            }
        }

        // Add the successfully placed ship to the ships array
        this.ships.push(ship)

        // Confirm that placement was successful
        return true
    }

    // Pick up ship after placement
    pickUpShip(ship, location){
       let shipLocations = []
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if(this.board[i][j] === ship){
                    shipLocations.push([i, j])
                }
            }
        }

        const isShip = shipLocations.some((shipL) => {
            return shipL[0] === location[0] && shipL[1] === location[1]
        })

        if(isShip){
            for(let local of shipLocations){
                this.board[local[0]][local[1]] = null
            }
        }

        const index = this.ships.indexOf(ship);
        this.ships.splice(index, 1);
    }


    // Receive attack
    receiveAttack(location){

        // Check if coordinates have been attacked
        const alreadyAttacked = this.attackedCoordinates.some((attack) => {
            return attack[0] === location[0] && attack[1] === location[1]
        })

        // Stop if the coordinates have already been attacked
        if(alreadyAttacked) {
                return
            }

        // Check if the attacked location contains a ship
        if(this.board[location[0]][location[1]] !== null){

            // Register a hit on the ship
            this.board[location[0]][location[1]].hit()
        }

        // Otherwise, record the attack as a miss
        else {
            this.missedAttacks.push(location)
        }

        // Record the coordinates of the attack
        this.attackedCoordinates.push(location)
    }


    // Check if all ships have been sunk for one player
    allShipsSunk(){ 

        // Get the player's ships array
        const ships = this.ships

        // Loop through every ship
        for(const ship of ships){

            // Skip to the next ship if the current ship is sunk
            if(ship.isSunk() === true) {
                continue
            }

            // Return false if any ship has not been sunk
            else {
                return false
            }
        }

        // Return true if every ship has been sunk
        return true
    }
}

export default Gameboard;
