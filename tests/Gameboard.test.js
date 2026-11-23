import Ship from '../src/Ship';
import Gameboard from '../src/Gameboard';

it('Is placed horizontal', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)
    gameboard.placeShip(ship, [2, 3], 'horizontal')
    expect(gameboard.board[2][3]).toBe(ship)
    expect(gameboard.board[2][4]).toBe(ship)
})

it('Is placed vertical', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)
    gameboard.placeShip(ship, [2, 3], 'vertical')
    expect(gameboard.board[2][3]).toBe(ship)
    expect(gameboard.board[3][3]).toBe(ship)
})

it('Attack hit', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)
    gameboard.placeShip(ship, [2, 3], 'horizontal')
    gameboard.receiveAttack([2, 3])
    expect(ship.hits).toBe(1)
})

it('Multiple attack hit', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)
    gameboard.placeShip(ship, [2, 3], 'horizontal')
    gameboard.receiveAttack([2, 3])
    gameboard.receiveAttack([2, 4])
    expect(ship.hits).toBe(2)
})

it('Attack miss', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)
    gameboard.placeShip(ship, [2, 3], 'horizontal')
    gameboard.receiveAttack([1, 5])
    expect(gameboard.missedAttacks).toEqual([[1, 5]])
})

it('Muliple attack miss', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)
    gameboard.placeShip(ship, [2, 3], 'horizontal')
    gameboard.receiveAttack([1, 5])
    gameboard.receiveAttack([3, 5])
    expect(gameboard.missedAttacks).toEqual([[1, 5], [3, 5]])
})

it('All ships sunk', () => {
    const gameboard = new Gameboard()
    const ship1 = new Ship(5)
    const ship2 = new Ship(2)
    const ship3 = new Ship(3)

    gameboard.placeShip(ship1, [2, 3], 'horizontal')
    gameboard.placeShip(ship2, [7, 4], 'vertical')
    gameboard.placeShip(ship3, [1, 1], 'vertical')

    // Ship 1: [2, 3] through [2, 7]
    gameboard.receiveAttack([2, 3])
    gameboard.receiveAttack([2, 4])
    gameboard.receiveAttack([2, 5])
    gameboard.receiveAttack([2, 6])
    gameboard.receiveAttack([2, 7])

    // Ship 2: [7, 4] through [8, 4]
    gameboard.receiveAttack([7, 4])
    gameboard.receiveAttack([8, 4])

    // Ship 3: [1, 1] through [3, 1]
    gameboard.receiveAttack([1, 1])
    gameboard.receiveAttack([2, 1])
    gameboard.receiveAttack([3, 1])

    expect(gameboard.allShipsSunk()).toBe(true)
})

it('All ships not sunk', () => {
    const gameboard = new Gameboard()
    const ship1 = new Ship(5)
    const ship2 = new Ship(2)
    const ship3 = new Ship(3)

    gameboard.placeShip(ship1, [2, 3], 'horizontal')
    gameboard.placeShip(ship2, [7, 4], 'vertical')
    gameboard.placeShip(ship3, [1, 1], 'vertical')

    // Ship 1: [2, 3] through [2, 7]
    gameboard.receiveAttack([2, 3])
    gameboard.receiveAttack([2, 4])
    gameboard.receiveAttack([2, 5])
    gameboard.receiveAttack([2, 6])
    gameboard.receiveAttack([2, 7])

    // Ship 2: [7, 4] through [8, 4]
    gameboard.receiveAttack([7, 4])
    gameboard.receiveAttack([8, 4])

    // Ship 3: [1, 1] through [3, 1]
    gameboard.receiveAttack([1, 1])
    gameboard.receiveAttack([3, 1])

    expect(gameboard.allShipsSunk()).toBe(false)
})

it('Places horizontal ship at edge of board', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    gameboard.placeShip(ship, [2, 5], 'horizontal')

    expect(gameboard.board[2][5]).toBe(ship)
    expect(gameboard.board[2][9]).toBe(ship)
})

it('Places vertical ship at edge of board', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    gameboard.placeShip(ship, [5, 2], 'vertical')

    expect(gameboard.board[5][2]).toBe(ship)
    expect(gameboard.board[9][2]).toBe(ship)
})

it('Does not place horizontal ship outside board', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    gameboard.placeShip(ship, [2, 6], 'horizontal')

    expect(gameboard.board[2][6]).toBe(null)
    expect(gameboard.ships).not.toContain(ship)
})

it('Does not place vertical ship outside board', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    gameboard.placeShip(ship, [6, 2], 'vertical')

    expect(gameboard.board[6][2]).toBe(null)
    expect(gameboard.ships).not.toContain(ship)
})

it('Does not place ship overlapping another horizontally', () => {
    const gameboard = new Gameboard()
    const ship1 = new Ship(5)
    const ship2 = new Ship(3)

    gameboard.placeShip(ship1, [2, 2], 'horizontal')
    gameboard.placeShip(ship2, [2, 4], 'horizontal')

    expect(gameboard.board[2][4]).toBe(ship1)
    expect(gameboard.board[2][5]).toBe(ship1)
    expect(gameboard.ships).toContain(ship1)
    expect(gameboard.ships).not.toContain(ship2)
})


it('Does not count the same hit twice', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    gameboard.placeShip(ship, [2, 3], 'horizontal')

    gameboard.receiveAttack([2, 3])
    gameboard.receiveAttack([2, 3])

    expect(ship.hits).toBe(1)
})

it('Does not record the same miss twice', () => {
    const gameboard = new Gameboard()

    gameboard.receiveAttack([1, 5])
    gameboard.receiveAttack([1, 5])

    expect(gameboard.missedAttacks).toEqual([[1, 5]])
})

it('Does not place ship overlapping another vertically', () => {
    const gameboard = new Gameboard()
    const ship1 = new Ship(5)
    const ship2 = new Ship(3)

    gameboard.placeShip(ship1, [2, 2], 'vertical')
    gameboard.placeShip(ship2, [4, 2], 'vertical')

    expect(gameboard.board[4][2]).toBe(ship1)
    expect(gameboard.board[5][2]).toBe(ship1)
    expect(gameboard.ships).toContain(ship1)
    expect(gameboard.ships).not.toContain(ship2)
})

it('Allows ships to be placed next to each other', () => {
    const gameboard = new Gameboard()
    const ship1 = new Ship(3)
    const ship2 = new Ship(3)

    gameboard.placeShip(ship1, [2, 2], 'horizontal')
    gameboard.placeShip(ship2, [2, 5], 'horizontal')

    expect(gameboard.board[2][4]).toBe(ship1)
    expect(gameboard.board[2][5]).toBe(ship2)
    expect(gameboard.ships).toContain(ship1)
    expect(gameboard.ships).toContain(ship2)
})

it('Records all attacked coordinates', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    gameboard.placeShip(ship, [2, 3], 'horizontal')

    gameboard.receiveAttack([2, 3])
    gameboard.receiveAttack([1, 5])

    expect(gameboard.attackedCoordinates).toEqual([[2, 3], [1, 5]])
})

it('Returns false when ship is placed outside board', () => {
    const gameboard = new Gameboard()
    const ship = new Ship(5)

    expect(gameboard.placeShip(ship, [2, 6], 'horizontal')).toBe(false)
})
