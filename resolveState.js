const resolveState = {
  init(game) {
    console.log(`[State]: Resolving remaining bets`);
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
}

module.exports = resolveState;
