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
    this.game.addMessageToMessageLog(greeting);
    this.checkIfPlayersHaveBlackjack();
    // set CurrentPlayer
    this.game.currentBet = this.getNextBet();
    this.game.gameDataChanged();
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
    if (this.game.currentBet.player.name !== playerName) {
      throw `It is not ${playerName}'s turn!`;
    }

    const validMoves = ['hit', 'stand', 'split'];
    if (!validMoves.includes(move)) {
      throw `[Error]: Invalid move ${playerName}. Please enter 'stand' or 'hit'`;
    }

    const moveMessage = `[${this.game.currentBet.player.nickname}]: '${move}'`;
    this.game.addMessageToMessageLog(moveMessage);

    if (move === 'hit') {
      this.game.deck.transferTopCard(this.game.currentBet.hand);
      this.game.currentBet.hand.cards[this.game.currentBet.hand.cards.length - 1].turnFaceUp();
      this.game.gameDataChanged();
      if (this.game.currentBet.score > 21) {
        const playerBurstsMessage = `[${this.game.currentBet.player.nickname}]: bursts (${this.game.currentBet.score}).`;
        this.game.addMessageToMessageLog(playerBurstsMessage);
        this.game.addMessageToMessageLog(this.game.currentBet.resolve('playerLoses', 1, this.game.dealer));
        this.game.currentBet = this.getNextBet();
      } else if (this.game.currentBet.score === 21) {
        const playerBlackjackMessage = `[${this.game.currentBet.player.nickname}]: Blackjack!`;
        this.game.addMessageToMessageLog(playerBlackjackMessage);
        this.game.addMessageToMessageLog(this.game.currentBet.resolve('playerWins', 1, this.game.dealer));
        this.game.currentBet = this.getNextBet();
      }
    } 
    if (move === 'stand') {
      this.game.currentBet.stand = true;
      this.game.currentBet = this.getNextBet();
      this.game.gameDataChanged();
    }
    if (move === 'split') {
      if (this.game.currentBet.hand.cards[0].value !== this.game.currentBet.hand.cards[1].value) {
        throw `Can't split. Cards are not the same value!`;
      }
      if (this.game.currentBet.hand.cards.length > 2) {
        throw `Can't split after hitting`;
      }
      const player = this.game.players.find(player => player.name === playerName);
      const splitBet = player.placeBet(this.game.currentBet.betAmount);
      this.game.bets.splice(this.game.bets.indexOf(this.game.currentBet) + 1, 0, splitBet);
      this.game.currentBet.hand.transferTopCard(splitBet.hand);
      this.game.gameDataChanged();
      if (splitBet.hand.cards[0].value === 1) {
        // for split aces, dealer gives each hand one card and only one card.
        // cannot get "blackjack" for 1.5x payout through splits
        this.game.deck.transferTopCard(this.game.currentBet.hand);
        this.game.currentBet.hand.cards[1].turnFaceUp();
        this.game.deck.transferTopCard(splitBet.hand);
        splitBet.hand.cards[1].turnFaceUp();
        this.game.play(player.name, 'stand');
        this.game.play(player.name, 'stand');
      }
    }

    this.game.gameDataChanged();
    // this part needs a state transition so taht
    // players can see what dealer got before
    // the table gets wiped out.
    // transition to "waiting for players" with timer
    // or something..
  },
  checkIfPlayersHaveBlackjack() {
    // checkIfBetsHaveBlackjack
    this.game.bets.forEach(bet => {
      if (bet.score === 21) {

        const playerBlackjackMessage = `[${bet.player.nickname}]: Blackjack!`;
        this.game.addMessageToMessageLog(playerBlackjackMessage);
        this.game.addMessageToMessageLog(bet.resolve('playerWins', 1.5, this.game.dealer));
      } else {
        this.game.addMessageToMessageLog(`[${bet.player.nickname}]: No Blackjack.`);
      }
    })
  },
  getNextBet() {
    // don't let those players who have already got a Blackjack play
    const remainingBets = this.game.bets.filter(bet => !(bet.resolved || bet.stand));
    //console.log(remainingBets);
    // console.log(`Remaining players: ${remainingBets}`); // this helped me figure out players.resolve needed to be reset in cleanUp()
    // what if there's no first player??
    // change state to resolve!
    if (remainingBets.length === 0) {
      delete this.game.currentBet;
      this.game.changeState(resolveState);
      return null;
    } else {
      this.game.addMessageToMessageLog(`[${remainingBets[0].player.nickname}]: stand/hit?`);
      return remainingBets[0];
    }
  }
}

module.exports = dealerNoBlackjackState;
