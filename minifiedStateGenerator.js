class MinifiedStateGenerator {
  // sort of an observer

  constructor(game) {
    this.game = game;
  }

  _getMinifiedState() {
    const currentState = {};
    currentState.chipsInHand = this.game.getPlayerChipsInHand();
    currentState.betAmounts = this.game.getPlayerBetAmounts();
    currentState.insuranceBetAmounts = this.getPlayerInsuranceBetAmounts();
    currentState.messages = this.game.messageLog.messages;
    currentState.players = this.renderPlayers();
    currentState.dealerCards = this.renderDealerCards();
    currentState.gameState = this.game.state.name;
    currentState.bets = this.renderBets(); 
    currentState.currentBet = this.getCurrentBetId();
    return currentState;
  }

  getCurrentBetId() {
    return this.game.currentBet ? this.game.currentBet.id : '';

  }

  renderBets() {
    // state => bets: { idno: cards, player.nickname }
    const bets = {};

    this.game.bets.forEach((bet) => {
      bets[bet.id] = {
        betAmount: bet.betAmount,
        cards: [],
        nickname: bet.player.nickname
      };
      bet.hand.cards.forEach((card) => {
        bets[bet.id].cards.push(card);
      });
    });

    return bets;
  }

  renderPlayers() {
    const players = {};
    this.game.players.forEach((player) => {
      players[player.name] = {
        nickname: player.nickname
      }
    });
    return players;
  }

  renderDealerCards() {
    const blankCard = {
      value: 0,
      suit: "-",
      isFaceDown: true,
    };
    const dealerCards = [];
    this.game.dealer.hand.cards.forEach(card => {
      if (card.isFaceDown) {
        dealerCards.push(blankCard);
      } else {
        dealerCards.push(card);
      }
    });
    return dealerCards;
  }

  getPlayerInsuranceBetAmounts() {
    let insuranceBetAmounts = {};
    this.game.insuranceBets.map(insuranceBet => {
      if (insuranceBet.promiseIsResolved) {
        insuranceBetAmounts[insuranceBet.player.name] = insuranceBet.amount;
      }
    });
    return insuranceBetAmounts;
  }
}

module.exports = MinifiedStateGenerator;
