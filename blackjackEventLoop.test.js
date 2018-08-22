const BlackjackGame = require('./blackjackEventLoop.js');
const Player = require('./player.js');
const Deck = require('./deck.js');
const CardWithTwoSides = require('./card.js');
const server = require('http').createServer(require('express'));
const io = require('socket.io')(server);
const gettingBetsState = require('./gettingBetsState.js');
const checkDealerForNaturals = require('./checkDealerForNaturals.js');

// Functional testing of game (rather than unit testing)

test('correct number of players join game', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  expect(game.players.length).toBe(2);

});

test('players with the same name cannot join the same game', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 100);
  game.joinGame('player1', 101);
  expect(game.players.length).toBe(1);

});

test('correct number of players place bets', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.getBettingPlayers().length).toBe(0);

  game.placeBet('player1', 100);

  expect(game.getBettingPlayers().length).toBe(1);
});

// lower boundary conditions for betting
test('players cannot bet 0 or less chips', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.getBettingPlayers().length).toBe(0);

  game.placeBet('player1', 0);
  game.placeBet('player2', -100);

  expect(game.getBettingPlayers().length).toBe(0);
});

// upper boundary conditions for betting
test('players cannot bet more than the chips they have', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.getBettingPlayers().length).toBe(0);

  game.placeBet('player1', 101);
  game.placeBet('player2', 100);

  expect(game.getBettingPlayers().length).toBe(1);
});

test('players can only place one bet', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);
  game.placeBet('player1', 20);

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;

  expect(playerBet.betAmount).toBe(10);
  expect(playerBet.player.chips).toBe(90);
});

test('dealer gets blackjack, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(1), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(13), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(5), suit: "Spades"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(3), suit: "Spades"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard1);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard2);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test('dealer and player get blackjack, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(1), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(13), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(1), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(13), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard1);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard2);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(100);
  expect(game.dealer.chips).toBe(10000);

});

test('dealer no blackjack, player has blackjack, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(7), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(1), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(13), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard1);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard2);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});

test('dealer no blackjack, player no blackjack, dealer wins, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(6), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard1);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard2);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);
  
  game.play('player1', 'stand');



  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test('dealer no blackjack, player no blackjack, player wins, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(9), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard1);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard2);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);
  
  game.play('player1', 'stand');



  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});

test('dealer no blackjack, player no blackjack, player hits, player wins, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  const playerCard3 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(2), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(playerCard3);
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard2);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard1);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);
  
  game.play('player1', 'hit');
  game.play('player1', 'stand');

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});

test('dealer no blackjack, player no blackjack, player hits, player gets 21, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  const playerCard3 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(4), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(playerCard3);
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard2);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard1);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);
  
  game.play('player1', 'hit');

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});

test('dealer no blackjack, player no blackjack, player hits, player bursts, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  const playerCard3 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(5), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(playerCard3);
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard2);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard1);
  game.deck = deck;

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturals);
  
  game.play('player1', 'hit');

  const playerBet = game.getBettingPlayers().find(player => player.name === 'player1').bet;
  expect(playerBet.player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});
