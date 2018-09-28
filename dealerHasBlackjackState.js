const resolveState = require('./resolveState.js');

const dealerHasBlackjackState = {
  init(game) {
    this.name = 'dealerHasBlackjackState';
    this.game = game;
    this.game.sendMessageLogMessages(`[State]: Dealer has a blackjack! Checking if players have blackjack.`);
    this.checkIfPlayersHaveBlackjack();
    
    // game.observer.render();
    game.emitCurrentState();
    game.changeState(resolveState);
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
  checkIfPlayersHaveBlackjack() {
    this.game.bets.forEach(bet => {
      if (bet.score === 21) {
        this.game.sendMessageLogMessages(`[${bet.player.nickname}]: Blackjack!`);
        bet.resolve('playerDraws', 1, this.game.dealer);
      } else {
        this.game.sendMessageLogMessages(`[${bet.player.nickname}]: No Blackjack.`);
        bet.resolve('playerLoses', 1, this.game.dealer);
      }
    })
  },
}

module.exports = dealerHasBlackjackState;
