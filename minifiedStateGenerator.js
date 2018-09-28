class MinifiedStateGenerator {
  // sort of an observer

  constructor(game) {
    this.game = game;
  }

  emitState() {

  }

  /*
  render() {
    // show the status of the game.
    console.log(`******`)
    console.log(`Dealer`);
    this.game.dealer.hand.cards.forEach(card => {
      console.log(`   ${card.readFace()}`);
    });
    this.game.bets.forEach((bet) => {
      console.log(`${bet.player.name}`);
      bet.hand.cards.forEach((card) => {
        console.log(`   ${card.readFace()}`);
      })
    });
    console.log(`******`);

    // this.io.to(this.roomName).emit('render', this.renderCards());
    this.game.emitCurrentState();

  }
  */

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
