const gettingPlayersState = require('./gettingPlayersState.js');

const resolveState = {
  init(game) {
    console.log(`[State]: Resolving remaining bets`);
    this.name = 'resolveState';
    this.game = game;
    const dealer = this.game.dealer;
    dealer.hand.cards.forEach(card => {
      card.turnFaceUp();
    });
    console.log(`[Dealer]: Revealing face down card!`);
    this.game.render();
    const remainingBets = this.game.bets.filter(bet => !bet.resolved);
    if (remainingBets.length > 0) {
      this.dealerPlays();
    }
    remainingBets.forEach(bet => {
      this.resolveBet(bet);
    });
    console.log(`[State]: All bets resolved! Round over.`);

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
      console.log(`[Dealer]: 'hit'`);
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
        bet.resolve('playerDraws', 1, dealer);
      } else {
        bet.resolve('playerWins', 1, dealer);
      }
      return;
    }
    if (player.score > 21) {
      bet.resolve('playerLoses', 1, dealer);
      return;
    }
    if (dealer.score > player.score) {
      bet.resolve('playerLoses', 1, dealer);
    } else if (dealer.score === player.score) {
      bet.resolve('playerDraws', 1, dealer);
    } else {
      bet.resolve('playerWins', 1, dealer);
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
    console.log(`[State]: Discarding cards, reshuffling.`);
  }
}

module.exports = resolveState;
