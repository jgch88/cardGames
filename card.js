// modelling what a card is

// modify this if you want to add special cards
const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
// value here refers to the typical order of a deck (not value as in 1/10/11 in blackjack for an Ace)
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
}


// basic card 'Value' and 'Suit'
// text based, may have picture for HTML?
const Card = {
  init({value, suit}) {
    this.value = value;
    this.suit = suit;
  },
  identify() {
    return `${values[this.value]} of ${this.suit}`;
  }
}
/*
const twoOfHearts = Object.create(Card);
twoOfHearts.init({value: 2, suit: "Hearts"});
console.log(twoOfHearts.identify());
*/

// this allows a card to have a 'Face Up' and 'Face Down' state
const CardWithTwoSides = Object.create(Card);
CardWithTwoSides.prepareCard = function({value, suit}, {isFaceDown}) {
  this.init({value, suit});
  this.isFaceDown = isFaceDown;
}
CardWithTwoSides.turnFaceDown = function() {
  this.isFaceDown = true;
}
CardWithTwoSides.turnFaceUp = function() {
  this.isFaceDown = false;
}
CardWithTwoSides.readFace = function() {
  if (this.isFaceDown) {
    return `Face Down`;
  } else {
    return this.identify();
  }
}
CardWithTwoSides.flipCard = function() {
  this.isFaceDown = !this.isFaceDown;
}

/*
const aceOfSpades = Object.create(CardWithTwoSides);
aceOfSpades.prepareCard({value: 1, suit: "Spades"}, {isFaceDown: true});
console.log(aceOfSpades.readFace(), aceOfSpades.isFaceDown);
aceOfSpades.flipCard();
console.log(aceOfSpades.readFace(), aceOfSpades.isFaceDown);
*/

module.exports = CardWithTwoSides;
