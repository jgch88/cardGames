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

})

test('correct number of players place bets', () => {

  const game = Object.create(BlackjackGame);
  game.init(io);

  game.joinGame('player1', 100);
  game.joinGame('player2', 100);
  
  game.changeState(gettingBetsState);
  expect(game.bettingPlayers.length).toBe(0);

  game.placeBet('player1', 100);

  game.changeState(checkDealerForNaturals);
  expect(game.bettingPlayers.length).toBe(1);
})
