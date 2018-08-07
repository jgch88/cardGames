const BlackjackHand = require('./blackjackHand.js');
const CardWithTwoSides = require('./card.js');

beforeEach(() => {
})

test('calculates ace and jack to equal 21', () => {
	const hand = Object.create(BlackjackHand);
	hand.init();
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: true});
	const card2 = Object.create(CardWithTwoSides);
	card2.prepareCard({value: 11, suit: "Clubs"}, {isFaceDown: true});
	hand.addCardToTop(card);
	hand.addCardToTop(card2);
	expect(hand.calcHandValue()).toBe(21);
});

test('calculates queen and ace to equal 21', () => {
	const hand = Object.create(BlackjackHand);
	hand.init();
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 12, suit: "Clubs"}, {isFaceDown: true});
	const card2 = Object.create(CardWithTwoSides);
	card2.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: true});
	hand.addCardToTop(card);
	hand.addCardToTop(card2);
	expect(hand.calcHandValue()).toBe(21);
});

test('calculates 4 aces to equal 14', () => {
	const hand = Object.create(BlackjackHand);
	hand.init();
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: true});
	const card2 = Object.create(CardWithTwoSides);
	card2.prepareCard({value: 1, suit: "Hearts"}, {isFaceDown: true});
	const card3 = Object.create(CardWithTwoSides);
	card3.prepareCard({value: 1, suit: "Spades"}, {isFaceDown: true});
	const card4 = Object.create(CardWithTwoSides);
	card4.prepareCard({value: 1, suit: "Diamonds"}, {isFaceDown: true});
	hand.addCardToTop(card);
	hand.addCardToTop(card2);
	hand.addCardToTop(card3);
	hand.addCardToTop(card4);
	expect(hand.calcHandValue()).toBe(14);
});

test('calculates three sevens to equal 21', () => {
	const hand = Object.create(BlackjackHand);
	hand.init();
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 7, suit: "Clubs"}, {isFaceDown: true});
	const card2 = Object.create(CardWithTwoSides);
	card2.prepareCard({value: 7, suit: "Hearts"}, {isFaceDown: true});
	const card3 = Object.create(CardWithTwoSides);
	card3.prepareCard({value: 7, suit: "Spades"}, {isFaceDown: true});
	hand.addCardToTop(card);
	hand.addCardToTop(card2);
	hand.addCardToTop(card3);
	expect(hand.calcHandValue()).toBe(21);
})

test('calculates ace and nine to equal 20', () => {
	const hand = Object.create(BlackjackHand);
	hand.init();
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: true});
	const card2 = Object.create(CardWithTwoSides);
	card2.prepareCard({value: 9, suit: "Hearts"}, {isFaceDown: true});
	hand.addCardToTop(card);
	hand.addCardToTop(card2);
	expect(hand.calcHandValue()).toBe(20);
})

test('calculates six, five and ace to equal 12', () => {
	const hand = Object.create(BlackjackHand);
	hand.init();
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 6, suit: "Clubs"}, {isFaceDown: true});
	const card2 = Object.create(CardWithTwoSides);
	card2.prepareCard({value: 5, suit: "Hearts"}, {isFaceDown: true});
	const card3 = Object.create(CardWithTwoSides);
	card3.prepareCard({value: 1, suit: "Spades"}, {isFaceDown: true});
	hand.addCardToTop(card);
	hand.addCardToTop(card2);
	hand.addCardToTop(card3);
	expect(hand.calcHandValue()).toBe(12);
})
