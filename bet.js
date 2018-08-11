const Bet = {
  init({betAmount, player}) {
    if (betAmount > player.chips) {
      throw 'Not enough chips';
    } else {
      player.chips -= betAmount;
      this.betAmount = betAmount;
      this.insurance = false;
      this.player = player;
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

    } else if (playerOutcome === 'playerDraws') {
      this.player.chips += betAmount;
      this.betAmount -= betAmount;

    } else if (playerOutcome === 'playerLoses') {
      dealer.chips += betAmount;
      this.betAmount -= betAmount;
    } else {
      throw `Couldn't resolve bet`;
    }
  }
}

module.exports = Bet;
