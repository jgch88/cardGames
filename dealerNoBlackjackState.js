const resolveState = require('./resolveState.js');

const dealerNoBlackjackState = {
  // need some async method to check for
  // all players resolved => move on
  // to resolving unresolved Bets
  // no need! check in getNextBet;
  init(game) {
    const greeting = `[State]: Dealer has no blackjack. Checking if players have blackjack.`;
    this.name = 'dealerNoBlackjackState';
    this.game = game;
    this.game.sendMessageLogMessages(greeting);
    this.checkIfPlayersHaveBlackjack();
    // set CurrentPlayer
    this.game.currentBet = this.getNextBet();
    this.game.emitCurrentState();
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
    if (this.game.currentBet.player.name === playerName) {
      const moveMessage = `[${this.game.currentBet.player.nickname}]: '${move}'`;
      this.game.sendMessageLogMessages(moveMessage);
      if (move === 'hit') {
        this.game.deck.transferTopCard(this.game.currentBet.hand);
        this.game.currentBet.hand.cards[this.game.currentBet.hand.cards.length - 1].turnFaceUp();
        this.game.render();
        if (this.game.currentBet.score > 21) {
          const playerBurstsMessage = `[${this.game.currentBet.player.nickname}]: bursts (${this.game.currentBet.score}).`;
          this.game.sendMessageLogMessages(playerBurstsMessage);
          this.game.sendMessageLogMessages(this.game.currentBet.resolve('playerLoses', 1, this.game.dealer));
          this.game.emitCurrentChipsInHand();
          this.game.currentBet = this.getNextBet();
        } else if (this.game.currentBet.score === 21) {
          const playerBlackjackMessage = `[${this.game.currentBet.player.nickname}]: Blackjack!`;
          this.game.sendMessageLogMessages(playerBlackjackMessage);
          this.game.sendMessageLogMessages(this.game.currentBet.resolve('playerWins', 1, this.game.dealer));
          this.game.emitCurrentChipsInHand();
          this.game.currentBet = this.getNextBet();
        }
      } else if (move === 'stand') {
        this.game.currentBet.stand = true;
        this.game.render();
        this.game.emitCurrentChipsInHand();
        this.game.currentBet = this.getNextBet();
      } else {
        throw `[Error]: Invalid move ${playerName}. Please enter 'stand' or 'hit'`;
      }

    } else {
      throw `It is not ${playerName}'s turn!`;
    }
    this.game.emitCurrentBet();
  },
  checkIfPlayersHaveBlackjack() {
    // checkIfBetsHaveBlackjack
    this.game.bets.forEach(bet => {
      if (bet.score === 21) {

        const playerBlackjackMessage = `[${bet.player.nickname}]: Blackjack!`;
        this.game.sendMessageLogMessages(playerBlackjackMessage);
        this.game.sendMessageLogMessages(bet.resolve('playerWins', 1.5, this.game.dealer));
      } else {
        this.game.sendMessageLogMessages(`[${bet.player.nickname}]: No Blackjack.`);
      }
    })
    this.game.emitCurrentState(); // update chips
  },
  getNextBet() {
    // getNextBet
    // don't let those players who have already got a Blackjack play
    const remainingBets = this.game.bets.filter(bet => !(bet.resolved || bet.stand));
    console.log(remainingBets);
    // console.log(`Remaining players: ${remainingBets}`); // this helped me figure out players.resolve needed to be reset in cleanUp()
    // what if there's no first player??
    // change state to resolve!
    if (remainingBets.length === 0) {
      delete this.game.currentBet;
      this.game.changeState(resolveState);
      return null;
    } else {
      this.game.sendMessageLogMessages(`[${remainingBets[0].player.nickname}]: stand/hit?`);
      return remainingBets[0];
    }
  }
}

module.exports = dealerNoBlackjackState;
