const Deck = require('../deck.js');
const CardWithTwoSides = require('../card.js');
// inject rigged deck such that dealer will get blackjack
const deck = Object.create(Deck);
deck.createStandardDeck();
const dealerCard1 = Object.create(CardWithTwoSides);
const dealerCard2 = Object.create(CardWithTwoSides);
const player1Card1 = Object.create(CardWithTwoSides);
const player1Card2 = Object.create(CardWithTwoSides);
const player2Card1 = Object.create(CardWithTwoSides);
const player2Card2 = Object.create(CardWithTwoSides);
dealerCard1.prepareCard({value: Number(1), suit: "Spades"}, {isFaceDown: true});
dealerCard2.prepareCard({value: Number(13), suit: "Spades"}, {isFaceDown: true});
player1Card1.prepareCard({value: Number(5), suit: "Spades"}, {isFaceDown: true});
player1Card2.prepareCard({value: Number(3), suit: "Spades"}, {isFaceDown: true});
player2Card1.prepareCard({value: Number(5), suit: "Hearts"}, {isFaceDown: true});
player2Card2.prepareCard({value: Number(3), suit: "Hearts"}, {isFaceDown: true});
deck.addCardToTop(dealerCard2);
deck.addCardToTop(player2Card2);
deck.addCardToTop(player1Card2);
deck.addCardToTop(dealerCard1);
deck.addCardToTop(player2Card1);
deck.addCardToTop(player1Card1);

module.exports = deck;
