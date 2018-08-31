// bet knows too much about player
const BlackjackHand = require('./blackjackHand.js');
// it's the player's responsibility
// to check if chips are enough
const Bet = {
  init(betAmount, player) {
    this.id = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    this.betAmount = betAmount;
    this.insurance = false;
    this.player = player;
    this.resolved = false;
    const cards = Object.create(BlackjackHand);
    cards.init();
    this.cards = cards;
    this.stand = false;
  },
  get score() {
    return this.cards.calcHandValue();
  },
  resolve(playerOutcome, multiplier,  dealer) {
    // POV of player
    // depending on whether
    // this player wins/loses/draws
    const betAmount = this.betAmount;
    if (this.resolved) {
      throw `Bet is already resolved!`;
    }
    this.resolved = true;
    // this bet is "holding" the amount temporarily
    if (playerOutcome === 'playerWins') {
      // return player the bet
      this.player.chips += betAmount;
      this.betAmount -= betAmount;

      // dealer pays out with multiplier
      const winnings = multiplier * betAmount;
      dealer.chips -= winnings;
      this.player.chips += winnings;
      this.player.displayStatus();
      return `[BetResult]: [${this.player.nickname}] (${this.score}) wins [Dealer] (${dealer.shownScore})`;

    } else if (playerOutcome === 'playerDraws') {
      // return player bet
      this.player.chips += betAmount;
      this.betAmount -= betAmount;
      this.player.displayStatus();
      return `[BetResult]: [${this.player.nickname}] (${this.score}) draws with [Dealer] (${dealer.shownScore})`;

    } else if (playerOutcome === 'playerLoses') {
      // player's bet goes to the dealer
      dealer.chips += betAmount;
      this.betAmount -= betAmount;
      this.player.displayStatus();
      return `[BetResult]: [${this.player.nickname}] (${this.score}) loses to [Dealer] (${dealer.shownScore})`;
    } else {
      throw `Couldn't resolve bet`;
    }
  }
}

module.exports = Bet;
