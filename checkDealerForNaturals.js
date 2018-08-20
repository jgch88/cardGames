const dealerHasBlackjackState = require('./dealerHasBlackjackState.js');
const dealerNoBlackjackState = require('./dealerNoBlackjackState.js');

const checkDealerForNaturals = {
  init(game) {
    const greeting = `[State]: Dealing cards. Checking if dealer has natural.`;
    this.game = game;
    this.game.sendMessageLogMessages(greeting);
    this.name = 'checkDealerForNaturals';
    // major bug where i didn't consider that we deal cards
    // only to Bets not Players!

    // deal two cards to each person
    // starting from the first player
    this.dealOneToEveryone(game.bettingPlayers);
    game.bettingPlayers.forEach((player) => {
      player.hand.cards[0].turnFaceUp();
    });
    this.game.dealer.hand.cards[0].turnFaceUp();
    this.dealOneToEveryone(game.bettingPlayers);
    game.bettingPlayers.forEach((player) => {
      player.hand.cards[1].turnFaceUp();
    });
    game.render();

    this.checkIfDealerHasBlackjack();
    // set current player
    // maybe should put the bet inside the player object later

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
      this.game.sendMessageLogMessages(`[${playerName}]: '${move}'`);

    } else {
      throw `It is not ${playerName}'s turn!`;
    }
  },
  // helper functions
  dealOneToEveryone(players) {
    // deal to players before dealer
    players.forEach(player => {
      this.game.deck.transferTopCard(player.hand);
    })
    this.game.deck.transferTopCard(this.game.dealer.hand);

  },
  checkIfDealerHasBlackjack() {
    const dealer = this.game.dealer;
    if ([1, 10, 11, 12, 13].indexOf(dealer.hand.cards[0].value) !== -1) {
      this.game.sendMessageLogMessages(`[Dealer]: Has a 10 card/Ace.`);
      if (dealer.score === 21) {
        dealer.hand.cards[1].turnFaceUp();
        dealer.hasNatural();
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

module.exports = checkDealerForNaturals;
