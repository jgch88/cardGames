const Player = require('./player.js');

const TIMER_COUNTDOWN = 4;

const gettingPlayersState = {
  init(game) {
    this.game = game;
    this.game.addMessageToMessageLog(`[State]: Getting players`);
    this.name = 'gettingPlayersState';
    this.game.countdown = TIMER_COUNTDOWN;
    this.game.timer = setInterval(() => {
      this.game.countdown -= 1;
      this.game.gameDataChanged();
      if (this.game.countdown === 0) {
        if (this.game.players.length !== 0) {
          this.game.changeState(require('./gettingBetsState.js'));
        } else {
          this.game.countdown = TIMER_COUNTDOWN;
          this.game.gameDataChanged();
        }
      }
    }, 1000)
  },
  joinGame(playerName, chips, game) {
    // maybe playerName will be playerId because of socket.io
    
    if (game.players.find(player => player.name === playerName)) {
      throw `Another player is using the name ${playerName}. Please use a different name.`;
    }

    if (chips <= 0) {
      throw `Please exchange at least 1 chip.`;
    }

    const player = Object.create(Player);
    player.init(playerName, chips);
    game.players.push(player);
    // this.game.getPlayerChipsInHand();


    this.game.addMessageToMessageLog(`[${player.nickname}]: Joined with ${chips} chips`);
  },
  leaveGame() {
  },
  changeNickname(playerName, nickname, game) {
    const player = game.players.find(player => player.name === playerName);
    if (player) {
      player.setNickname(nickname);
      this.game.addMessageToMessageLog(`[${playerName}]: Changed nickname to ${nickname}`);
    } else {
      throw `Player not found`;
    }
  },
  placeBet() {
    throw `Waiting for other players to join. Please be patient`;
  },
  play() {
    throw `Waiting for other players to join. Please be patient`;
  }
}

module.exports = gettingPlayersState;
