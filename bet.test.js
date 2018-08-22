const Bet = require('./bet.js');
const Player = require('./player.js');

test('bet cannot resolve', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })

  const multiplier = 1;
  expect(() => {
    bet.resolve('unknownResolution', multiplier, dealer);
  }).toThrow(/Couldn't/);
})
