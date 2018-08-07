const CardWithTwoSides = require('./card');


// maybe use a doublyLinkedList instead of an Array?
// YAGNI, it's not like n is so huge that we need a dLL
// a deck could be a player hand, the deck to draw from,
// the discard pile, etc. it's more like a "group" of cards
const Deck = {
  init(cardArray = []) {
    // the "top" is the end of the array, "bottom" is the front of the array (at [0])
    this.cards = cardArray;
  },
  showAllCards() {
    this.cards.forEach((card) => {
      console.log(card);
    })
  },
  shuffle: function shuffle() {
    // did this notation because initially wanted recursive
    // hindu shuffle implementation but...
    // simple shuffling machine:
    // take the top card and reinsert it at a random position
    const noOfTimes = Math.random() * 300 + 300;
    for (let count = 0; count < noOfTimes; count++) {
      const topCard = this.cards.pop();
      const randomPosition = Math.floor(Math.random() * (this.cards.length - 2));
      this.cards.splice(randomPosition, 0, topCard);
    };
  },
  addCardToTop(card) {
    this.cards.push(card);
  },
  removeTopCard() {

  },
  addCardToBottom(card) {

  },
  removeBottomCard() {

  },
  addCardToPosition(card) {

  },
  removeCardFromPosition(positionFromBottom) {

  },
  swapCards(firstCardPosition, secondCardPosition) {

  },
  findCardPosition(card) {

  },
  transferTopCard(otherDeck) {
    // api for passing cards between decks
    // needs to be an atomic operation
    const removedCard = this.cards.pop();
    otherDeck.addCardToTop(removedCard);
  },
  createStandardDeck() {
    // destructive method! use with caution!
    this.cards = [];

    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    const values = {
      1: "Ace",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "Jack",
      12: "Queen",
      13: "King"
    };
    for (let suit of suits) {
      for (let value of Object.keys(values)) {
        const card = Object.create(CardWithTwoSides);
        card.prepareCard({value: Number(value), suit}, {isFaceDown: true});
        this.cards.push(card);
      }
    }
    // mutates the deck
  }
}

module.exports = Deck;
