const Deck = require('./deck.js');

test('standard poker deck created', () => {
	const deck = Object.create(Deck);
	deck.init();
	deck.createStandardDeck();

	
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
			expect(deck.cards.filter(card => card.suit === suit && card.value === Number(value)).length).toBe(1);
    }
  }
	expect(deck.cards.length).toBe(52);
	expect(deck.cards.filter(card => card.suit === "Spades").length).toBe(13);
	expect(deck.cards.filter(card => card.suit === "Hearts").length).toBe(13);
	expect(deck.cards.filter(card => card.suit === "Clubs").length).toBe(13);
	expect(deck.cards.filter(card => card.suit === "Diamonds").length).toBe(13);
	for (let i = 1; i < 14; i++) {
		expect(deck.cards.filter(card => card.value === i).length).toBe(4);
	}
})

test('cards are transferred from one deck to another properly', () => {
	const deck = Object.create(Deck);
	deck.init();
	deck.createStandardDeck();

	const hand = Object.create(Deck);
	hand.init();

	deck.transferTopCard(hand);
	expect(deck.cards.length).toBe(51);
	expect(hand.cards.length).toBe(1);
})

test('cards are shuffled', () => {
	// mocking here
	// https://stackoverflow.com/questions/41570273/how-to-test-a-function-that-output-is-random-using-jest
	const mockMath = Object.create(global.Math);
	mockMath.random = () => 0.2;
	global.Math = mockMath;
	//
	const deck = Object.create(Deck);
	deck.init();
	deck.createStandardDeck();
	// deck.showAllCards();
	deck.shuffle();
	// deck.showAllCards();
	expect(deck.cards[51]).toEqual({value: 10, suit: "Hearts", isFaceDown: true});
})

test('deck displays all cards', () => {
	const deck = Object.create(Deck);
	deck.init();
	deck.createStandardDeck();
	let text = ``;
	for (let i = 0; i < 52; i++) {
		text += `Face Down\n`;
	}
	expect(deck.showAllCards()).toBe(text);

})
