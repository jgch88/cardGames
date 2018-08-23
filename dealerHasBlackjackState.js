const resolveState = require('./resolveState.js');

const dealerHasBlackjackState = {
  init(game) {
    this.name = 'dealerHasBlackjackState';
    this.game = game;
    this.game.sendMessageLogMessages(`[State]: Dealer has a blackjack! Checking if players have blackjack.`);
    this.checkIfPlayersHaveBlackjack();
    
    game.render();
    game.changeState(resolveState);
  },
  joinGame() {
  },
  leaveGame() {
  },
  placeBet() {
  },
  play() {
  },
  checkIfPlayersHaveBlackjack() {
    const players = this.game.getBettingPlayers();
    players.forEach(player => {
      if (player.score === 21) {
        this.game.sendMessageLogMessages(`[${player.nickname}]: Blackjack!`);
        player.resolve();
        // resolve bet!
        player.bet.resolve('playerDraws', 1, this.game.dealer);
      } else {
        this.game.sendMessageLogMessages(`[${player.nickname}]: No Blackjack.`);
        player.resolve();
        player.bet.resolve('playerLoses', 1, this.game.dealer);
      }
    })
  },
}

module.exports = dealerHasBlackjackState;
