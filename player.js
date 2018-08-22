const Deck = require('./deck.js');
const BlackjackHand = require('./blackjackHand.js');

const Player = {
  init(name, chips) {
    this.name = name;
    this.chips = chips;
    const hand = Object.create(BlackjackHand);
    hand.init();
    this.hand = hand; // a deck and its api, use array for splits later on 
    this.resolved = false;
  },
  disconnect() {
    // in event of player just leaving abruptly
    // he loses his bet
  },
  get score() {
    return this.hand.calcHandValue();
  },
  get shownScore() {
    // score of face up cards only
    // so that dealer's other card isn't exposed when player bursts
    return this.hand.calcShownHandValue();
  },
  resolve() {
    // has compared against dealer
    this.resolved = true;
  },
  displayStatus() {
    console.log(`[${this.name}]: Current Chips: ${this.chips}`);
  }
}

module.exports = Player;
