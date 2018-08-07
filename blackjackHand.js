const Deck = require('./deck.js');


const BlackjackHand = Object.create(Deck);
BlackjackHand.countAces = function() {
	let aces = this.cards.filter(card => card.value === 1);
	return aces.length;
}
BlackjackHand.calcHandValue = function() {
  // American rules: double ace ISN'T 21!!
	let sum = 0;
	let aceCount = this.countAces();
	let cardValues = this.cards.map(card => card.value);
	cardValues = cardValues.map(value =>(value > 10) ? 10 : value);

  sum = cardValues.reduce((acc, curr) => acc + curr);
	sum += aceCount * 10;
	
	while (sum > 21 && aceCount > 0) {
		sum -= 10;
		aceCount -= 1;
	}
  return sum;
}

// value computation
// if [Ace, (10 || J || Q || K)] == 21
// if [Ace, !(10 || J || Q || K)], Ace is 10 or 1 depending on which maximises value WITHOUT going above 21
// else sum all cards;
// calls for a greedy algorithm.
// *** Greedy Algorithm
// Have a counter for number of Aces. Add 1 to counter for each Ace present.
// Calculate score = sum of all card values
// Add 10 to score for each Ace present.
// While score > 21, decrease score by 10, decrease ace counter by 1
// return score
// ***

// can we do a function that can always calculate the value correctly? functional programming?
// Test Cases
// calcValue([1, 11]) == 21
// calcValue([11, 1]) == 21
// calcValue([1, 1, 1, 1]) == 14
// calcValue([5, 5]) = 10
// calcValue([1, 9]) == 20
// calcValue([6, 5, 1]) == 12

module.exports = BlackjackHand;
