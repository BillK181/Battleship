import { renderBoard, renderShips, renderWinner, renderRandomPlacement, renderGameMode, renderAttackMode } from "./dom"
import { makeShips } from "./Ship"
import { ComputerPlayer } from './Player';


function centerScreen() {
    const pageContainer = document.querySelector('.page-container');

    requestAnimationFrame(() => {
        const left = (pageContainer.scrollWidth - window.innerWidth) / 2;

        window.scrollTo({
            left: Math.max(0, left),
            behavior: 'instant'
        });
    });
}

function zoomOut() {
    const pageContainer = document.querySelector('.page-container');

    // Reset zoom before measuring
    pageContainer.style.zoom = '1';

    requestAnimationFrame(() => {

        // Calculate how much the page needs to shrink
        const scaleX = window.innerWidth / pageContainer.scrollWidth;
        const scaleY = window.innerHeight / pageContainer.scrollHeight;

        const scale = Math.min(scaleX, scaleY, 1);

        // Apply zoom
        pageContainer.style.zoom = scale;

        // Center the page AFTER zoom has been applied
        requestAnimationFrame(() => {
            const left = (pageContainer.scrollWidth - window.innerWidth) / 2;

            window.scrollTo({
                left: Math.max(0, left),
                behavior: 'instant'
            });
        });
    });
}


function gameController(startGame) {

    // ------------------------------------------
    // Variables
    // ------------------------------------------

    // Players
    let player1;
    let player2;
    let currentPlayer;
    let otherPlayer;


    // Player DOM elements
    let currentPlayerElement;
    let otherPlayerElement;


    // Ships
    let ships1;
    let ships2;
    let ships;
    let showShips;
    // Selected ship
    let selectedShip;
    let selectedShipElement;
    // Selected direction for ship
    let direction;

    let totalShips1;
    let totalShips2;


    // Game settings
    let gameMode;
    let attackMode;


    // Game state
    let gameStarted = false;
    let gameOver = false;
    let switchingPlayers = false;
    let confirmPlacementCount = 0;


    // Turn tracking
    let turnNumber = 1;
    let timesAttacked = 0;


    // Timers
    const lastShipDelay = 5000;
    const turnSwitchDelay = 700;
    let countdown;
    let playerSwitchTimeout;


    // ------------------------------------------
    // DOM ELEMENT REFERENCES
    // ------------------------------------------

    // Customize Game
    const customPopup = document.querySelector('#game-start-popup');
    const startButton = document.querySelector('#start')

    // Game boards
    const board1 = document.querySelector('#player1-board');
    const board2 = document.querySelector('#player2-board');

    // Ship elements
    const shipsContainer = document.querySelector('#ships-container');
    const randomPlacementContainer = document.querySelector('#random-placement-container');
    const confirmPlacementButton = document.querySelector('#confirm-placement');

    // Game mode selection
    const gameModeElement = document.querySelector('#game-mode');
    const pvpButton = document.querySelector('#pvp');
    const pvcButton = document.querySelector('#pvc');

    // Game status
    const winnerElement = document.querySelector('#winner');

    // Turn switching
    const turnPopup = document.querySelector('#turn-switch-popup');
    const turnMessage = document.querySelector('#turn-message');
    const continueButton = document.querySelector('#continue-game');
    const placementMessage = document.querySelector('#placement-message');

    // Attacks remaining
    const attacksRemaining = document.querySelector('#attacks-remaining');
    const attackCount = document.querySelector('#count');

    // Game settings
    const countdownElement = document.querySelector('#countdown');
    const attackModeElement = document.querySelector('#attack-mode');


    // ------------------------------------------
    // Game Initialization
    // ------------------------------------------

    // Initialize the selected game mode
    function initializeGame(selectedGameMode) {

        // Clear previous game timers
        clearInterval(countdown);
        clearTimeout(playerSwitchTimeout);

        // Create players and ships
        const game = startGame(selectedGameMode);

        player1 = game.player1;
        player2 = game.player2;

        ships1 = game.ships1;
        ships2 = game.ships2;

        totalShips1 = ships1.length;
        totalShips2 = ships2.length;

        // Set initial player and board references
        currentPlayer = player1;
        otherPlayer = player2;

        currentPlayerElement = board1;
        otherPlayerElement = board2;

        ships = ships1;

        // Set game settings
        gameMode = selectedGameMode;

        player1.showShips = true;
        player2.showShips = false;

        // Hide game mode selection
        gameModeElement.style.display = 'none';

        // Reset game state
        gameStarted = false;
        gameOver = false;

        turnNumber = 1;
        timesAttacked = 0;
        confirmPlacementCount = 0;
        switchingPlayers = false;
    }

    // -----------------------------------------------------
    // Ship Movement
    // -----------------------------------------------------


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


    // Place ship on board
    function humanPlaceShip(event){

        const currentPlayerShipCount = currentPlayer === player1 ? totalShips1 : totalShips2;
        const otherPlayerShipCount = otherPlayer === player1 ? totalShips1 : totalShips2;

        // CHECKS

        // Check for current player
        if (!currentPlayer) return;

        if (currentPlayer.gameboard.ships.length >= currentPlayerShipCount) return;

        // Check if clicked element has a row and column
        if(event.target.dataset.row === undefined || event.target.dataset.column === undefined) return;

        // Check if ship has been selected
        if(selectedShip == undefined) return;

        // Check if direction has been selected
        if(direction == undefined) return;
           
        // Attempt to place the selected ship at the clicked coordinates
        if(currentPlayer.gameboard.placeShip(selectedShip, [parseInt(event.target.dataset.row), parseInt(event.target.dataset.column)], direction)){

            // Dont allow pickupship click event
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

            // LAST SHIP
            if (currentPlayer.gameboard.ships.length === currentPlayerShipCount) {

                // Pvp
                if (gameMode === 'pvp') {

                    // Prevent ships from being picked up after game has started
                    // Hide random ship placement button
                    if (otherPlayer.gameboard.ships.length === otherPlayerShipCount) {
                        randomPlacementContainer.style.display = 'none';
                        gameStarted = true;
                    }

                    // Don't allow players to select while switching
                    switchingPlayers = true;

                    // Show confirmation screen
                    showCountdown()
                    showPlacementMessage();

                    // Switch timer for next player
                    playerSwitchTimeout = setTimeout(() => {

                        // Check if all 5 ships have been placed
                        if (currentPlayer.gameboard.ships.length === currentPlayerShipCount) {
                            switchPlayers();
                            showTurnPopup();
                            renderShips(ships, shipsContainer);
                        } else {
                            // When a player picks up a ship during coundown

                            // Allow player selections
                            switchingPlayers = false;

                            // Hide confirm placement button
                            confirmPlacementButton.style.display = 'none';
                        }

                        // Show random placement button only if game isnt starting
                        if (!gameStarted) {
                            randomPlacementContainer.style.display = 'flex';
                        }
                    }, lastShipDelay);

                } else {

                    // Pvc
                    showCountdown();
                    showPlacementMessage();

                    // Hide random placement container
                    randomPlacementContainer.style.display = 'none';

                    // Prevent ships from being picked up
                    gameStarted = true;
                }
            }
        }
    }


    // Randomly place ships
    function randomShipPlacement() {

        const currentPlayerShipCount = currentPlayer === player1 ? totalShips1 : totalShips2;
        const otherPlayerShipCount = otherPlayer === player1 ? totalShips1 : totalShips2;

        // Don't allow after 5 ships are placed
        if (currentPlayer.gameboard.ships.length === currentPlayerShipCount) return;

        currentPlayer.randomPlacement(ships);
        renderShips(ships, shipsContainer);
        renderBoard(currentPlayer.gameboard, currentPlayerElement, currentPlayer.showShips);

        // Switch players once all five ships are placed
        if (currentPlayer.gameboard.ships.length === currentPlayerShipCount) {

            if (gameMode === 'pvp') {

                // Hide random placement once both players have placed ships
                if (otherPlayer.gameboard.ships.length ===  otherPlayerShipCount) {
                    randomPlacementContainer.style.display = 'none';
                }

                switchingPlayers = true;

                showCountdown();
                showPlacementMessage();

                const playerPlacing = currentPlayer;

                playerSwitchTimeout = setTimeout(() => {

                    if (playerPlacing.gameboard.ships.length === currentPlayerShipCount) {
                        switchPlayers();
                        showTurnPopup();
                        renderShips(ships, shipsContainer);
                    }

                    switchingPlayers = false;

                    if (!gameStarted) {
                        randomPlacementContainer.style.display = 'flex';
                    }

                    confirmPlacementButton.style.display = 'none';

                }, lastShipDelay);
            
            // Prevent ships from being picked up once game has started
            // Hide random ship placement button
            } else {
                randomPlacementContainer.style.display = 'none';
                showCountdown();
                showPlacementMessage();
            }
        }
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


    // Pick up ship
    function pickUpShipFromBoard(event) {

        // Return if both players have all 5 ships on the board
        if (gameStarted) return;

        if (selectedShip !== undefined) return;

        // Return if no square was selected to pick a ship up from
        const square = event.target.closest('.square');
        if(!square) return;

        // Get row and column of square being hovered over
        const row = parseInt(square.dataset.row);
        const column = parseInt(square.dataset.column);

        // Get the ship object that is at the selected square on the board
        selectedShip = currentPlayer.gameboard.board[row][column];

        if(selectedShip !== null) {

            // Pick up ship if there is a ship at the square
            currentPlayer.gameboard.pickUpShip(selectedShip, [row, column])

            // Show random placement button again
            randomPlacementContainer.style.display = 'flex';

            placementMessage.style.display = 'none';
            
        } else {
            // Return if there is no ship object
            return
        }

        // Add picked up ship to ships array
        ships.push(selectedShip)
        
        // Clear selectedShip
        selectedShip = undefined

        // Stop countdown
        stopCountdown();

        // Render ships and boards
        renderShips(ships, shipsContainer)
        renderBoard(currentPlayer.gameboard, currentPlayerElement, currentPlayer.showShips )
    }


    // -----------------------------------------------------
    // Game States
    // -----------------------------------------------------

    // Player vs player selection
    function pvpClick() {

        // Clear winner message
        winnerElement.style.display = 'none';

        // Reset game if no gameboards
        if(player1 !== undefined && player1.gameboard !== undefined){
            resetGame();
        }

        // Initialize game
        initializeGame('pvp');

        // Show attack mode section
        renderAttackMode(attackModeElement);

        // Create escalating attacks and classic buttons
        document.querySelector('#escalating-attacks').addEventListener('click', escalatingAttacksClick);
        document.querySelector('#classic').addEventListener('click', classicClick);
    }

    
    // Player vs computer selection
    function pvcClick() {

        // Clear winner message
        winnerElement.style.display = 'none';

        // Reset game if no gameboards
        if(player1 !== undefined && player1.gameboard !== undefined){
            resetGame();
        }

        // Initialize game
        initializeGame('pvc');

        // Show attack mode section
        renderAttackMode(attackModeElement);

        // Create escalating attacks and classic buttons
        document.querySelector('#escalating-attacks').addEventListener('click', escalatingAttacksClick);
        document.querySelector('#classic').addEventListener('click', classicClick);
    }


    // Escalating attacks selection
    function escalatingAttacksClick(){
        // Declare attack mode
        attackMode = 'escalating attacks'

        // Show ships
        renderShips(ships1, shipsContainer);

        // Render boards
        renderBoard(player1.gameboard, board1, showShips)
        renderBoard(player2.gameboard, board2, false)

        if (player1.gameboard.size > 17) {
            zoomOut();
        } else {
            centerScreen();
        }

        centerScreen()

        attackModeElement.style.display = 'none';

        renderRandomPlacement(randomPlacementContainer);
        randomPlacementContainer.style.display = 'flex';
        randomPlacementContainer.querySelector('#random-placement').addEventListener('click', randomShipPlacement);
    }

    // Classic attacks selection
    function classicClick(){
        // Declare attack mode
        attackMode = 'classic'

        // Show ships
        renderShips(ships1, shipsContainer);

        // Render boards
        renderBoard(player1.gameboard, board1, showShips)
        renderBoard(player2.gameboard, board2, false)

        if (player1.gameboard.size > 17) {
            zoomOut();
        } else {
            centerScreen();
        }

        centerScreen();

        attackModeElement.style.display = 'none';

        renderRandomPlacement(randomPlacementContainer);
        randomPlacementContainer.style.display = 'flex';
        randomPlacementContainer.querySelector('#random-placement').addEventListener('click', randomShipPlacement);
    }


    // -----------------------------------------------------
    // Turn Change
    // -----------------------------------------------------



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

        // Stop any existing countdown
        clearInterval(countdown);
        countdownElement.style.display = 'none';

        // Update ship visibility for the new turn
        player1.showShips = currentPlayer === player1;
        player2.showShips = currentPlayer === player2;

        // Redraw BOTH boards using their respective visibility settings
        renderBoard(player1.gameboard, board1, player1.showShips);
        renderBoard(player2.gameboard, board2, player2.showShips);
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
        selectedShip = undefined;
        selectedShipElement = undefined;
        direction = undefined;

        // Reset game state
        gameStarted = false;
        gameOver = false;
        switchingPlayers = false;
        confirmPlacementCount = 0;
        turnNumber = 1;
        timesAttacked = 0;

        // Reset timers
        clearInterval(countdown);
        clearTimeout(playerSwitchTimeout);

        // Reset the text inside the winner popup
        winnerElement.innerHTML = '';

        // Reset placement UI
        placementMessage.style.display = 'none';
        confirmPlacementButton.style.display = 'none';
        countdownElement.style.display = 'none';
        attacksRemaining.style.display = 'none';

        // Show game mode selection
        gameModeElement.style.display = 'flex';
        randomPlacementContainer.style.display = 'none';
        attackModeElement.style.display = 'flex';
    }


    // Begin countdown clock
    function startCountdown(duration) {

        // Stop any existing countdown
        clearInterval(countdown);
        
        countdownElement.style.display = 'block';


        let timeRemaining = duration;
        countdownElement.textContent = (timeRemaining / 1000).toFixed(1);
        countdown = setInterval(() => {
            timeRemaining -= 100;
            if(timeRemaining <= 0) {
                clearInterval(countdown);
                countdownElement.textContent = '';
                return
            }
            countdownElement.textContent = (timeRemaining / 1000).toFixed(1)
        }, 100)
    }


    // Show popup when changing turns
    function showTurnPopup() {
        turnMessage.textContent = `${currentPlayer.name}'s Turn`;
        turnPopup.style.display = 'flex';
        attacksRemaining.style.display = 'none';
    }


    // Hide turn popup when continue is clicked
    function hideTurnPopup() {
        turnPopup.style.display = 'none';
        switchingPlayers = false;

        if (attackMode === 'escalating attacks' && gameStarted) {
            showAttacksRemaining();
        }
    }


    // Display countdown clock
    function showCountdown() {
        countdownElement.style.display = 'block';
        randomPlacementContainer.style.display = 'none';
        startCountdown(lastShipDelay);
        confirmPlacementButton.style.display = 'flex';
        confirmPlacementButton.textContent = 'Confirm Placement'
    }

    function showPlacementMessage(){
        placementMessage.style.display = 'block';
        placementMessage.textContent = 'Click on a ship to place it again'
    }


    // Stop countdown
    function stopCountdown(){
        confirmPlacementButton.style.display = 'none';

        if (!gameStarted) {
            randomPlacementContainer.style.display = 'flex';
        }

        clearInterval(countdown);
        clearTimeout(playerSwitchTimeout);
        countdownElement.style.display = 'none';
        switchingPlayers = false;
    }


    // Confirm ship placement
    function confirmShipPlacement() {
        confirmPlacementCount += 1;
        stopCountdown();
        placementMessage.style.display = 'none';

        if(gameMode === 'pvp'){
            switchPlayers();
            showTurnPopup();
            renderShips(ships, shipsContainer);

            if(confirmPlacementCount >= 2){
                gameStarted = true;
                randomPlacementContainer.style.display = 'none';
            }

        } else if(gameMode === 'pvc'){
            gameStarted = true;
            randomPlacementContainer.style.display = 'none';
            if (attackMode === 'escalating attacks') {
                showAttacksRemaining();
            }
        }

        if (attackMode === 'escalating attacks' && gameStarted) {
            showAttacksRemaining();
        }
    }


    // -----------------------------------------------------
    // Attacking
    // -----------------------------------------------------


    function attackChecks(event) {
        const currentPlayerShipCount = currentPlayer === player1 ? totalShips1 : totalShips2;
        const otherPlayerShipCount = otherPlayer === player1 ? totalShips1 : totalShips2;

        if (gameOver) return false;
        if (switchingPlayers) return false;

        // Stop if the game hasn't started
        if (!currentPlayer) return false;

        // Prevent attacking your own board
        if (gameMode === 'pvc' && event.currentTarget === board1) return false;
        if (gameMode === 'pvp' && event.currentTarget === currentPlayerElement) return false;

        // Check if both players have all 5 ships placed
        if (currentPlayer.gameboard.ships.length !== currentPlayerShipCount || otherPlayer.gameboard.ships.length !== otherPlayerShipCount) {
            return false;
        }

        return true;
    }


    function endGame(winner) {
        gameOver = true;

        setTimeout(() => {
            renderBoard(player1.gameboard, board1, true);
            renderBoard(player2.gameboard, board2, true);
            renderWinner(winnerElement, winner);
            gameModeElement.style.display = 'flex';
            winnerElement.style.display = 'flex';
            randomPlacementContainer.style.display = 'none';
            attacksRemaining.style.display = 'none';
        }, turnSwitchDelay);
    }


    function clickedSquare(event) {
        // Find the clicked board square
        const square = event.target.closest('.square');
        if (!square) return;

        // Get coordinates
        const row = parseInt(square.dataset.row);
        const column = parseInt(square.dataset.column);

        return [row, column];
    }

    
    function alreadyAttacked(targetPlayer, coordinates){
        // Find already attacked squares
        return targetPlayer.gameboard.attackedCoordinates.some((attack) => {
            return attack[0] === coordinates[0] && attack[1] === coordinates[1];
        });
    }

    function computerTurnClassic() {
        if (gameMode === 'pvp') return;

        player2.computerAttack(player1);

        renderBoard(player1.gameboard, board1, player1.showShips);

        if (player1.gameboard.allShipsSunk()) {
            endGame(player2);
            return;
        }
    }

    function computerTurnEscalting(){
        attacksRemaining.style.display = 'flex';

        for(let i = 0; i < turnNumber; i++){
            player2.computerAttack(player1);

            attackCount.textContent = turnNumber - (i + 1);

            if (player1.gameboard.allShipsSunk()) {
                attacksRemaining.style.display = 'none';
                endGame(player2);
                return;
            }
        }
        turnNumber += 1;
        timesAttacked = 0;
        renderBoard(player1.gameboard, board1, player1.showShips);
        showAttacksRemaining();
    }




    function switchTurnsCheck(){
        // Switch turns for human vs human
        if (gameMode === 'pvp') {
            if (attackMode === 'classic'){
                switchingPlayers = true;
                setTimeout(() => {
                    switchPlayers();
                    showTurnPopup();
                    switchingPlayers = false;
                }, turnSwitchDelay);
            }
            else if(attackMode === 'escalating attacks'){
                if(timesAttacked + 1 >= turnNumber){
                    switchingPlayers = true;

                    // Show 0 for the final attack
                    attackCount.textContent = 0;

                    setTimeout(() => {
                        turnNumber += 1;
                        timesAttacked = 0;
                        switchPlayers();
                        showTurnPopup();
                        switchingPlayers = false;
                    }, turnSwitchDelay);
                } else {
                    timesAttacked += 1;
                    showAttacksRemaining();
                }
            }
        }
    }


    // Attack sequence
    function humanAttackClick(event) {
        if (!attackChecks(event)) return;

        const coordinates = clickedSquare(event);
        if(!coordinates) return;

        const [row, column] = coordinates;

        const targetPlayer = gameMode === 'pvc' ? player2 : otherPlayer;

        if(alreadyAttacked(targetPlayer, coordinates)) return;

        // Human player attacks computer
        if (gameMode === 'pvc') {
            player1.attack(player2, [row, column]);
            renderBoard(player2.gameboard, board2, player2.showShips, [row, column]);
            renderBoard(player1.gameboard, board1, player1.showShips);
        } else {
            // pvp
            currentPlayer.attack(otherPlayer, [row, column]);

            // Render opponent's board
            renderBoard(otherPlayer.gameboard, otherPlayerElement, otherPlayer.showShips, [row, column]);
        }

        // Check winner
        if (targetPlayer.gameboard.allShipsSunk()) {
            endGame(currentPlayer);
            return;
        }

        // Computer opponent's turn
        if (gameMode === 'pvc') {

            if (attackMode === 'classic') {
                computerTurnClassic();

            } else if (attackMode === 'escalating attacks') {
                timesAttacked += 1;

                if (timesAttacked >= turnNumber) {
                    attacksRemaining.style.display = 'none';
                    timesAttacked = 0;
                    turnNumber += 1;
                    computerTurnEscalting();
                } else {
                    showAttacksRemaining();
                }
            }

        } else {
            switchTurnsCheck();
        }
    }

    function showAttacksRemaining() {
        attacksRemaining.style.display = 'flex';
        attackCount.textContent = turnNumber - timesAttacked;
    }


    // ------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------

    startButton.addEventListener('click', () => {
        customPopup.style.display = 'none';
    });

    // Board interactions
    board1.addEventListener('click', humanAttackClick);
    board2.addEventListener('click', humanAttackClick);

    board1.addEventListener('click', humanPlaceShip);
    board2.addEventListener('click', humanPlaceShip);

    board1.addEventListener('click', pickUpShipFromBoard);
    board2.addEventListener('click', pickUpShipFromBoard);

    board1.addEventListener('mouseover', previewShip);
    board2.addEventListener('mouseover', previewShip);

    // Ship selection and direction
    shipsContainer.addEventListener('click', shipClick);
    shipsContainer.addEventListener('click', directionClick);

    // Game mode selection
    pvpButton.addEventListener('click', pvpClick);
    pvcButton.addEventListener('click', pvcClick);

    // Game controls
    continueButton.addEventListener('click', hideTurnPopup);
    confirmPlacementButton.addEventListener('click', confirmShipPlacement);
    
}

export default gameController;
export { centerScreen };