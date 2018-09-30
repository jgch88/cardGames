const gettingPlayersState = require('./gettingPlayersState.js');

const resolveState = {
  init(game) {
    this.name = 'resolveState';
    this.game = game;
    this.game.addMessageToMessageLog(`[State]: Resolving remaining bets`);
    this.game.emitCurrentState();
    this.game.dealer.hand.cards.forEach(card => {
      card.turnFaceUp();
    });
    this.game.addMessageToMessageLog(`[Dealer]: Revealing face down card!`);
    this.game.emitCurrentState();
    // this.game.observer.render();
    this.game.emitCurrentState();
    // players with unresolved bets
    // this thing is duplicated in dealerNoBlackjackState on 'hit'
    // -> can we extract method and put it in Player?
    const remainingBets = this.game.bets.filter(bet => !bet.resolved);
    if (remainingBets.length > 0) {
      this.dealerPlays();
    }
    remainingBets.forEach(bet => {
      this.resolveBet(bet);
    });
    // this.game.emitCurrentChipsInHand();
    this.game.emitCurrentState();
    this.game.addMessageToMessageLog(`[State]: All bets resolved! Round over.`);
    this.game.emitCurrentState();

    this.cleanUp();
    this.game.changeState(gettingPlayersState);
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
  dealerPlays() {
    const dealer = this.game.dealer;
    while (dealer.score < 17) {
      this.game.addMessageToMessageLog(`[Dealer]: 'hit'`);
      this.game.deck.transferTopCard(dealer.hand);
      dealer.hand.cards[dealer.hand.cards.length - 1].turnFaceUp();
      // this.game.observer.render();
      this.game.emitCurrentState();
    }
  },
  resolveBet(bet) {
    const dealer = this.game.dealer;
    const player = bet.player;
    if (dealer.score > 21) {
      // player burst or player blackjack should
      // already have been resolved
      this.game.addMessageToMessageLog(bet.resolve('playerWins', 1, dealer));
      this.game.emitCurrentState();
      return;
    }
    // don't need case where player > 21, since it
    // should already have been resolved!
    if (dealer.score > bet.score) {
      this.game.addMessageToMessageLog(bet.resolve('playerLoses', 1, dealer));
      this.game.emitCurrentState();
    } else if (dealer.score === bet.score) {
      this.game.addMessageToMessageLog(bet.resolve('playerDraws', 1, dealer));
      this.game.emitCurrentState();
    } else {
      this.game.addMessageToMessageLog(bet.resolve('playerWins', 1, dealer));
      this.game.emitCurrentState();
    }
  },
  cleanUp() {
    this.game.bets.forEach((bet) => {
      while (bet.hand.cards.length > 0) {
        bet.hand.transferTopCard(this.game.deck);
      }
      // player.resolved = false;
    })
    while (this.game.dealer.hand.cards.length > 0) {
      this.game.dealer.hand.transferTopCard(this.game.deck);
    }
    this.game.bets = [];
    this.game.deck.shuffle();
    this.game.deck.cards.forEach(card => {
      card.turnFaceDown();
    })
    this.game.addMessageToMessageLog(`[State]: Discarding cards, reshuffling.`);
    this.game.emitCurrentState();
    // how long to show last hand for?
    // this.game.getPlayerChipsInHand();
    // this.game.getPlayerBetAmounts();
    // TODO: remove insurance bets
  }
}

module.exports = resolveState;
