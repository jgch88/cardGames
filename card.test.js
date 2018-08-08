const CardWithTwoSides = require('./card.js');

test('card shows value when face down', () => {
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 1, suit: "Clubs"});
	expect(card.readFace()).toBe(`Face Down`);
})

test('card shows value when face up', () => {
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: false});
	expect(card.readFace()).toBe(`Ace of Clubs`);
})

test('card faces up and down when flipped', () => {
	const card = Object.create(CardWithTwoSides);
	card.prepareCard({value: 1, suit: "Clubs"});
	card.turnFaceUp();
	expect(card.readFace()).toBe(`Ace of Clubs`);
	card.turnFaceDown();
	expect(card.readFace()).toBe(`Face Down`);
	card.flipCard();
	expect(card.readFace()).toBe(`Ace of Clubs`);
	card.flipCard();
	expect(card.readFace()).toBe(`Face Down`);
})
