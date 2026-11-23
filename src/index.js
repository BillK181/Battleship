
import Player, { ComputerPlayer } from './Player';
import { makeShips } from './Ship';
import { renderBoard, renderShips, renderGameMode, renderRandomPlacement } from './dom';
import gameController from './gameController';
import './style.css';

// Get HTML element for game mode selection
const gameModeElement = document.querySelector('#game-mode');

// Get HTML elements for both gameboards
const player1Element = document.querySelector('#player1-board');
const player2Element = document.querySelector('#player2-board');

// Get HTML elements for ship selection and direction controls
const shipsContainer = document.querySelector('#ships-container');
const directionContainer = document.querySelector('#direction-container');

// Render random placement button
const randomPlacementContainer = document.querySelector('#random-placement-container');

renderRandomPlacement(randomPlacementContainer);

// Render game mode selection buttons
renderGameMode(gameModeElement);

// Start game based on selected game mode
function startGame(gameMode) {

    // Create ships for both players
    let ships1 = makeShips();
    let ships2 = makeShips();

    // Create player instances
    let player1 = new Player();
    let player2;

    // Create player 2 based on selected game mode
    if (gameMode === 'pvp') {
        player2 = new Player();
    } else {
        player2 = new ComputerPlayer();
    }

    // Render the available ships for player 1 to select
    renderShips(ships1, shipsContainer);

    // Computer automatically places its ships
    if (gameMode === 'pvc') {
        player2.placeAllShips(ships2);
        // Render both players' gameboards
        // Player 1's ships are visible; player 2's ships are hidden
        renderBoard(player1.gameboard, player1Element, true);
        renderBoard(player2.gameboard, player2Element, false);
    }

    // Render both players' gameboards
    // Player 1's ships are visible; player 2's ships are hidden
    renderBoard(player1.gameboard, player1Element, true);
    renderBoard(player2.gameboard, player2Element, false);

    return { player1, player2, ships1, ships2, showShips: true };
}

// Initialize the game controller to handle game mode selection
gameController(startGame);
