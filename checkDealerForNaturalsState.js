const dealerHasBlackjackState = require('./dealerHasBlackjackState.js');
const dealerNoBlackjackState = require('./dealerNoBlackjackState.js');

const checkDealerForNaturalsState = {
  init(game) {
    const greeting = `[State]: Dealing cards. Checking if dealer has natural.`;
    this.game = game;
    this.game.sendMessageLogMessages(greeting);
    this.name = 'checkDealerForNaturalsState';
    // major bug where i didn't consider that we deal cards
    // only to Bets not Players!

    // deal two cards to each person
    // starting from the first player
    this.dealOneToEveryone(game.bets);
    game.bets.forEach((bet) => {
      bet.hand.cards[0].turnFaceUp();
    });
    this.game.dealer.hand.cards[0].turnFaceUp();
    this.dealOneToEveryone(game.bets);
    game.bets.forEach((bet) => {
      bet.hand.cards[1].turnFaceUp();
    });
    game.render();

    this.checkIfDealerHasBlackjack();
    // set current player
    // maybe should put the bet inside the player object later

  },
  // all the following actions shouldn't do anything, since this state immediately moves to next state
  joinGame() {
  },
  leaveGame() {
  },
  changeNickname() {
  },
  placeBet() {
  },
  play() {
  },
  // helper functions
  dealOneToEveryone(bets) {
    // rename to dealOneToEveryBet
    // deal to players before dealer
    bets.forEach(bet => {
      this.game.deck.transferTopCard(bet.hand);
    })
    this.game.deck.transferTopCard(this.game.dealer.hand);

  },
  checkIfDealerHasBlackjack() {
    const dealer = this.game.dealer;
    if ([1, 10, 11, 12, 13].indexOf(dealer.hand.cards[0].value) !== -1) {
      this.game.sendMessageLogMessages(`[Dealer]: Has a 10 card/Ace.`);
      if (dealer.score === 21) {
        dealer.hand.cards[1].turnFaceUp();
        this.game.sendMessageLogMessages(`[Dealer]: Has a Blackjack!`);
        this.game.changeState(dealerHasBlackjackState);
      } else {
        this.game.changeState(dealerNoBlackjackState);
      }
    } else {
      this.game.changeState(dealerNoBlackjackState);
    }
  }
}

module.exports = checkDealerForNaturalsState;
