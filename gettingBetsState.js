const Bet = require('./bet.js');

const gettingBetsState = {
  init() {
    console.log(`[State]: Getting bets`);
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
    
    const bet = Object.create(Bet);
    bet.init({
      betAmount: amount,
      player
    })
    game.bets.push(bet);
    console.log(`[${player.name}]: Bet ${amount} chips`);
  },
  play() {
    throw `Betting is in progress. Please be patient`;
  }
}

module.exports = gettingBetsState;
