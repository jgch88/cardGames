const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const BlackjackGame = require('./blackjackEventLoop.js');
const argv = require('minimist')(process.argv.slice(2));
const decks = require('./deckConfig.js');

console.log(decks[argv.deck]);

const gettingPlayersState = require('./gettingPlayersState.js');
const gettingBetsState = require('./gettingBetsState.js');
const checkDealerForNaturalsState = require('./checkDealerForNaturalsState.js');
const resolveState = require('./resolveState.js');

server.listen(4000, () => console.log(`Listening on port 4000`));

const game = Object.create(BlackjackGame);
game.init(io);
if (decks[argv.deck]) {
  game.deck = decks[argv.deck];
}
let games = [game];

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`New socket connected.`);
  // how to get socket ID?
  // console.log(socket.id);
  console.log(`[Game players]: ${games[0].players.map(player => player.name)}`);

  socket.on('newSocketReady', () => {
    console.log('ready');
    games[0].emitCurrentState();
  })

  socket.on('createRoom', (roomName) => {
    console.log('creating room', roomName);
    // init game with roomName property
    // server also needs to keep track of rooms
    game = Object.create(BlackjackGame);
    game.init(io, roomName);
    socket.join(roomName);
    game.emitCurrentState();
    games.push[game];
  })
  
  socket.on('joinRoom', (roomName) => {
    console.log('joining room', roomName);
    // throw error if trying to join a game 
    // that server hasn't created
    // since socket can join the 'room' but
    // game has actually not been initialised
    socket.join(roomName);
    // need to emit roomName's gamestate
  })
  
  socket.on('disconnect', (reason) => {
    games[0].sendMessageLogMessages(`[${socket.id}] Disconnected: ${reason}`);
    if (games[0].state.name === 'dealerNoBlackjackState' && games[0].currentPlayer.name === socket.id) {
      games[0].currentPlayer.resolve();
      games[0].currentPlayer.bet.resolve('playerLoses', 1, games[0].dealer);
      games[0].currentPlayer = games[0].state.getNextPlayer();
    } else {
    // socketid player resolve not currentplayer!!!
      const disconnectedPlayer = games[0].players.find(player => player.name === socket.id);
      if (disconnectedPlayer) {
        disconnectedPlayer.resolve();
        if (disconnectedPlayer.bet) {
          disconnectedPlayer.bet.resolve('playerLoses', 1, games[0].dealer);
        }
      }
    }
    games[0].players = games[0].players.filter(player => player.name !== socket.id);
    // also remove their bets if they disconnect?
    // otherwise there's going to be problems with bet and 
    // player resolution
    // dealer pockets the money?
    console.log(`[Game players]: ${games[0].players.map(player => player.name)}`);
    // when all players disconnect, resolve game and go back to gettingPlayersState
    if (games[0].players.length === 0) {
      console.log(`All players disconnected`);
      games[0].changeState(resolveState);
    }
    games[0].emitCurrentState();
  });

  socket.on('joinGame', (chips) => {
    try {
      games[0].joinGame(`${socket.id}`, chips.chips);
      console.log(`[Game players]: ${games[0].players.map(player => player.name)}`);
      games[0].emitCurrentState();
    } catch (e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
  });

  socket.on('placeBet', (chips) => {
    try {
      games[0].placeBet(`${socket.id}`, chips.chips);
      games[0].emitCurrentState();
    } catch(e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
  });

  socket.on('play', (move) => {
    try {
      games[0].play(socket.id, move);
    } catch (e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
    // this part controls where the end state of the game changes to a blank
  });

  socket.on('changeNickname', (nickname) => {
    try {
      console.log(`changing nickname to ${nickname}`);
      games[0].changeNickname(socket.id, nickname);
      games[0].emitCurrentState();
    } catch (e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
  })

  socket.on('changeState', (newState) => {
    if (newState === 'gettingBetsState') {
      if (games[0].state.name === 'gettingPlayersState') {
        games[0].changeState(gettingBetsState)
      } else {
        console.log(`[State]: Can't change to ${newState}`);
      }
    } else if (newState === 'checkDealerForNaturalsState') {
      if (games[0].state.name === 'gettingBetsState') {
        games[0].changeState(checkDealerForNaturalsState);
      } else {
        console.log(`[State]: Can't change to ${newState}`);
      }
    }
  })

})

// how to init the game and have the server listen for state changes?


// abstract the game object so that
// methods can modify this game object
// via ajax/web sockets
// i.e. refactor out the playerTurns
// need to transform a "sequential" based thing 
// back to coexist with the "event loop/listener" model
module.exports = server;
