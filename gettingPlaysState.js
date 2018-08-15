const dealerHasBlackjackState = require('./dealerHasBlackjackState.js');
const dealerNoBlackjackState = require('./dealerNoBlackjackState.js');

const gettingPlaysState = {
  init(game) {
    console.log(`[State]: Dealing cards. Checking if dealer has natural.`);
    this.game = game;

    // deal two cards to each person
    // starting from the first player
    this.dealOneToEveryone(game.players);
    game.players.forEach((player) => {
      player.hand.cards[0].turnFaceUp();
    });
    this.dealOneToEveryone(game.players);
    game.players.slice(1).forEach((player) => {
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
      console.log(`[${playerName}]: '${move}'`);

    } else {
      throw `It is not ${playerName}'s turn!`;
    }
  },
  // helper functions
  dealOneToEveryone(players) {
    // deal to players before dealer
    players.slice(1).forEach(player => {
      this.game.deck.transferTopCard(player.hand);
    })
    this.game.deck.transferTopCard(players[0].hand);

  },
  checkIfDealerHasBlackjack() {
    const dealer = this.game.players[0];
    if ([1, 10, 11, 12, 13].indexOf(dealer.hand.cards[0].value) !== -1) {
      console.log(`[Dealer]: Has a 10 card/Ace.`);
      if (dealer.score === 21) {
        dealer.hand.cards[1].turnFaceUp();
        dealer.hasNatural();
        console.log(`[Dealer]: Has a Blackjack!`);
        this.game.changeState(dealerHasBlackjackState);
      } else {
        this.game.changeState(dealerNoBlackjackState);
      }
    } else {
      this.game.changeState(dealerNoBlackjackState);
    }
  }
}

module.exports = gettingPlaysState;
