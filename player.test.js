const Bet = require('./bet.js');
const Player = require('./player.js');

test('player can place bet', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  player1.placeBet(10);

  expect(player1.bet.betAmount).toBe(10);
});

test('player can change nickname', () => {
  const player1 = Object.create(Player);
  player1.init('player1', 100);
  expect(player1.nickname).toBe('player1');
  expect(player1.name).toBe('player1');

  player1.setNickname('john');
  expect(player1.nickname).toBe('john');
  expect(player1.name).toBe('player1');

});
