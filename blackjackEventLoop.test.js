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

test('players cannot exchange 0 or less chips', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 0);
  game.joinGame('player2', -100);
  expect(game.players.length).toBe(0);

});

test('players cannot bet/hit/stand when waiting for players to join state is on', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 100);
  game.placeBet('player1', 10);
  game.play('player1', 'hit'); // how to expect error thrown when error is caught? how to unit test this?

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(100);
  expect(player.hand.cards.length).toBe(0);

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

test('players cannot exchange chips or stand/hit while bets are being collected', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);
  game.joinGame('player2', 100);

  game.placeBet('player1', 100);
  game.placeBet('player2', 100);
  game.play('player1', 'hit'); // how to expect error thrown when error is caught? how to unit test this?

  expect(game.players.length).toBe(1);
  expect(game.getBettingPlayers().length).toBe(1);
  const player = game.players.find(player => player.name === 'player1');
  expect(player.hand.cards.length).toBe(0);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test(`dealer's first card is not a 10 point card, goes to the dealerNoBlackjack state`, () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(2), suit: "Spades"}, {isFaceDown: true});
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

  expect(game.state.name).toBe('dealerNoBlackjackState');

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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(100);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(90);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test('dealer no blackjack, player no blackjack, player can hit the correct number of times, player wins, player and dealer chips resolve correctly', () => {

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
  const playerCard4 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(1), suit: "Hearts"}, {isFaceDown: true});
  playerCard4.prepareCard({value: Number(2), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(playerCard4);
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
  game.play('player1', 'hit');
  game.play('player1', 'stand');

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});

test('player cannnot play nonsense moves, player loses, player and dealer chips resolve correctly', () => {

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
  const playerCard4 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(1), suit: "Hearts"}, {isFaceDown: true});
  playerCard4.prepareCard({value: Number(2), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(playerCard4);
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
  
  game.play('player1', 'nonsense_move');
  game.play('player1', 'stand');

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test('3 players, players cannot play when it is not their turn, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const player1Card1 = Object.create(CardWithTwoSides);
  const player1Card2 = Object.create(CardWithTwoSides);
  const player2Card1 = Object.create(CardWithTwoSides);
  const player2Card2 = Object.create(CardWithTwoSides);
  const player2Card3 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
  player1Card1.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  player1Card2.prepareCard({value: Number(10), suit: "Hearts"}, {isFaceDown: true});
  player2Card1.prepareCard({value: Number(1), suit: "Diamonds"}, {isFaceDown: true});
  player2Card2.prepareCard({value: Number(2), suit: "Diamonds"}, {isFaceDown: true});
  player2Card3.prepareCard({value: Number(7), suit: "Diamonds"}, {isFaceDown: true});
  
  deck.addCardToTop(player2Card3);
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(player2Card2);
  deck.addCardToTop(player1Card2);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(player2Card1);
  deck.addCardToTop(player1Card1);
  game.deck = deck;

  game.joinGame('player1', 100);
  game.joinGame('player2', 200);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);
  game.placeBet('player2', 20);

  game.changeState(checkDealerForNaturals);
  
  game.play('player2', 'stand'); // not player2's turn
  game.play('player1', 'stand');
  
  game.play('player2', 'hit'); 
  game.play('player2', 'stand'); 

  const player1 = game.players.find(player => player.name === 'player1');
  const player2 = game.players.find(player => player.name === 'player2');
  expect(player1.chips).toBe(90);
  expect(player2.chips).toBe(220);
  expect(game.dealer.chips).toBe(9990);

});

test('player and dealer draw after both hit', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const dealerCard3 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  const playerCard3 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(6), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(7), suit: "Spades"}, {isFaceDown: true});
  dealerCard3.prepareCard({value: Number(5), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(6), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(5), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard3);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(100);
  expect(game.dealer.chips).toBe(10000);

});

test(`dealer bursts after hitting, player doesn't burst`, () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const dealerCard3 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  const playerCard3 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(6), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(7), suit: "Spades"}, {isFaceDown: true});
  dealerCard3.prepareCard({value: Number(11), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(6), suit: "Hearts"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
  playerCard3.prepareCard({value: Number(5), suit: "Hearts"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard3);
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

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});
