const BlackjackGame = require('./blackjackEventLoop.js');
const Player = require('./player.js');
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
  expect(game.bettingPlayers.length).toBe(0);

  game.placeBet('player1', 100);

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
});
