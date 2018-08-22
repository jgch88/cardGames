const Bet = require('./bet.js');
const Player = require('./player.js');

test('player can place bet', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  player1.placeBet(10);

  expect(player1.bet.betAmount).toBe(10);
});
