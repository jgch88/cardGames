// bet knows too much about player
// it's the player's responsibility
// to check if chips are enough
const Bet = {
  init(betAmount, player) {
    this.betAmount = betAmount;
    this.insurance = false;
    this.player = player;
    this.resolved = false;
  },
  resolve(playerOutcome, multiplier,  dealer) {
    // POV of player
    // depending on whether
    // this player wins/loses/draws
    const betAmount = this.betAmount;
    this.resolved = true;
    if (playerOutcome === 'playerWins') {
      this.player.chips += betAmount;
      this.betAmount -= betAmount;

      const winnings = multiplier * betAmount;
      dealer.chips -= winnings;
      this.player.chips += winnings;
      this.player.displayStatus();
      return `[BetResult]: [${this.player.nickname}] (${this.player.score}) wins [Dealer] (${dealer.shownScore})`;

    } else if (playerOutcome === 'playerDraws') {
      this.player.chips += betAmount;
      this.betAmount -= betAmount;
      this.player.displayStatus();
      return `[BetResult]: [${this.player.nickname}] (${this.player.score}) draws with [Dealer] (${dealer.shownScore})`;

    } else if (playerOutcome === 'playerLoses') {
      dealer.chips += betAmount;
      this.betAmount -= betAmount;
      this.player.displayStatus();
      return `[BetResult]: [${this.player.nickname}] (${this.player.score}) loses to [Dealer] (${dealer.shownScore})`;
    } else {
      throw `Couldn't resolve bet`;
    }
  }
}

module.exports = Bet;
