const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const BlackjackGame = require('./blackjackEventLoop.js');

const gettingBetsState = require('./gettingBetsState.js');
const checkDealerForNaturals = require('./checkDealerForNaturals.js');

server.listen(4000, () => console.log(`Listening on port 4000`));

const game = Object.create(BlackjackGame);
game.init();
game.addSocket(io);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`New socket connected.`);
  // how to get socket ID?
  // console.log(socket.id);
  console.log(`[Game players]: ${game.players.map(player => player.name)}`);

  socket.on('disconnect', (reason) => {
    console.log(`[${socket.id}] Disconnected: ${reason}`);
    const playerIndex = game.players.map(player => player.name).indexOf(socket.id);
    game.players.splice(playerIndex, 1);
    // also remove their bets if they disconnect?
    // otherwise there's going to be problems with bet and 
    // player resolution
    // dealer pockets the money?
    console.log(`[Game players]: ${game.players.map(player => player.name)}`);
  })

  socket.on('joinGame', (chips) => {
    // console.log(chips);
    game.joinGame(`${socket.id}`, chips.chips);
    game.changeState(gettingBetsState);
    game.placeBet(`${socket.id}`, 1);
    game.changeState(checkDealerForNaturals);
    console.log(`[Game players]: ${game.players.map(player => player.name)}`);
    // error handle to emit something back
  })

})

// how to init the game and have the server listen for state changes?


// abstract the game object so that
// methods can modify this game object
// via ajax/web sockets
// i.e. refactor out the playerTurns
// need to transform a "sequential" based thing 
// back to coexist with the "event loop/listener" model
