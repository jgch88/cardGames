const Deck = require('../deck.js');
const CardWithTwoSides = require('../card.js');
  // inject rigged deck such that dealer will get blackjack
  const deck = Object.create(Deck);
  deck.createStandardDeck();
  const dealerCard1 = Object.create(CardWithTwoSides);
  const dealerCard2 = Object.create(CardWithTwoSides);
  const playerCard1 = Object.create(CardWithTwoSides);
  const playerCard2 = Object.create(CardWithTwoSides);
  dealerCard1.prepareCard({value: Number(1), suit: "Spades"}, {isFaceDown: true});
  dealerCard2.prepareCard({value: Number(13), suit: "Spades"}, {isFaceDown: true});
  playerCard1.prepareCard({value: Number(5), suit: "Spades"}, {isFaceDown: true});
  playerCard2.prepareCard({value: Number(3), suit: "Spades"}, {isFaceDown: true});
  deck.addCardToTop(dealerCard2);
  deck.addCardToTop(playerCard1);
  deck.addCardToTop(dealerCard1);
  deck.addCardToTop(playerCard2);

module.exports = deck;
