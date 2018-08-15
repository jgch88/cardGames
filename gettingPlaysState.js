const gettingPlaysState = {
  init() {
    console.log(`[State]: Waiting for players to play`);
    // deal one to everyone x2
    // set the currentPlayer
  },
  joinGame() {
    throw `Game has already started. Please join the next round`;
  },
  leaveGame() {
  },
  placeBet() {
    throw `Game has already started. Please join the next round`;
  },
  play(playerName, move, game) {
    // there should be a currentPlayer property on the game, only the current player gets to play a move
    if (game.currentPlayer === playerName) {
      console.log(`[${playerName}]: '${move}'`);

    } else {
      throw `It is not your turn!`;
    }
  }
}

module.exports = gettingPlaysState;
