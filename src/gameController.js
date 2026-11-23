import { renderBoard, renderShips, renderWinner, renderRandomPlacement, renderGameMode, renderAttackMode } from "./dom"
import { makeShips } from "./Ship"
import { ComputerPlayer } from './Player';

function gameController(startGame) {

    // Game variables (assigned after game mode selection)
    let player1;
    let player2;
    let ships1;
    let ships2;
    let showShips;

    // Current player
    let currentPlayer;

    let currentPlayerElement;

    let ships;

    let otherPlayer;

    let otherPlayerElement;

    let gameMode;

    let attackMode;

    let switchingPlayers = false;

    let gameStarted = false;

    let turnNumber = 1;
    let timesAttacked = 0;

    // Initialize the selected game mode
    function initializeGame(selectedGameMode) {
        const game = startGame(selectedGameMode);

        player1 = game.player1;
        player2 = game.player2;
        ships1 = game.ships1;
        ships2 = game.ships2;
        showShips = game.showShips;
        player1.name = 'Player 1';
        player2.name = selectedGameMode === 'pvc' ? 'Computer' : 'Player 2';

        currentPlayer = player1;
        otherPlayer = player2;
        currentPlayerElement = board1;
        otherPlayerElement = board2;
        ships = ships1;
        gameMode = selectedGameMode;
        player1.showShips = true;
        player2.showShips = false;

        gameModeElement.style.display = 'none';
    }

    // Selected ship object
    let selectedShip;

    // Selected Ship's HTML element
    let selectedShipElement;

    // Ship selection
    function shipClick(event){
        // Ignore clicks on direction buttons
        if (event.target.closest('[data-direction]')) return;

        // Find and assign ship that was clicked
        const shipElement = event.target.closest('.ships');

        // Check that the ship was clicked
        if (!shipElement) return;

        // Remove selected class from previously selected ship
        if (selectedShipElement) {
            selectedShipElement.classList.remove('selected');
        }

        // Get ship's index from data attribute
        const index = parseInt(shipElement.dataset.index);

        // Check if there is a ship at the index in the array
        if (ships[index] === undefined) return;

        // Assign selected ship to selectedShip
        selectedShip = ships[index]

        // Store the selected ship's HTML element
        selectedShipElement = shipElement;

        // Add selected class to clicked ship
        shipElement.classList.add('selected');
    }

    function pickUpShipFromBoard(event) {

        if (gameStarted) {
            return;
        }

        if (selectedShip !== undefined) return;

        const square = event.target.closest('.square');
        if(!square) return;

        // Get row and column of square being hovered over
        const row = parseInt(square.dataset.row);
        const column = parseInt(square.dataset.column);

        selectedShip = currentPlayer.gameboard.board[row][column];

        if(selectedShip !== null) {
            currentPlayer.gameboard.pickUpShip(selectedShip, [row, column])
        } else {
            return
        }

        ships.push(selectedShip)
        
        selectedShip = undefined

        renderShips(ships, shipsContainer)
        renderBoard(currentPlayer.gameboard, currentPlayerElement, currentPlayer.showShips )
    }


    // Show where ship is about to be placed
    function previewShip(event) {

        if (!currentPlayerElement) return;

        // Remove previous preview
        currentPlayerElement.querySelectorAll('.ship-preview').forEach(square => {
            square.classList.remove('ship-preview');
        });

        // Check if a ship and direction are selected
        if (!selectedShip || !direction) return;

        // Find the closest square to the pointer
        const square = event.target.closest('.square');

        // Return if no square found
        if (!square) return;

        // Get row and column of square being hovered over
        const row = parseInt(square.dataset.row);
        const column = parseInt(square.dataset.column);

        // Loop through each section of the selected ship
        for (let i = 0; i < selectedShip.length; i++) {

            // Start at the hovered square of each ship
            let previewRow = row;
            let previewColumn = column;

            // Adjust the row or column based on the selected direction
            if (direction === 'horizontal') {
                previewColumn += i;
            } else {
                previewRow += i;
            }

            // Find the board square matching the calculated coordinates
            const previewSquare = currentPlayerElement.querySelector(
                `[data-row="${previewRow}"][data-column="${previewColumn}"]`
            );

            // Add the preview class if the square exists on the board
            if (previewSquare) {
                previewSquare.classList.add('ship-preview');
            }
        }
    }


    // Selected direction for ship
    let direction;

    // Ship direction selection
    function directionClick(event) {

        // Find the closest direction button
        const directionButton = event.target.closest('[data-direction]');

        // Return if no direction button
        if (!directionButton) return;

        // Remove previous direction selection
        const buttons = shipsContainer.querySelectorAll('[data-direction]');
        buttons.forEach(button => button.classList.remove('selected'));

        // Set new direction
        direction = directionButton.dataset.direction;
        directionButton.classList.add('selected')
    }


    // Reset game to begining state
    function resetGame(){

        // Resets the board for each player
        player1.gameboard.cleanBoard()
        player2.gameboard.cleanBoard()

        // Make new ships
        ships1 = makeShips()
        ships2 = makeShips()

        if (gameMode === 'pvc') {
            player2.placeAllShips(ships2);
        }

        // Reset ship and direction selection
        selectedShip = undefined
        direction = undefined

        // Reset the text inside the winner popup
        winnerElement.innerHTML = ''

        // Show game mode selection and random placement button again
        gameModeElement.style.display = 'flex';
        randomPlacementButton.style.display = 'block';
    }


    // Human player ship placement
    function humanPlaceShip(event){

        if (!currentPlayer) return;

        // Check if fewer than 5 ships have been placed
        if(currentPlayer.gameboard.ships.length < 5){

            // Check if clicked element has a row and column
            if(event.target.dataset.row === undefined || event.target.dataset.column === undefined){
                return
            }

            // Check if ship has been selected
            if(selectedShip !== undefined){

                // Check if direction has been selected
                if(direction !== undefined){
                    
                    // Attempt to place the selected ship at the clicked coordinates
                    if(currentPlayer.gameboard.placeShip(selectedShip, [parseInt(event.target.dataset.row), parseInt(event.target.dataset.column)], direction)){

                        event.stopImmediatePropagation();
                        
                        // Find the ship's index in the ship's array
                        const index = ships.indexOf(selectedShip);

                        // Remove the placed ship from the available ships array
                        ships.splice(index, 1);

                        // Reset selected ship and direction
                        selectedShip = undefined;
                        direction = undefined;

                        // Update the ships selection area and gameboard
                        renderShips(ships, shipsContainer)
                        renderBoard(currentPlayer.gameboard, currentPlayerElement, currentPlayer.showShips)

                        if (currentPlayer.gameboard.ships.length === 5) {

                            if (gameMode === 'pvp') {

                                // Hide random placement once both players have placed their ships
                                if (otherPlayer.gameboard.ships.length === 5) {
                                    randomPlacementButton.style.display = 'none';
                                    gameStarted = true;
                                }

                                switchingPlayers = true;

                                const playerPlacing = currentPlayer;

                                setTimeout(() => {

                                    if (playerPlacing.gameboard.ships.length === 5) {
                                        switchPlayers();
                                        showTurnPopup();
                                        renderShips(ships, shipsContainer);
                                    }

                                    switchingPlayers = false;

                                }, 800);

                            } else {
                                randomPlacementButton.style.display = 'none';
                            }
                        }
                    }
                }
            }
        }
    }


    // Human player attack
    function humanAttackClick(event) {
        if (switchingPlayers) return;

        // Stop if the game hasn't started
        if (!currentPlayer) return;

        // Prevent attacking your own board
        if (gameMode === 'pvc' && event.currentTarget === board1) return;
        if (gameMode === 'pvp' && event.currentTarget === currentPlayerElement) return;

        // Check if both players have all 5 ships placed
        if (currentPlayer.gameboard.ships.length !== 5 || otherPlayer.gameboard.ships.length !== 5) {
            return
        }

        // Find the clicked board square
        const square = event.target.closest('.square');
        if (!square) return;

        // Get coordinates
        const row = parseInt(square.dataset.row);
        const column = parseInt(square.dataset.column);

        const targetPlayer = gameMode === 'pvc' ? player2 : otherPlayer;

        const alreadyAttacked = targetPlayer.gameboard.attackedCoordinates.some((attack) => {
            return attack[0] === row && attack[1] === column;
        });

        // Stop if selected coordinates have already been attacked
        if (alreadyAttacked) {
            return;
        }

        // Human player attacks computer
        if (gameMode === 'pvc') {
            player1.attack(player2, [row, column]);
            renderBoard(player2.gameboard, board2, player2.showShips, [row, column]);
            renderBoard(player1.gameboard, board1, player1.showShips);
        } else {
            // Current player attacks opponent
            currentPlayer.attack(otherPlayer, [row, column]);

            // Render opponent's board
            renderBoard(otherPlayer.gameboard, otherPlayerElement, otherPlayer.showShips, [row, column]);
        }

        // Check winner
        if (targetPlayer.gameboard.allShipsSunk()) {
            const winner = currentPlayer;

            setTimeout(() => {
                renderBoard(player1.gameboard, board1, true)
                renderBoard(player2.gameboard, board2, true)
                renderWinner(winnerElement, winner);
                gameModeElement.style.display = 'flex';
                winnerElement.style.display = 'flex';
            }, 1000);

            return;
        }

        // Computer opponent's turn
        if (gameMode === 'pvc') {

            // Computer player attacks
            player2.computerAttack(player1);

            // Redraw player 1's board with the computer's attack
            renderBoard(player1.gameboard, board1, player1.showShips);

            // Reset game if player 2 wins
            if (player1.gameboard.allShipsSunk()) {
                const winner = player2

                setTimeout(() => {
                    renderBoard(player1.gameboard, board1, true)
                    renderBoard(player2.gameboard, board2, true)
                    renderWinner(winnerElement, winner);
                    gameModeElement.style.display = 'flex';
                    winnerElement.style.display = 'flex';
                }, 1000);
                return;
            }
        }
        // Switch turns for human vs human
        if (gameMode === 'pvp') {
            if (attackMode === 'classic'){
                switchingPlayers = true;
                setTimeout(() => {
                    switchPlayers();
                    showTurnPopup();
                    switchingPlayers = false;
                }, 700);
            }
            else if(attackMode === 'escalating attacks'){
                if(timesAttacked + 1 >= turnNumber){
                    switchingPlayers = true;
                    turnNumber += 1;
                    timesAttacked = 0;
                    setTimeout(() => {
                        switchPlayers();
                        showTurnPopup();
                        switchingPlayers = false;
                    }, 700);
                } else {
                    timesAttacked += 1;
                }
            }
        }
    }
    

    // Handle Player vs Player selection
    function pvpClick() {
        winnerElement.style.display = 'none';
        if(player1 !== undefined && player1.gameboard !== undefined){
            resetGame();
        }
        initializeGame('pvp');
        renderAttackMode(attackModeElement);

        document.querySelector('#escalating-attacks').addEventListener('click', escalatingAttacksClick);
        document.querySelector('#classic').addEventListener('click', classicClick);
    }

    // Handle Player vs Computer selection
    function pvcClick() {
        winnerElement.style.display = 'none';
        if(player1 !== undefined && player1.gameboard !== undefined){
            resetGame();
        }
        initializeGame('pvc');
        // Render ships and boards
        renderShips(ships1, shipsContainer)
        renderBoard(player1.gameboard, board1, showShips)
        renderBoard(player2.gameboard, board2, false)
    }

    function escalatingAttacksClick(){
        attackMode = 'escalating attacks'
        // Render ships and boards
        renderShips(ships1, shipsContainer)
        renderBoard(player1.gameboard, board1, showShips)
        renderBoard(player2.gameboard, board2, false)
        attackModeElement.style.display = 'none';
    }

    function classicClick(){
        attackMode = 'classic'
        // Render ships and boards
        renderShips(ships1, shipsContainer)
        renderBoard(player1.gameboard, board1, showShips)
        renderBoard(player2.gameboard, board2, false)
        attackModeElement.style.display = 'none';
    }

    // Switch current player
    function switchPlayers() {
        if (currentPlayer === player1) {
            currentPlayer = player2;
            otherPlayer = player1;
            currentPlayerElement = board2;
            otherPlayerElement = board1;
            ships = ships2;

        } else {
            currentPlayer = player1;
            otherPlayer = player2;
            currentPlayerElement = board1;
            otherPlayerElement = board2;
            ships = ships1;
        }

        // Update ship visibility for the new turn
        player1.showShips = currentPlayer === player1;
        player2.showShips = currentPlayer === player2;

        // Redraw BOTH boards using their respective visibility settings
        renderBoard(player1.gameboard, board1, player1.showShips);
        renderBoard(player2.gameboard, board2, player2.showShips);
    }

    // Randomly place ships
    function randomShipPlacement() {
        if (switchingPlayers || currentPlayer.gameboard.ships.length === 5) {
            return;
        }

        currentPlayer.randomPlacement(ships);
        renderShips(ships, shipsContainer);
        renderBoard(currentPlayer.gameboard, currentPlayerElement, currentPlayer.showShips);

        // Switch players once all five ships are placed
        if (currentPlayer.gameboard.ships.length === 5) {

            if (gameMode === 'pvp') {

                // Hide random placement once both players have placed ships
                if (otherPlayer.gameboard.ships.length === 5) {
                    randomPlacementButton.style.display = 'none';
                }

                switchingPlayers = true;

                const playerPlacing = currentPlayer;

                setTimeout(() => {

                    if (playerPlacing.gameboard.ships.length === 5) {
                        switchPlayers();
                        showTurnPopup();
                        renderShips(ships, shipsContainer);
                    }

                    switchingPlayers = false;

                }, 1500);

            } else {
                randomPlacementButton.style.display = 'none';
            }
        }
    }

    function showTurnPopup() {
        turnMessage.textContent = `${currentPlayer.name}'s Turn`;
        turnPopup.style.display = 'flex';
    }

    function hideTurnPopup() {
        turnPopup.style.display = 'none';
        switchingPlayers = false;
    }

    // Player 1 board
    const board1  = document.querySelector('#player1-board');
    // Player 2 board
    const board2  = document.querySelector('#player2-board');
    // Ships container
    const shipsContainer = document.querySelector('#ships-container')
    // Winner message container
    const winnerElement = document.querySelector('#winner');

    // Get HTML element for game mode selection
    const gameModeElement = document.querySelector('#game-mode');
    const pvpButton = document.querySelector('#pvp');
    const pvcButton = document.querySelector('#pvc');

    // Get HTML element for random placement
    const randomPlacementButton = document.querySelector('#random-placement')

    const turnPopup = document.querySelector('#turn-switch-popup');
    const turnMessage = document.querySelector('#turn-message');
    const continueButton = document.querySelector('#continue-game');

    
    const attackModeElement = document.querySelector('#attack-mode');


    // Click handlers
    // Human attack
    board2.addEventListener('click', humanAttackClick);
    board1.addEventListener('click', humanAttackClick);
    // Human place ship
    board1.addEventListener('click', humanPlaceShip);
    board2.addEventListener('click', humanPlaceShip);
    // Ship selection
    shipsContainer.addEventListener('click', shipClick);
    board1.addEventListener('click', pickUpShipFromBoard);
    board2.addEventListener('click', pickUpShipFromBoard);
    // Direction selection
    shipsContainer.addEventListener('click', directionClick);
    // Preview ship placement
    board1.addEventListener('mouseover', previewShip);
    board2.addEventListener('mouseover', previewShip);
    // Listen for game mode selection
    pvpButton.addEventListener('click', pvpClick);
    pvcButton.addEventListener('click', pvcClick);
    // Random placement
    randomPlacementButton.addEventListener('click', randomShipPlacement);

    continueButton.addEventListener('click', hideTurnPopup);
}

export default gameController;