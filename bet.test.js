const Bet = require('./bet.js');
const Player = require('./player.js');

test('player can place bet', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })

  expect(bet.betAmount).toBe(50);
})
