const Deck = require('../deck.js');
const CardWithTwoSides = require('../card.js');
// inject rigged deck such that dealer will get blackjack

const deck = Object.create(Deck);
deck.createStandardDeck();
const dealerCard1 = Object.create(CardWithTwoSides);
const dealerCard2 = Object.create(CardWithTwoSides);
const playerCard1 = Object.create(CardWithTwoSides);
const playerCard2 = Object.create(CardWithTwoSides);
dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
dealerCard2.prepareCard({value: Number(8), suit: "Spades"}, {isFaceDown: true});
playerCard1.prepareCard({value: Number(6), suit: "Hearts"}, {isFaceDown: true});
playerCard2.prepareCard({value: Number(6), suit: "Diamonds"}, {isFaceDown: true});
deck.addCardToTop(dealerCard2);
deck.addCardToTop(playerCard2);
deck.addCardToTop(dealerCard1);
deck.addCardToTop(playerCard1);

module.exports = deck;
