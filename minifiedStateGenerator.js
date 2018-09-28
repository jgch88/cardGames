class MinifiedStateGenerator {
  // sort of an observer

  constructor(game) {
    this.game = game;
  }

  emitState() {

  }

  _getMinifiedState() {
    const currentState = {};
    currentState.chipsInHand = this.game.getPlayerChipsInHand();
    currentState.betAmounts = this.game.getPlayerBetAmounts();
    currentState.insuranceBetAmounts = this.game.getPlayerInsuranceBetAmounts();
    currentState.messages = this.game.messageLog.messages;
    currentState.players = this.game.renderPlayers();
    currentState.dealerCards = this.game.renderDealerCards();
    currentState.gameState = this.game.state.name;
    currentState.bets = this.game.renderBets(); 
    currentState.currentBet = this.game.getCurrentBetId();
    return currentState;
  }

}

module.exports = MinifiedStateGenerator;
