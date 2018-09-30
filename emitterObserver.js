class emitterObserver {
  // Responsibility: Observe game state changes, and emit the state changes via io
  constructor(gameState) {
    this.gameState = gameState;
    this.gameState.registerObserver(this);
  }

  update(minifiedState) {
    this.gameState.io.to(this.gameState.roomName).emit('currentState', minifiedState);
  }
}

module.exports = emitterObserver;
