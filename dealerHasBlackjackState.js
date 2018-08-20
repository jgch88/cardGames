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
    const players = this.game.bettingPlayers;
    players.forEach(player => {
      if (player.score === 21) {
        this.game.sendMessageLogMessages(`[${player.name}]: Blackjack!`);
        player.hasNatural();
        player.resolve();
        // resolve bet!
        const playerBet = this.game.bets.filter(bet => bet.player.name === player.name)[0];
        playerBet.resolve('playerDraws', 1, this.game.dealer);
      } else {
        this.game.sendMessageLogMessages(`[${player.name}]: No Blackjack.`);
        player.resolve();
        const playerBet = this.game.bets.filter(bet => bet.player.name === player.name);
        if (playerBet.length > 0) {
          playerBet[0].resolve('playerLoses', 1, this.game.dealer);
        }
      }
    })
  },
}

module.exports = dealerHasBlackjackState;
