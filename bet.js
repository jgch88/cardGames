const Bet = {
  init({betAmount, player}) {
    if (betAmount > player.chips) {
      throw 'Not enough chips';
    } else {
      player.chips -= betAmount;
      this.betAmount = betAmount;
      this.insurance = false;
      this.player = player;
      this.resolved = false;
    }
  },
  resolve(playerOutcome, multiplier,  dealer) {
    // POV of player
    // depending on whether
    // this player wins/loses/draws
    const betAmount = this.betAmount;
    if (playerOutcome === 'playerWins') {
      this.player.chips += betAmount;
      this.betAmount -= betAmount;

      const winnings = multiplier * betAmount;
      dealer.chips -= winnings;
      this.player.chips += winnings;
      console.log(`[BetResult]: [${this.player.name}] (${this.player.score}) wins [Dealer] (${dealer.shownScore})`)

    } else if (playerOutcome === 'playerDraws') {
      this.player.chips += betAmount;
      this.betAmount -= betAmount;
      console.log(`[BetResult]: [${this.player.name}] (${this.player.score}) draws with [Dealer] (${dealer.shownScore})`)

    } else if (playerOutcome === 'playerLoses') {
      dealer.chips += betAmount;
      this.betAmount -= betAmount;
      console.log(`[BetResult]: [${this.player.name}] (${this.player.score}) loses to [Dealer] (${dealer.shownScore})`)
    } else {
      throw `Couldn't resolve bet`;
    }
    this.resolved = true;
    this.player.displayStatus();
  }
}

module.exports = Bet;
