const resolveState = require('./resolveState.js');

const dealerNoBlackjackState = {
  // need some async method to check for
  // all players resolved => move on
  // to resolving unresolved Bets
  // no need! check in getNextPlayer;
  init(game) {
    const greeting = `[State]: Dealer has no blackjack. Checking if players have blackjack.`;
    this.name = 'dealerNoBlackjackState';
    this.game = game;
    this.game.sendMessageLogMessages(greeting);
    this.checkIfPlayersHaveBlackjack();
    // set CurrentPlayer
    this.game.currentPlayer = this.getNextPlayer();
  },
  joinGame() {
  },
  leaveGame() {
  },
  changeNickname() {
  },
  placeBet() {
  },
  play(playerName, move) {
    // there should be a currentPlayer property on the game, only the current player gets to play a move
    if (this.game.currentPlayer.name === playerName) {
      const moveMessage = `[${this.game.currentPlayer.nickname}]: '${move}'`;
      this.game.sendMessageLogMessages(moveMessage);
      if (move === 'hit') {
        this.game.deck.transferTopCard(this.game.currentPlayer.hand);
        this.game.currentPlayer.hand.cards[this.game.currentPlayer.hand.cards.length - 1].turnFaceUp();
        this.game.render();
        if (this.game.currentPlayer.score > 21) {
          const playerBurstsMessage = `[${this.game.currentPlayer.nickname}]: bursts (${this.game.currentPlayer.score}).`;
          this.game.sendMessageLogMessages(playerBurstsMessage);
          this.game.sendMessageLogMessages(this.game.currentPlayer.bet.resolve('playerLoses', 1, this.game.dealer));
          this.game.currentPlayer.resolve();
          this.game.emitCurrentChipsInHand();
          this.game.currentPlayer = this.getNextPlayer();
        } else if (this.game.currentPlayer.score === 21) {
          const playerBlackjackMessage = `[${this.game.currentPlayer.nickname}]: Blackjack!`;
          this.game.sendMessageLogMessages(playerBlackjackMessage);
          this.game.sendMessageLogMessages(this.game.currentPlayer.bet.resolve('playerWins', 1, this.game.dealer));
          this.game.currentPlayer.resolve();
          this.game.emitCurrentChipsInHand();
          this.game.currentPlayer = this.getNextPlayer();
        }
      } else if (move === 'stand') {
        this.game.render();
        this.game.currentPlayer.resolve();
        this.game.emitCurrentChipsInHand();
        this.game.currentPlayer = this.getNextPlayer();
      } else {
        throw `[Error]: Invalid move ${playerName}. Please enter 'stand' or 'hit'`;
      }

    } else {
      throw `It is not ${playerName}'s turn!`;
    }
  },
  checkIfPlayersHaveBlackjack() {
    this.game.getBettingPlayers().forEach(player => {
      if (player.score === 21) {

        const playerBlackjackMessage = `[${player.nickname}]: Blackjack!`;
        this.game.sendMessageLogMessages(playerBlackjackMessage);
        this.game.sendMessageLogMessages(player.bet.resolve('playerWins', 1.5, this.game.dealer));
        player.resolve();
      } else {
        this.game.sendMessageLogMessages(`[${player.nickname}]: No Blackjack.`);
      }
    })
    this.game.emitCurrentState(); // update chips
  },
  getNextPlayer() {
    // don't let those players who have already got a Blackjack play
    const remainingPlayers = this.game.getBettingPlayers().filter(player => !player.resolved);
    // console.log(`Remaining players: ${remainingPlayers}`); // this helped me figure out players.resolve needed to be reset in cleanUp()
    // what if there's no first player??
    // change state to resolve!
    if (remainingPlayers.length === 0) {
      delete this.game.currentPlayer;
      this.game.changeState(resolveState);
      return null;
    } else {
      this.game.sendMessageLogMessages(`[${remainingPlayers[0].nickname}]: stand/hit?`);
      return remainingPlayers[0];
    }
  }
}

module.exports = dealerNoBlackjackState;
