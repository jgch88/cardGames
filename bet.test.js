const Bet = require('./bet.js');
const Player = require('./player.js');

test('bet cannot resolve', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = player1.placeBet(50);

  const multiplier = 1;
  expect(() => {
    bet.resolve('unknownResolution', multiplier, dealer);
  }).toThrow(/Couldn't/);
})

test('bet cannot resolve more than once', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = player1.placeBet(50);

  const multiplier = 1;
  bet.resolve('playerWins', multiplier, dealer);
  expect(player1.chips).toBe(150);
  expect(dealer.chips).toBe(950);
  expect(() => {
    bet.resolve('playerWins', multiplier, dealer);
  }).toThrow(/already resolved/);
})
