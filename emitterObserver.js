class emitterObserver {
  // Responsibility: Observe game state changes, and emit the state changes via io
  constructor(game) {
    this.game = game;
    this.game.registerObserver(this);
  }

  update(minifiedState) {
    this.game.io.to(this.game.roomName).emit('currentState', minifiedState);
  }
}

module.exports = emitterObserver;
