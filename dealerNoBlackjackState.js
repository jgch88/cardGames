const resolveState = require('./resolveState.js');

const dealerNoBlackjackState = {
  // need some async method to check for
  // all players resolved => move on
  // to resolving unresolved Bets
  // no need! check in getNextPlayer;
  init(game) {
    console.log(`[State]: Dealer has no blackjack. Checking if players have blackjack.`);
    this.name = 'dealerNoBlackjackState';
    this.game = game;
    this.checkIfPlayersHaveBlackjack();
    // set CurrentPlayer
    this.game.currentPlayer = this.getNextPlayer();
  },
  joinGame() {
  },
  leaveGame() {
  },
  placeBet() {
  },
  play(playerName, move) {
    // there should be a currentPlayer property on the game, only the current player gets to play a move
    if (this.game.currentPlayer.name === playerName) {
      console.log(`[${playerName}]: '${move}'`);
      if (move === 'hit') {
        this.game.deck.transferTopCard(this.game.currentPlayer.hand);
        this.game.currentPlayer.hand.cards[this.game.currentPlayer.hand.cards.length - 1].turnFaceUp();
        this.game.render();
        if (this.game.currentPlayer.score > 21) {
          console.log(`[${this.game.currentPlayer.name}]: bursts (${this.game.currentPlayer.score}).`);
          // resolve bet!
          const playerBet = this.game.bets.filter(bet => bet.player.name === this.game.currentPlayer.name)[0];
          playerBet.resolve('playerLoses', 1, this.game.dealer);
          // resolve player!
          this.game.currentPlayer.resolve();
          this.game.currentPlayer = this.getNextPlayer();
        } else if (this.game.currentPlayer.score === 21) {
          console.log(`[${this.game.currentPlayer.name}]: Blackjack!`);
          // resolve bet!
          const playerBet = this.game.bets.filter(bet => bet.player.name === this.game.currentPlayer.name)[0];
          playerBet.resolve('playerWins', 1, this.game.dealer);
          // resolve player!
          this.game.currentPlayer.resolve();
          this.game.currentPlayer = this.getNextPlayer();
        }
      } else if (move === 'stand') {
        this.game.render();
        this.game.currentPlayer.resolve();
        this.game.currentPlayer = this.getNextPlayer();
      } else {
        throw `[Error]: Invalid move ${playerName}. Please enter 'stand' or 'hit'`;
      }

    } else {
      throw `It is not ${playerName}'s turn!`;
    }
  },
  checkIfPlayersHaveBlackjack() {
    const players = this.game.bettingPlayers;
    players.forEach(player => {
      if (player.score === 21) {
        console.log(`[${player.name}]: Blackjack!`);
        player.hasNatural();
        player.resolve();
        // resolve bet!
        const playerBet = this.game.bets.filter(bet => bet.player.name === player.name)[0];
        playerBet.resolve('playerWins', 1, this.game.dealer);
      } else {
        console.log(`[${player.name}]: No Blackjack.`);
      }
    })
  },
  getNextPlayer() {
    // don't let those players who have already got a Blackjack play
    const remainingPlayers = this.game.bettingPlayers.filter(player => !player.resolved);
    // console.log(`Remaining players: ${remainingPlayers}`); // this helped me figure out players.resolve needed to be reset in cleanUp()
    // what if there's no first player??
    // change state to resolve!
    if (remainingPlayers.length === 0) {
      delete this.game.currentPlayer;
      this.game.changeState(resolveState);
      return null;
    } else {
      console.log(`[${remainingPlayers[0].name}]: stand/hit?`);
      return remainingPlayers[0];
    }
  }
}

module.exports = dealerNoBlackjackState;
