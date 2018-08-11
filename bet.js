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
  }
}

module.exports = Bet;
