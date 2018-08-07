const Deck = require('./deck.js');
const BlackjackHand = require('./blackjackHand.js');

const Player = {
  init(name, chips) {
    this.name = name;
    this.chips = chips;
    const hand = Object.create(BlackjackHand);
    hand.init();
    this.hand = hand; // a deck and its api, use array for splits later on 
  },
  play(option) {
    // an api to "tell" the game whether player stands/hits
    // or some modular method to have different AIs
    // aggressive better, safe better, always burst
  },
  disconnect() {
    // in event of player just leaving abruptly
    // he loses his bet
  },
  get score() {
    return this.hand.calcHandValue();
  }
}

module.exports = Player;
