
import Player, { ComputerPlayer } from './Player';
import Ship, { makeShips, makeCustomShips } from './Ship';
import { renderBoard, renderShips, renderGameMode, renderRandomPlacement } from './dom';
import gameController, { centerScreen } from './gameController';
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

// Render game mode selection buttons
renderGameMode(gameModeElement);

// Hide confirm ship placement button
const confirmPlacementButton = document.querySelector('#confirm-placement')
confirmPlacementButton.style.display = 'none';

function getNames() {
    return {
        player1: document.querySelector('#player1-name').value.trim() || 'Player 1',
        player2: document.querySelector('#player2-name').value.trim() || 'Player 2',
        computer: document.querySelector('#computer-name').value.trim() || 'Computer'
    };
}

function getBoardSize() {
    return Number(document.querySelector('#board-size').value);
}

function getShipCounts() {
    return [
        Number(document.querySelector('#length1-amount').value),
        Number(document.querySelector('#length2-amount').value),
        Number(document.querySelector('#length3-amount').value),
        Number(document.querySelector('#length4-amount').value),
        Number(document.querySelector('#length5-amount').value),
        Number(document.querySelector('#length6-amount').value),
        Number(document.querySelector('#length7-amount').value),
        Number(document.querySelector('#length8-amount').value),
        Number(document.querySelector('#length9-amount').value),
        Number(document.querySelector('#length10-amount').value)
    ];
}

function displayNames(names, gameMode) {
    document.querySelector('#player1-heading').textContent = names.player1;

    document.querySelector('#player2-heading').textContent =
        gameMode === 'pvc' ? names.computer : names.player2;
}

// Start game based on selected game mode
function startGame(gameMode) {

    // Create ships for both players
    let ships1 = makeCustomShips(getShipCounts());
    let ships2 = makeCustomShips(getShipCounts());

    let boardSize = getBoardSize();

    // Create player instances
    let player1 = new Player('Player 1', boardSize);
    let player2;

    if (gameMode === 'pvp') {
        player2 = new Player('Player 2', boardSize);
    } else {
        player2 = new ComputerPlayer('Computer', boardSize);
    }

    const names = getNames();

    player1.name = names.player1;
    player2.name = gameMode === 'pvc' ? names.computer : names.player2;

    displayNames(names, gameMode);

    // Computer automatically places its ships
    if (gameMode === 'pvc') {
        player2.name = names.computer;
        player2.placeAllShips(ships2);
        // Render both players' gameboards
        // Player 1's ships are visible; player 2's ships are hidden
        renderBoard(player1.gameboard, player1Element, true);
        renderBoard(player2.gameboard, player2Element, false);
        centerScreen();
    }

    // Render both players' gameboards
    // Player 1's ships are visible; player 2's ships are hidden
    renderBoard(player1.gameboard, player1Element, true);
    renderBoard(player2.gameboard, player2Element, false);
    centerScreen();

    return { player1, player2, ships1, ships2, showShips: true };
}

// Initialize the game controller to handle game mode selection
gameController(startGame);
