const Deck = require('./deck.js');
const BlackjackHand = require('./blackjackHand.js');
const deck = Object.create(Deck);
deck.createStandardDeck();
deck.shuffle();
console.log(deck);
// not really sure what a game engine was for, so 
// tried to just build the game right here instead
// of trying to abstract so much


// there's probably some kind of turn based state
// we need to maintain via the event loop in JS

// Rules: www.bicyclecards.com/how-to-play/blackjack

// actors: dealer, player
// cards: standard 52 card pack (or 6 packs of 312 cards)
// goal: get as high, as close to 21 as possible without going over 21
//  highest hand of the round wins
// values: ace: 1 / 11, face cards are 10, other cards are pip values
// bet: min/max bet, generally $2 - $500
// phases:
//  1. shuffle/cut. place "plastic insert" to mark next shuffle (which occurs after the current round)
//  2. deal: all players get a card, face up, clockwise, followed by dealer, face up. then all players
//  get a second card, face up. dealer's second card is face down.
//  3. if dealer has a "natural" 21 (e.g. ace+10): he immediately collects everyone's bets except those who have a "natural" 21
//  who stand off. else dealer has to pay 1.5x bet to players with a "natural" 21 if dealer doesn't have 21.
//  4. players play: stand or hit
//  5. dealers play: follow algorithm for < 17 
//  (omit splits/doubling down/insurance

// players: an array. 0 is dealer, 1 is next clockwise position. minimum of 2 players including dealer (who must always be present)
// decks: main deck, each player's hand
// bets: every player places a bet
// chips: every player has some money to bet (dealer has infinite?)
// gameState: automate steps 1-3, then current player's turn

// TODO -> export the Deck delegation constructor object in deck.js
// Object.create standard deck in this file instead of deck.js
const player = {
  init(chips) {
    this.chips = chips;
    const hand = Object.create(BlackjackHand);
    hand.init();
    this.hand = hand; // a deck and its api
  },
  play(option) {
    // an api to "tell" the game whether player stands/hits
    // or some modular method to have different AIs
    // aggressive better, safe better, always burst
  },
  disconnect() {
    // in event of player just leaving abruptly
    // he loses his bet
  }
}

// factory method later
const player1 = Object.create(player);
player1.init(100);
const player2 = Object.create(player);
player2.init(100);

const players = [player1, player2];

function initGame(players, deck) {
  // deck should be an array -> player can
  // possibly have more than one deck (splits)
  const table = {
    players,
    deck
  };
  return table;
}

const table = initGame([player1, player2], deck);

// this is very procedural, refactor to make it
// a "blackjack game" with methods
function playGame(table) {
  table.deck.shuffle();
  // table.deck.showAllCards();
  // table.deck.cut(position);
  // table.deck.insertCard(blankPlasticCard,position);
  let roundEnded = false;
  dealOneToEveryone(table.deck, table.players);
  checkForNaturals(table.players);
  // checkForSplits();
  // checkForDoubleDowns();
  do {
    eachPlayerPlays();
  } while (!roundEnded);
  
}
playGame(table);

function dealOneToEveryone(deck, players) {

  players.forEach(function(player) {
    // player.hand foreach? splits
    // or use Array.map?
    deck.transferTopCard(player.hand)
  })
}

function checkForNaturals(players) {
  
  players.forEach((player) => {
    if (player.hand.calcValue() === 21) {
      return true
    }
  })

  // if dealer is natural, set roundEnded to true
}

function eachPlayerPlays() {

}

// compose "deck" object with "blackjackHand" to let it
// have a player.hand.calcValue() method
//
