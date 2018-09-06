const dealerHasBlackjackState = require('./dealerHasBlackjackState.js');
const dealerNoBlackjackState = require('./dealerNoBlackjackState.js');

const gettingInsuranceBetsState = {
  init(game) {
    // this state will transit to dealerBlackjack/dealerNoBlackjack
    // after getting all insurance bet decisions
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
  placeInsuranceBet(playerName, amount, game) {
    console.log(playerName, amount, game);
    // emit a message to all players and expect a response within 30s?
    // promise.all?
    // generate a single promise for each current bet
    let insuranceBets = this.game.bets.map(bet => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('foo');
        })
    });
    );
    Promise.all(insuranceBets).then(function(values) {
      console.log(values);
    })
    //
  }
}

module.exports = gettingInsuranceBetsState;
