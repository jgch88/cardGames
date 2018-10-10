const gettingPlayersState = require('./gettingPlayersState.js');

const TIMER_COUNTDOWN = 5;

const resolveState = {
  init(game) {
    this.name = 'resolveState';
    this.game = game;
    if (this.game.bets.length === 0) {
      this.cleanUp();
      this.game.changeState(gettingPlayersState);
    } else {
      this.game.countdown = TIMER_COUNTDOWN;
      this.game.addMessageToMessageLog(`[State]: Resolving remaining bets`);
      this.game.dealer.hand.cards.forEach(card => {
        card.turnFaceUp();
      });
      this.game.addMessageToMessageLog(`[Dealer]: Revealing face down card!`);
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
      this.game.timer = setInterval(() => {
        if (this.game.countdown === 0) {
          this.game.addMessageToMessageLog(`[State]: All bets resolved! Round over.`);
          this.cleanUp();
          this.game.changeState(gettingPlayersState);
        }
        this.game.countdown -= 1;
        this.game.gameDataChanged();
      }, 1000);
    }
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
      this.game.gameDataChanged();
    }
  },
  resolveBet(bet) {
    const dealer = this.game.dealer;
    const player = bet.player;
    if (dealer.score > 21) {
      // player burst or player blackjack should
      // already have been resolved
      this.game.addMessageToMessageLog(bet.resolve('playerWins', 1, dealer));
      return;
    }
    // don't need case where player > 21, since it
    // should already have been resolved!
    if (dealer.score > bet.score) {
      this.game.addMessageToMessageLog(bet.resolve('playerLoses', 1, dealer));
    } else if (dealer.score === bet.score) {
      this.game.addMessageToMessageLog(bet.resolve('playerDraws', 1, dealer));
    } else {
      this.game.addMessageToMessageLog(bet.resolve('playerWins', 1, dealer));
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
    // how long to show last hand for?
    // TODO: remove insurance bets
  }
}

module.exports = resolveState;
