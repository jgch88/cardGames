const dealerHasBlackjackState = require('./dealerHasBlackjackState.js');
const dealerNoBlackjackState = require('./dealerNoBlackjackState.js');

const gettingInsuranceBetsState = {
  init(game) {
    const greeting = `[State]: Getting insurance bets`;
    this.game = game;
    this.game.sendMessageLogMessages(greeting);
    this.name = 'gettingInsuranceBetsState';

  },
  joinGame() {
  },
  leaveGame() {
  },
  changeNickname() {
  },
  placeBet() {
  },
  play() {
  },
}

module.exports = gettingInsuranceBetsState;
