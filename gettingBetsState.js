const Bet = require('./bet.js');

const gettingBetsState = {
  init(game) {
    this.game = game;
    this.game.sendMessageLogMessages(`[State]: Getting bets`);
    this.name = 'gettingBetsState';
  },
  joinGame() {
    throw `Betting has started! Join the next round`;
  },
  leaveGame() {
  },
  changeNickname() {
  },
  placeBet(playerName, betAmount, game) {

    if (betAmount <= 0) {
      throw `Please bet at least 1 chip.`;
    }
    if (betAmount % 2 !== 0) {
      // so that blackjack 1.5x payouts are whole numbers
      throw `Please bet an even number of chips.`;
    }
    const player = game.players.find(player => player.name === playerName);
    if (!player) {
      throw `${playerName} not found, exchange some chips and join the game first.`;
    }
    if (betAmount > player.chips) {
      throw `Not enough chips`;
    }
    try {
      player.placeBet(betAmount);
      this.game.sendMessageLogMessages(`[${player.nickname}]: Bet ${betAmount} chips`);
    } catch (e) {
      console.log(e);
    }
   
    this.game.getPlayerChipsInHand();
    this.game.bettingPlayers = this.game.getBettingPlayers();
    this.game.getPlayerBetAmounts();
    
    // this method is doing too much?
    // 1. checking if player can bet
    // 2. creating bet object
    // 3. emitting bet state to front end: playerchips/messages/betamounts
  },
  play() {
    throw `Betting is in progress. Please be patient`;
  }
}

module.exports = gettingBetsState;
