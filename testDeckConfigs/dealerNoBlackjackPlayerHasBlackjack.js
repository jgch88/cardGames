const Deck = require('../deck.js');
const CardWithTwoSides = require('../card.js');

const deck = Object.create(Deck);
deck.createStandardDeck();
const dealerCard1 = Object.create(CardWithTwoSides);
const dealerCard2 = Object.create(CardWithTwoSides);
const playerCard1 = Object.create(CardWithTwoSides);
const playerCard2 = Object.create(CardWithTwoSides);
dealerCard1.prepareCard({value: Number(10), suit: "Spades"}, {isFaceDown: true});
dealerCard2.prepareCard({value: Number(7), suit: "Spades"}, {isFaceDown: true});
playerCard1.prepareCard({value: Number(1), suit: "Hearts"}, {isFaceDown: true});
playerCard2.prepareCard({value: Number(13), suit: "Hearts"}, {isFaceDown: true});
deck.addCardToTop(dealerCard2);
deck.addCardToTop(playerCard1);
deck.addCardToTop(dealerCard1);
deck.addCardToTop(playerCard2);

module.exports = deck;
