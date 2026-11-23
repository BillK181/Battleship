import Ship from '../src/Ship';

it('Ship length', () => {
    const ship = new Ship(5)
    expect(ship.length).toBe(5)
})

it('Times hit', () => {
    const ship = new Ship(5)
    expect(ship.hits).toBe(0)
})

it('Hit', () => {
    const ship = new Ship(5)
    ship.hit()
    expect(ship.hits).toBe(1)
})

it('Not Sunk', () => {
    const ship = new Ship(5)
    expect(ship.isSunk()).toBe(false)
})

it('Sunk', () => {
    const ship = new Ship(5)
    for(let i = 0; i < 5; i++){
        ship.hit()
    }
    expect(ship.isSunk()).toBe(true)
})
