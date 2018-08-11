const Deck = require('./deck.js');
const BlackjackHand = require('./blackjackHand.js');

const Player = {
  init(name, chips) {
    this.name = name;
    this.chips = chips;
    const hand = Object.create(BlackjackHand);
    hand.init();
    this.hand = hand; // a deck and its api, use array for splits later on 
    this.hasBlackJack = false;
    this.resolved = false;
  },
  play(option) {
    // an api to "tell" the game whether player stands/hits
    // or some modular method to have different AIs
    // aggressive better, safe better, always burst
		//
		// dealer AI:  if hand < 17, draw card.
		//
		// player options:
		// hit, stand, (doubledown,split,surrender,insurance)
  },
  disconnect() {
    // in event of player just leaving abruptly
    // he loses his bet
  },
  get score() {
    return this.hand.calcHandValue();
  },
  hasNatural() {
    this.hasBlackJack = true;
  },
  resolve() {
    // compare against dealer
    this.resolved = true;
  },
  displayStatus() {
    console.log(`[${this.name}] Chips remaining: ${this.chips}`);
  }
}

module.exports = Player;
