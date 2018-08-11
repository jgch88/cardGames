const Bet = require('./bet.js');
const Player = require('./player.js');

test('player cannot place bets larger than their chips', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);

  const bet = Object.create(Bet);
  
  // from jest docs
  // expecting functions to throw error need to be enclosed in a function
  // (see drink octopus flavor example)
  // using anonymous function here
  expect(() => {
    bet.init({
      betAmount: 101,
      player: player1
    })
  }).toThrowError(`Not enough chips`);
})

test('player can place bet', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })

  expect(bet.betAmount).toBe(50);
});

test('player wins, chips resolve correctly', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })
  // now player has 50 chips left;

  const multiplier = 1;
  bet.resolve('playerWins', multiplier, dealer);

  // player wins 50 chips
  // player takes back 50 chips from initial bet
  // player should have 150 chips
  // dealer is left with 950 chips
  expect(player1.chips).toBe(150);
  expect(dealer.chips).toBe(950);
  expect(bet.betAmount).toBe(0);
});

test('player wins, chips resolve correctly, with multiplier', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })
  // now player has 50 chips left;

  const multiplier = 1.5;
  bet.resolve('playerWins', multiplier, dealer);

  // player takes back 50 chips from initial bet
  // player wins 75 chips
  // player should have 175 chips
  // dealer is left with 925 chips
  expect(player1.chips).toBe(175);
  expect(dealer.chips).toBe(925);
  expect(bet.betAmount).toBe(0);
});

test('player loses, chips resolve correctly', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })
  // now player has 50 chips left;

  const multiplier = 1;
  bet.resolve('playerLoses', multiplier, dealer);

  // player wins 50 chips
  // player takes back 50 chips from initial bet
  // player should have 150 chips
  // dealer is left with 950 chips
  expect(player1.chips).toBe(50);
  expect(dealer.chips).toBe(1050);
  expect(bet.betAmount).toBe(0);
});

test('player draws, chips resolve correctly', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const dealer = Object.create(Player);
  dealer.init("Dealer", 1000);

  const bet = Object.create(Bet);
  bet.init({
    betAmount: 50,
    player: player1
  })
  // now player has 50 chips left;

  const multiplier = 1;
  bet.resolve('playerDraws', multiplier, dealer);

  // player wins 50 chips
  // player takes back 50 chips from initial bet
  // player should have 150 chips
  // dealer is left with 950 chips
  expect(player1.chips).toBe(100);
  expect(dealer.chips).toBe(1000);
  expect(bet.betAmount).toBe(0);
});
