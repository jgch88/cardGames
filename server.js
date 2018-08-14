const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(4000, () => console.log(`Listening on port 4000`));

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`new connection`);

})

// how to init the game and have the server listen for state changes?


// abstract the game object so that
// methods can modify this game object
// via ajax/web sockets
// i.e. refactor out the playerTurns
// need to transform a "sequential" based thing 
// back to coexist with the "event loop/listener" model
