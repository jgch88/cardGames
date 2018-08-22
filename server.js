const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const BlackjackGame = require('./blackjackEventLoop.js');

const gettingPlayersState = require('./gettingPlayersState.js');
const gettingBetsState = require('./gettingBetsState.js');
const checkDealerForNaturalsState = require('./checkDealerForNaturalsState.js');
const resolveState = require('./resolveState.js');

server.listen(4000, () => console.log(`Listening on port 4000`));

const game = Object.create(BlackjackGame);
game.init(io);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`New socket connected.`);
  // how to get socket ID?
  // console.log(socket.id);
  console.log(`[Game players]: ${game.players.map(player => player.name)}`);

  socket.on('newSocketReady', () => {
    console.log('ready');
    game.emitCurrentState();
  })
  
  socket.on('disconnect', (reason) => {
    console.log(`[${socket.id}] Disconnected: ${reason}`);
    const player = game.players.find(player => player.name === socket.id);
    if (player && player.bet) {
      player.bet.resolve('playerLoses', 1, game.dealer);
    }
    game.players = game.players.filter(player => player.name !== socket.id);
    // also remove their bets if they disconnect?
    // otherwise there's going to be problems with bet and 
    // player resolution
    // dealer pockets the money?
    console.log(`[Game players]: ${game.players.map(player => player.name)}`);
    // when all players disconnect, resolve game and go back to gettingPlayersState
    if (game.players.length === 0) {
      console.log(`All players disconnected`);
      game.changeState(resolveState);
    }
  })

  socket.on('joinGame', (chips) => {
    // console.log(chips);
    game.joinGame(`${socket.id}`, chips.chips);
    console.log(`[Game players]: ${game.players.map(player => player.name)}`);
    // error handle to emit something back
  })

  socket.on('placeBet', (chips) => {
    game.placeBet(`${socket.id}`, chips.chips);

  })

  socket.on('play', (move) => {
    game.play(socket.id, move);
  });

  socket.on('changeState', (newState) => {
    if (newState === 'gettingBetsState') {
      if (game.state.name === 'gettingPlayersState') {
        game.changeState(gettingBetsState)
      } else {
        console.log(`[State]: Can't change to ${newState}`);
      }
    } else if (newState === 'checkDealerForNaturalsState') {
      if (game.state.name === 'gettingBetsState') {
        game.changeState(checkDealerForNaturalsState);
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
