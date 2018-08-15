const gettingPlaysState = {
  init() {
    console.log(`[State]: Waiting for players to play`);
  },
  joinGame() {
  },
  leaveGame() {
  },
  placeBet() {
  },
  play() {
    // there should be a currentPlayer property on the game, only the current player gets to play a move
  }
}

module.exports = gettingPlaysState;
