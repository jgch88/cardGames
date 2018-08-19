const Bet = require('./bet.js');

const gettingBetsState = {
  init(game) {
    this.game = game;
    this.game.sendMessageLogMessages(`[State]: Getting bets`);
    this.name = 'gettingBetsState';
  },
  joinGame() {
    throw `Betting has started! Join the next round`;
  },
  leaveGame() {
  },
  placeBet(playerName, amount, game) {
    // what's a more elegant way to get the player object?
    const playerArray = game.players.filter(player => player.name === playerName);
    if (playerArray.length === 0) {
      throw `${playerName} not found`;
    }
    const player = playerArray[0];
    // bets filter later in "play" state
    // some people might be spectating
    
    // MAJOR BUG: players can bet more than once...
    
    const bet = Object.create(Bet);
    bet.init({
      betAmount: amount,
      player
    })
    game.bets.push(bet);
    // update new chips after betting
    this.game.getPlayerChipsInHand();
    this.game.sendMessageLogMessages(`[${player.name}]: Bet ${amount} chips`);
    // this.game.bettingPlayers = this.game.bets.map(bet => bet.player);
    const bettingPlayers = this.game.bets.map(bet => bet.player);
    // to preserve the order in which players are "seated" rather than order in which players "bet"
    this.game.bettingPlayers = this.game.players.filter(player => bettingPlayers.indexOf(player) !== -1);
    this.game.getPlayerBetAmounts();
  },
  play() {
    throw `Betting is in progress. Please be patient`;
  }
}

module.exports = gettingBetsState;
