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

let defaultRoomName = 'game0';
let game = Object.create(BlackjackGame);
game.init(io, defaultRoomName);
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
  let currentGame = games.find(game => game.roomName === defaultRoomName);
  let currentRoom = currentGame.roomName;
  socket.join(currentRoom);

  const changeCurrentGame = (roomName) => {
    socket.leave(currentRoom);
    currentGame = games.find(game => game.roomName === roomName);
    currentRoom = currentGame.roomName;
    socket.join(currentRoom);
  }
  // each socket can only be playing one game at a time
  // but this is fine since each browser tab has its own socket anyway

  // how to get socket ID of client?
  // console.log(socket.id);

  // called when react client invokes componentDidMount
  socket.on('newSocketReady', () => {
    currentGame.emitCurrentState();
  })

  socket.on('createRoom', (roomName) => {
    console.log('creating room', roomName);
    // init game with roomName property
    // server also needs to keep track of rooms
    
    if (games.find(game => game.roomName === roomName)) {
      changeCurrentGame(roomName);
    } else {
      let newGame = Object.create(BlackjackGame);
      newGame.init(io, roomName);
      games.push(newGame);
      changeCurrentGame(roomName);
    }
    currentGame.emitCurrentState();
  })
  
  socket.on('joinRoom', (roomName) => {
    try {
      changeCurrentGame(roomName);
      currentGame.emitCurrentState();
      console.log('joining room', roomName);
    } catch(e) {
      console.log(`No such room`);
    }
    // throw error if trying to join a game 
    // that server hasn't created
    // since socket can join the 'room' but
    // game has actually not been initialised
    // need to emit roomName's gamestate
  })
  
  socket.on('disconnect', (reason) => {
    currentGame.sendMessageLogMessages(`[${socket.id}] Disconnected: ${reason}`);
    if (currentGame.state.name === 'dealerNoBlackjackState' && currentGame.currentPlayer.name === socket.id) {
      currentGame.currentPlayer.resolve();
      currentGame.currentPlayer.bet.resolve('playerLoses', 1, currentGame.dealer);
      currentGame.currentPlayer = currentGame.state.getNextPlayer();
    } else {
    // socketid player resolve not currentplayer!!!
      const disconnectedPlayer = currentGame.players.find(player => player.name === socket.id);
      if (disconnectedPlayer) {
        disconnectedPlayer.resolve();
        if (disconnectedPlayer.bet) {
          disconnectedPlayer.bet.resolve('playerLoses', 1, currentGame.dealer);
        }
      }
    }
    currentGame.players = currentGame.players.filter(player => player.name !== socket.id);
    // also remove their bets if they disconnect?
    // otherwise there's going to be problems with bet and 
    // player resolution
    // dealer pockets the money?
    console.log(`[Game players]: ${currentGame.players.map(player => player.name)}`);
    // when all players disconnect, resolve game and go back to gettingPlayersState
    if (currentGame.players.length === 0) {
      console.log(`All players disconnected`);
      currentGame.changeState(resolveState);
    }
    currentGame.emitCurrentState();
  });

  socket.on('joinGame', (chips) => {
    try {
      currentGame.joinGame(`${socket.id}`, chips.chips);
      console.log(`[Game players]: ${currentGame.players.map(player => player.name)}`);
      currentGame.emitCurrentState();
    } catch (e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
  });

  socket.on('placeBet', (chips) => {
    try {
      currentGame.placeBet(`${socket.id}`, chips.chips);
      currentGame.emitCurrentState();
    } catch(e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
  });

  socket.on('play', (move) => {
    try {
      currentGame.play(socket.id, move);
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
      currentGame.changeNickname(socket.id, nickname);
      currentGame.emitCurrentState();
    } catch (e) {
      const errorString = `[Error]: ${e}`;
      socket.emit('emitError', errorString);
      console.log(errorString);
    }
  })

  socket.on('changeState', (newState) => {
    if (newState === 'gettingBetsState') {
      if (currentGame.state.name === 'gettingPlayersState') {
        currentGame.changeState(gettingBetsState)
      } else {
        console.log(`[State]: Can't change to ${newState}`);
      }
    } else if (newState === 'checkDealerForNaturalsState') {
      if (currentGame.state.name === 'gettingBetsState') {
        currentGame.changeState(checkDealerForNaturalsState);
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
