const Deck = require('../deck.js');
const CardWithTwoSides = require('../card.js');
// inject rigged deck such that dealer will get blackjack
const deck = Object.create(Deck);
deck.createStandardDeck();
const dealerCard1 = Object.create(CardWithTwoSides);
const dealerCard2 = Object.create(CardWithTwoSides);
const dealerCard3 = Object.create(CardWithTwoSides);
const playerCard1 = Object.create(CardWithTwoSides);
const playerCard2 = Object.create(CardWithTwoSides);
const playerCard3 = Object.create(CardWithTwoSides);
dealerCard1.prepareCard({value: Number(6), suit: "Spades"}, {isFaceDown: true});
dealerCard2.prepareCard({value: Number(7), suit: "Spades"}, {isFaceDown: true});
dealerCard3.prepareCard({value: Number(11), suit: "Spades"}, {isFaceDown: true});
playerCard1.prepareCard({value: Number(6), suit: "Hearts"}, {isFaceDown: true});
playerCard2.prepareCard({value: Number(7), suit: "Hearts"}, {isFaceDown: true});
playerCard3.prepareCard({value: Number(5), suit: "Hearts"}, {isFaceDown: true});
deck.addCardToTop(dealerCard3);
deck.addCardToTop(playerCard3);
deck.addCardToTop(dealerCard2);
deck.addCardToTop(playerCard2);
deck.addCardToTop(dealerCard1);
deck.addCardToTop(playerCard1);

module.exports = deck;
