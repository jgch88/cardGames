const Deck = require('./deck.js');


const BlackjackHand = Object.create(Deck);
BlackjackHand.calcHandValue = function() {
  // American rules: double ace ISN'T 21!!
  const sum = this.cards.reduce((acc, curr) => acc.value + curr.value);
  return sum;
}

// value computation
// if [Ace, (10 || J || Q || K)] == 21
// if [Ace, !(10 || J || Q || K)], Ace is 10 or 1 depending on which maximises value WITHOUT going above 21
// else sum all cards;

// can we do a function that can always calculate the value correctly? functional programming?
// Test Cases
// calcValue([1, 11]) == 21
// calcValue([11, 1]) == 21
// calcValue([1, 1, 1, 1]) == 14
// calcValue([5, 5]) = 10
// calcValue([1, 9]) == 20
// calcValue([6, 5, 1]) == 12

module.exports = BlackjackHand;
