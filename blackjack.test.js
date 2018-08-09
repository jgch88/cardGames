const Game = require('./blackjack.js');
const Player = require('./player.js');
const Deck = require('./deck.js');
const CardWithTwoSides = require('./card.js');


test('dealer gets blackjack', () => {
  const player1 = Object.create(Player);
  player1.init("john", 100);
  // const player2 = Object.create(Player);
  // player2.init("jane", 100);

	const dealerCard = Object.create(CardWithTwoSides);
	dealerCard.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: false});
	const dealerCard2 = Object.create(CardWithTwoSides);
	dealerCard2.prepareCard({value: 12, suit: "Clubs"}, {isFaceDown: false});
	const playerCard = Object.create(CardWithTwoSides);
	playerCard.prepareCard({value: 5, suit: "Clubs"}, {isFaceDown: false});
	const playerCard2 = Object.create(CardWithTwoSides);
	playerCard2.prepareCard({value: 11, suit: "Clubs"}, {isFaceDown: false});

  const deck = Object.create(Deck);
  deck.init();
  deck.addCardToTop(playerCard);
  deck.addCardToTop(dealerCard);
  deck.addCardToTop(playerCard2);
  deck.addCardToTop(dealerCard2);
  console.log(deck.cards);
  const game = Object.create(Game);
  game.init(deck);
  game.playerJoin(player1);
  game.playGame();
  console.log(game.players);
})

// test cases (2 player):
// 1. player gets blackjack, dealer doesn't
// 2. both get blackjack
// gameplay:
// 3. neither get blackjack, can "stand/hit"

