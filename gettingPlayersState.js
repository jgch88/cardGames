const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');

const gettingPlayersState = {
  init(game) {
    console.log(`[State]: Getting players`);
    this.game = game;
    this.game.sendMessageLogMessages(`[State]: Getting players`);
    this.name = 'gettingPlayersState';
  },
  joinGame(playerName, chips, game) {
    // maybe playerName will be playerId because of socket.io
    
    if (game.players.filter(player => player.name === playerName).length > 0) {
      throw `Another player is using the name ${playerName}. Please use a different name.`;
    }

    if (chips <= 0) {
      throw `Please exchange at least 1 chip.`;
    }

    const player = Object.create(Player);
    player.init(playerName, chips);
    game.players.push(player);
    console.log(`[${player.name}]: Joined with ${chips} chips`);
    this.game.sendMessageLogMessages(`[${player.name}]: Joined with ${chips} chips`);
  },
  leaveGame() {
  },
  placeBet() {
    throw `Waiting for other players to join. Please be patient`;
  },
  play() {
    throw `Waiting for other players to join. Please be patient`;
  }
}

module.exports = gettingPlayersState;
