const gettingPlayersState = require('./gettingPlayersState.js');

const resolveState = {
  init(game) {
    this.name = 'resolveState';
    this.game = game;
    this.game.sendMessageLogMessages(`[State]: Resolving remaining bets`);
    const dealer = this.game.dealer;
    dealer.hand.cards.forEach(card => {
      card.turnFaceUp();
    });
    this.game.sendMessageLogMessages(`[Dealer]: Revealing face down card!`);
    this.game.render();
    const remainingBets = this.game.bets.filter(bet => !bet.resolved);
    if (remainingBets.length > 0) {
      this.dealerPlays();
    }
    remainingBets.forEach(bet => {
      this.resolveBet(bet);
    });
    this.game.sendMessageLogMessages(`[State]: All bets resolved! Round over.`);

    this.cleanUp();
    this.game.changeState(gettingPlayersState);
  },
  joinGame() {
  },
  leaveGame() {
  },
  placeBet() {
  },
  play() {
  },
  dealerPlays() {
    const dealer = this.game.dealer;
    while (dealer.score < 17) {
      this.game.sendMessageLogMessages(`[Dealer]: 'hit'`);
      this.game.deck.transferTopCard(dealer.hand);
      dealer.hand.cards[dealer.hand.cards.length - 1].turnFaceUp();
      this.game.render();
    }
  },
  resolveBet(bet) {
    const dealer = this.game.dealer;
    const player = bet.player;
    if (dealer.score > 21) {
      if (player.score > 21) {
        this.game.sendMessageLogMessages(bet.resolve('playerDraws', 1, dealer));
      } else {
        this.game.sendMessageLogMessages(bet.resolve('playerWins', 1, dealer));
      }
      return;
    }
    if (player.score > 21) {
      this.game.sendMessageLogMessages(bet.resolve('playerLoses', 1, dealer));
      return;
    }
    if (dealer.score > player.score) {
      this.game.sendMessageLogMessages(bet.resolve('playerLoses', 1, dealer));
    } else if (dealer.score === player.score) {
      this.game.sendMessageLogMessages(bet.resolve('playerDraws', 1, dealer));
    } else {
      this.game.sendMessageLogMessages(bet.resolve('playerWins', 1, dealer));
    }
  },
  cleanUp() {
    this.game.bettingPlayers.forEach((player) => {
      while (player.hand.cards.length > 0) {
        player.hand.transferTopCard(this.game.deck);
      }
      player.resolved = false;
    })
    while (this.game.dealer.hand.cards.length > 0) {
      this.game.dealer.hand.transferTopCard(this.game.deck);
    }
    this.game.deck.shuffle();
    this.game.deck.cards.forEach(card => {
      card.turnFaceDown();
    })
    this.game.bets = [];
    this.game.sendMessageLogMessages(`[State]: Discarding cards, reshuffling.`);
    // how long to show last hand for?
    // this behavior will leave the final outcome showing
    // UNTIL another socket connects which triggers
    // emit('lastEmittedState'), then EVERYONE's screens blank out cause 
    // of this spread operator below
    this.game.lastEmittedState = {
      ...this.game.lastEmittedState,
      dealerCards: [],
      players: {},
      betAmounts: {},
    }
    this.game.getPlayerChipsInHand();
    this.game.getPlayerBetAmounts();
  }
}

module.exports = resolveState;
