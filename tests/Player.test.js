import Ship from '../src/Ship';
import Gameboard from '../src/Gameboard';
import Player, { ComputerPlayer } from '../src/Player';

it('Each player has gameboard', () => {
    const player1 = new Player()
    const player2 = new Player()
    expect(player1.gameboard).toBeInstanceOf(Gameboard)
    expect(player2.gameboard).toBeInstanceOf(Gameboard)
})

it('Each Player has unique gameboard', () => {
    const player1 = new Player()
    const player2 = new Player()
    expect(player1.gameboard).not.toBe(player2.gameboard)
})

it('Player receives attack', () => {
    const player1 = new Player()
    const player2 = new Player()
    const ship = new Ship(3)
    player1.gameboard.placeShip(ship, [2, 3], 'horizontal')
    player2.attack(player1, [2, 3])
    expect(ship.hits).toEqual(1)
})

it('Player misses attack', () => {
    const player1 = new Player()
    const player2 = new Player()
    const ship = new Ship(3)
    player1.gameboard.placeShip(ship, [7, 7], 'horizontal')
    player2.attack(player1, [2, 3])
    expect(player1.gameboard.missedAttacks).toContainEqual([2, 3])
})

it('Play cant attack same spot twice', () => {
    const player1 = new Player()
    const player2 = new Player()
    const ship = new Ship(3)
    player1.gameboard.placeShip(ship, [2, 3], 'horizontal')
    player2.attack(player1, [2, 3])
    player2.attack(player1, [2, 3])
    expect(ship.hits).toEqual(1)
})

it('All computer ships placed', () => {
    const player1 = new ComputerPlayer()
    const ships = []

    ships.push(new Ship(1))
    ships.push(new Ship(2))
    ships.push(new Ship(3))
    ships.push(new Ship(4))
    ships.push(new Ship(5))

    player1.placeAllShips(ships)

    expect(player1.gameboard.ships.length).toBe(5)
})

it('correct ships places', () => {
    const player1 = new ComputerPlayer()
    const ships = []
    
    ships.push(new Ship(1))
    ships.push(new Ship(2))
    ships.push(new Ship(3))
    ships.push(new Ship(4))
    ships.push(new Ship(5))

    player1.placeAllShips(ships)

    expect(player1.gameboard.ships).toContain(ships[0])
    expect(player1.gameboard.ships).toContain(ships[1])
    expect(player1.gameboard.ships).toContain(ships[2])
    expect(player1.gameboard.ships).toContain(ships[3])
    expect(player1.gameboard.ships).toContain(ships[4])
})

it('computer attacks', () => {
    const player1 = new ComputerPlayer()
    const player2 = new Player()
    const ship = new Ship(4)

    player2.gameboard.placeShip(ship, [4, 5], 'horizontal')

    player1.computerAttack(player2)

    expect(player2.gameboard.attackedCoordinates.length).toEqual(1)
})