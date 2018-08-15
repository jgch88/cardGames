const resolveState = require('./resolveState.js');

const dealerHasBlackjackState = {
  init(game) {
    console.log(`[State]: Dealer has a blackjack! Checking if players have blackjack.`);
    this.game = game;
    this.checkIfPlayersHaveBlackjack();
    
    game.render();
    console.log(`TODO: `)
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
    const players = this.game.players.slice(1);
    players.forEach(player => {
      if (player.score === 21) {
        console.log(`[${player.name}]: Blackjack!`);
        player.hasNatural();
        player.resolve();
        // resolve bet!
        const playerBet = this.game.bets.filter(bet => bet.player.name === player.name)[0];
        playerBet.resolve('playerDraws', 1, this.game.players[0]);
      } else {
        console.log(`[${player.name}]: No Blackjack.`);
        player.resolve();
        const playerBet = this.game.bets.filter(bet => bet.player.name === player.name)[0];
        playerBet.resolve('playerLoses', 1, this.game.players[0]);
      }
    })
  },
}

module.exports = dealerHasBlackjackState;
