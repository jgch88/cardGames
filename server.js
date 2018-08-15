const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const BlackjackGame = require('./blackjackEventLoop.js');

server.listen(4000, () => console.log(`Listening on port 4000`));

const game = Object.create(BlackjackGame);
game.init();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`new connection`);
  // how to get socket ID?
  // console.log(socket.id);
  console.log(game.players);

  socket.on('disconnect', (reason) => {
    console.log(`Disconnected: ${reason}`);
    const playerIndex = game.players.indexOf(socket.id);
    game.players.splice(playerIndex, 1);
    // also remove their bets if they disconnect?
    // otherwise there's going to be problems with bet and 
    // player resolution
    // dealer pockets the money?
    console.log(game.players);
  })

  socket.on('joinGame', (chips) => {
    console.log(chips);
    game.joinGame(`${socket.id}`, chips.chips);
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
