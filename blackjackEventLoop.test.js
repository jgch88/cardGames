const BlackjackGame = require('./blackjackEventLoop.js');
const Player = require('./player.js');
const Deck = require('./deck.js');
const CardWithTwoSides = require('./card.js');
const server = require('http').createServer(require('express'));
const io = require('socket.io')(server);
const gettingBetsState = require('./gettingBetsState.js');
const checkDealerForNaturalsState = require('./checkDealerForNaturalsState.js');

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

  expect(() => {game.joinGame('player1', 101)}).toThrow(`using the name`);
  // expect(game.players.length).toBe(1);
});

test('players can change their own nicknames', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 100);
  game.joinGame('player2', 101);

  const player1 = game.players.find(player => player.name === 'player1');
  const player2 = game.players.find(player => player.name === 'player2');
  expect(player1.nickname).toBe('player1');
  expect(player2.nickname).toBe('player2');

  game.changeNickname('player1', 'john');
  game.changeNickname('player2', 'jane');

  expect(player1.nickname).toBe('john');
  expect(player2.nickname).toBe('jane');
});

test('cannot change nickname of players that are not in game', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 100);
  game.joinGame('player2', 101);

  const player1 = game.players.find(player => player.name === 'player1');
  const player2 = game.players.find(player => player.name === 'player2');
  expect(player1.nickname).toBe('player1');
  expect(player2.nickname).toBe('player2');


  game.changeNickname('player1', 'john');
  game.changeNickname('player2', 'jane');
  expect(() => {game.changeNickname('player3', 'jane')}).toThrow(`not found`);

  expect(player1.nickname).toBe('john');
  expect(player2.nickname).toBe('jane');

});

test('players cannot exchange 0 or less chips', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(() => {game.joinGame('player1', 0)}).toThrow(`exchange at least 1 chip`);
  expect(() => {game.joinGame('player2', -100)}).toThrow(`exchange at least 1 chip`);

  expect(game.players.length).toBe(0);

});

test('players cannot bet/hit/stand when waiting for players to join state is on', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.players.length).toBe(0);

  game.joinGame('player1', 100);
  expect(() => {game.placeBet('player1', 10)}).toThrow(`Waiting for other players to join`)
  expect(() => {game.play('player1', 'hit')}).toThrow(`Waiting for other players to join`);

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(100);
  const playerBet = game.bets.find(bet => bet.player.name === 'player1');
  expect(playerBet).toBe(undefined);
});

test('correct number of players place bets', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.bets.length).toBe(0);

  game.placeBet('player1', 100);

  expect(game.bets.length).toBe(1);
});

test('players cannot bet an odd number of chips', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 200);

  game.changeState(gettingBetsState);
  expect(game.bets.length).toBe(0);

  game.placeBet('player1', 10);
  expect(() => {game.placeBet('player2', 7)}).toThrow(`bet an even number`);
  expect(game.bets.length).toBe(1);

});

test('players cannot exchange chips or stand/hit while bets are being collected', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);
  expect(() => {game.joinGame('player2', 100)}).toThrow(`Betting has started`);

  game.placeBet('player1', 100);
  expect(() => {game.play('player1', 'hit')}).toThrow(`Betting is in progress`);

  expect(game.players.length).toBe(1);
  expect(game.bets.length).toBe(1);
  const playerBet = game.bets.find(bet => bet.player.name === 'player1');
  expect(playerBet.hand.cards.length).toBe(0);
});

// lower boundary conditions for betting
test('players cannot bet 0 or less chips', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.bets.length).toBe(0);

  expect(() => {game.placeBet('player1', 0)}).toThrow(`bet at least 1 chip`);
  expect(() => {game.placeBet('player2', -100)}).toThrow(`bet at least 1 chip`);

  expect(game.bets.length).toBe(0);
});

// upper boundary conditions for betting
test('players cannot bet more than the chips they have', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.bets.length).toBe(0);

  expect(() => {game.placeBet('player1', 110)}).toThrow(`Not enough chips`);
  game.placeBet('player2', 100);

  expect(game.bets.length).toBe(1);
});

test(`players cannot place bets if they didn't join/exchange chips`, () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);
  expect(() => {game.placeBet('player2', 20)}).toThrow(`join the game first`);

  expect(game.bets.length).toBe(1);

});

test('players can place more one than bet', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);
  game.placeBet('player1', 20);
  expect(game.bets.length).toBe(2);

  expect(game.bets[0].betAmount).toBe(10);
  expect(game.bets[1].betAmount).toBe(20);
  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(70);
});

test('dealer gets blackjack, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  game.deck = require('./testDeckConfigs/dealerHasBlackjackDeck.js');

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturalsState);

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test(`dealer's first card is not a 10 point card, goes to the dealerNoBlackjack state`, () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
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

  game.changeState(checkDealerForNaturalsState);

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

  game.changeState(checkDealerForNaturalsState);

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(100);
  expect(game.dealer.chips).toBe(10000);

});

test('dealer no blackjack, player has blackjack, player and dealer chips resolve correctly', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);
  game.deck = require('./testDeckConfigs/dealerNoBlackjackPlayerHasBlackjack.js');

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturalsState);

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(115); // blackjack pays 1.5x bet
  expect(game.dealer.chips).toBe(9985);

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

  game.changeState(checkDealerForNaturalsState);
  
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

  game.changeState(checkDealerForNaturalsState);
  
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

  game.changeState(checkDealerForNaturalsState);
  
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

  game.changeState(checkDealerForNaturalsState);
  
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

  game.changeState(checkDealerForNaturalsState);
  
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

  game.changeState(checkDealerForNaturalsState);
  
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

  game.changeState(checkDealerForNaturalsState);
  
  expect(() => {game.play('player1', 'nonsense_move')}).toThrow(`Invalid move`);
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

  game.changeState(checkDealerForNaturalsState);
  
  expect(() => {game.play('player2', 'stand');}).toThrow(`not player2's turn`);
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

  game.changeState(checkDealerForNaturalsState);
  
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
  game.deck = require('./testDeckConfigs/bothNoBlackjack.js');

  game.joinGame('player1', 100);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturalsState);
  
  game.play('player1', 'hit');
  game.play('player1', 'stand');

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(110);
  expect(game.dealer.chips).toBe(9990);

});

test('server emits state on connect', () => {
  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.emitCurrentState().players).toEqual({});
  expect(game.emitCurrentState().betAmounts).toEqual({});
  expect(game.emitCurrentState().chipsInHand).toEqual({});
  expect(game.emitCurrentState().dealerCards).toEqual([]);
  expect(game.emitCurrentState().gameState).toBe('gettingPlayersState');

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

  game.changeState(checkDealerForNaturalsState);
  
  game.play('player1', 'hit');
  game.play('player1', 'hit');

  expect('player1' in game.emitCurrentState().players).toBe(true);
  const player1Bet = game.bets.find((bet) => bet.player.name === 'player1');
  expect(player1Bet.hand.cards.length).toBe(4);
  expect(game.emitCurrentState().betAmounts['player1']).toBe(10);
  expect(game.emitCurrentState().chipsInHand['player1']).toBe(90);
  expect(game.emitCurrentState().gameState).toBe('dealerNoBlackjackState');
});

test('player can spectate a game', () => {

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
  game.joinGame('player2', 200);
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturalsState);
  
  game.play('player1', 'stand');

  const player = game.players.find(player => player.name === 'player1');
  expect(player.chips).toBe(90);
  expect(game.dealer.chips).toBe(10010);

});

test('server can emit player nickname', () => {
  const game = Object.create(BlackjackGame);
  game.init(io);

  expect(game.emitCurrentState().players).toEqual({});
  expect(game.emitCurrentState().betAmounts).toEqual({});
  expect(game.emitCurrentState().chipsInHand).toEqual({});
  expect(game.emitCurrentState().dealerCards).toEqual([]);
  expect(game.emitCurrentState().gameState).toBe('gettingPlayersState');

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
  expect(game.emitCurrentState().players['player1'].nickname).toBe('player1');
  game.changeNickname('player1', 'john');
  
  game.changeState(gettingBetsState);

  game.placeBet('player1', 10);

  game.changeState(checkDealerForNaturalsState);
  
  game.play('player1', 'hit');
  game.play('player1', 'hit');

  expect('player1' in game.emitCurrentState().players).toBe(true);
  const player1Bet = game.bets.find((bet) => bet.player.name === 'player1');
  expect(player1Bet.hand.cards.length).toBe(4);

  expect(game.emitCurrentState().players['player1'].nickname).toBe('john');
});

describe('feature: players splitting hands', () => {

  test.only('player can split when both cards have the same value', () => {

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
    playerCard2.prepareCard({value: Number(6), suit: "Diamonds"}, {isFaceDown: true});
    deck.addCardToTop(dealerCard2);
    deck.addCardToTop(playerCard1);
    deck.addCardToTop(dealerCard1);
    deck.addCardToTop(playerCard2);
    game.deck = deck;
    game.joinGame('player1', 100);
    game.changeState(gettingBetsState);
    game.placeBet('player1', 10);
    game.changeState(checkDealerForNaturalsState);
    game.play('player1', 'split');

    const player = game.players.find(player => player.name === 'player1');
    expect(player.chips).toBe(80);
    expect(game.bets.length).toBe(2);
    expect(game.bets[0].hand.cards.length).toBe(1);
    expect(game.bets[1].hand.cards.length).toBe(1);

  });
  test('player cannot split when both cards have different values', () => {

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
    playerCard2.prepareCard({value: Number(7), suit: "Diamonds"}, {isFaceDown: true});
    deck.addCardToTop(dealerCard2);
    deck.addCardToTop(playerCard1);
    deck.addCardToTop(dealerCard1);
    deck.addCardToTop(playerCard2);
    game.deck = deck;
    game.joinGame('player1', 100);
    game.changeState(gettingBetsState);
    game.placeBet('player1', 10);
    game.changeState(checkDealerForNaturalsState);
    expect(() => {
      game.play('player1', 'split');
    }).toThrow(`Can't split`);

    const player = game.players.find(player => player.name === 'player1');
    expect(player.chips).toBe(90);

  });

  test('player cannot split after hitting', () => {

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
    playerCard1.prepareCard({value: Number(6), suit: "Hearts"}, {isFaceDown: true});
    playerCard2.prepareCard({value: Number(6), suit: "Diamonds"}, {isFaceDown: true});
    playerCard3.prepareCard({value: Number(2), suit: "Diamonds"}, {isFaceDown: true});
    deck.addCardToTop(playerCard3);
    deck.addCardToTop(dealerCard2);
    deck.addCardToTop(playerCard2);
    deck.addCardToTop(dealerCard1);
    deck.addCardToTop(playerCard1);
    game.deck = deck;
    game.joinGame('player1', 100);
    game.changeState(gettingBetsState);
    game.placeBet('player1', 10);
    game.changeState(checkDealerForNaturalsState);
    game.play('player1', 'hit');
    expect(() => {
      game.play('player1', 'split');
    }).toThrow(`Can't split after hitting`);

    const player = game.players.find(player => player.name === 'player1');
    expect(player.chips).toBe(90);

  });
  test('player cannot split after standing', () => {

    const game = Object.create(BlackjackGame);
    game.init(io);
    // inject rigged deck such that dealer will get blackjack
    const deck = Object.create(Deck);
    deck.createStandardDeck();
    const dealerCard1 = Object.create(CardWithTwoSides);
    const dealerCard2 = Object.create(CardWithTwoSides);
    const playerCard1 = Object.create(CardWithTwoSides);
    const playerCard2 = Object.create(CardWithTwoSides);
    const player2Card1 = Object.create(CardWithTwoSides);
    const player2Card2 = Object.create(CardWithTwoSides);
    const playerCard3 = Object.create(CardWithTwoSides);
    dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
    dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
    playerCard1.prepareCard({value: Number(11), suit: "Hearts"}, {isFaceDown: true});
    playerCard2.prepareCard({value: Number(12), suit: "Diamonds"}, {isFaceDown: true});
    playerCard3.prepareCard({value: Number(2), suit: "Diamonds"}, {isFaceDown: true});
    player2Card1.prepareCard({value: Number(3), suit: "Hearts"}, {isFaceDown: true});
    player2Card2.prepareCard({value: Number(4), suit: "Diamonds"}, {isFaceDown: true});
    deck.addCardToTop(playerCard3);
    deck.addCardToTop(dealerCard2);
    deck.addCardToTop(player2Card2);
    deck.addCardToTop(playerCard2);
    deck.addCardToTop(dealerCard1);
    deck.addCardToTop(player2Card1);
    deck.addCardToTop(playerCard1);
    game.deck = deck;
    game.joinGame('player1', 100);
    game.joinGame('player2', 100);
    game.changeState(gettingBetsState);
    game.placeBet('player1', 10);
    game.placeBet('player2', 10);
    game.changeState(checkDealerForNaturalsState);
    game.play('player1', 'stand');
    expect(() => {
      game.play('player1', 'split');
    }).toThrow(); // will either throw not player's turn, or throw waiting for players to join

    const player = game.players.find(player => player.name === 'player1');
    expect(player.chips).toBe(90);

  });
})
