const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const checkDealerForNaturals = require('./checkDealerForNaturals.js');
const MessageLog = require('./messageLog.js');
// make it such that Game has methods -> which are spammable,
// but methods are only allowable in certain states (state pattern)
// e.g. can't do getPlayers() before init();
// can't collectBets() before getPlayers()
// Async "gates", or promise.all() ... for every player to place a bet
// before we "start". Can use the pogo timer method where
// once a game is created, you have 60 seconds to join the game
// before no more new players can join.

// State Pattern: Allow an object (game) to alter its behavior
// when its internal state changes. The object will appear to change its class...

// states:
// gettingPlayersState
// gettingBetsState
//  gettingInsuranceState
// gettingPlaysState
// resolveState
//

const GameState = {
  // do i really need this to encapsulate
  // the state subclasses?
}

const Game = {
  init() {
    const deck = Object.create(Deck);
    deck.init();
    deck.createStandardDeck();
    deck.shuffle();
    this.deck = deck;

		const dealer = Object.create(Player);
		dealer.init("Dealer", 10000);
    this.dealer = dealer;
    this.players = [];
    this.bettingPlayers;

    this.bets = [];

    // to attach the server's socket.io 
    // for broadcasting
    this.io;

    this.currentPlayer = null;

    console.log(`Game initialised`);
    
    this.state = Object.create(gettingPlayersState);
    this.state.init();

    const messageLog = Object.create(MessageLog);
    messageLog.init(4)
    this.messageLog = messageLog;
    messageLog.addMessage(`Game initialised`);
    // console.log(this);
  },
  changeState(newState) {
    console.log(`Changing state`);
    this.state = Object.create(newState);
    this.state.init(this);
  },
  // gettingPlayers
  joinGame(playerName, chips) {
    try {
      this.state.joinGame(playerName, chips, this);
      this.io.emit('playerJoined', {playerName});
    } catch(e) {
      console.log(`[Error]: ${e}`);
    }
  },
  leaveGame(playerName) {
    try {
      this.state.leaveGame(playerName, this);
    } catch(e) {
      console.log(`[Error]: ${e}`);
    }
  },
  // gettingBets
  placeBet(playerName, amount) {
    try {
      this.state.placeBet(playerName, amount, this);
    } catch(e) {
      console.log(`[Error]: ${e}`);
    }
  },
  // gettingPlays
  play(playerName, move) {
    // moves: "hit" or "stand"
    try {
      this.state.play(playerName, move, this);
    } catch(e) {
      console.log(`[Error]: ${e}`);
    }
  },
  // helper methods
  render() {
    // show the status of the game.
    console.log(`******`)
    console.log(`Dealer`);
    this.dealer.hand.cards.forEach(card => {
      console.log(`   ${card.readFace()}`);
    });
    this.bettingPlayers.forEach((player) => {
      console.log(`${player.name}`);
      player.hand.cards.forEach((card) => {
        console.log(`   ${card.readFace()}`);
      })
    });
    console.log(`******`);

    this.io.emit('render', this.renderState());
  },
  addSocket(socket) {
    this.io = socket;
  },
  renderState() {
    // generate front facing "state"
    const blankCard = {
      value: 0,
      suit: "-",
      isFaceDown: true,
    };

    const renderedState = {};

    renderedState.dealerCards = [];
    this.dealer.hand.cards.forEach(card => {
      if (card.isFaceDown) {
        renderedState.dealerCards.push(blankCard);
      } else {
        renderedState.dealerCards.push(card);
      }
    });

    renderedState.players = {};
    this.bettingPlayers.forEach((player) => {
      // shouldn't expose player.name though, probably use positionIds or something
      renderedState.players[player.name] = [];
      player.hand.cards.forEach((card) => {
        renderedState.players[player.name].push(card);
      });
    });

    renderedState.messages = this.messageLog.messages;

    return renderedState;
  },
}

/*
  
// test cases via simulation
// use routes via server to handle the listening of these
// moves
const game = Object.create(Game);
game.init();
game.joinGame('John', 100);
game.joinGame('Jane', 100);
game.joinGame('John', 100); // player name in use
game.joinGame('Jaz', 100);
game.placeBet('John', 50); // can't bet during this stage
game.play('John', 'stand'); // can't play during this stage
game.joinGame('Jae', 0); // not enough chips
game.joinGame('Jae', 1000); // spectator, who sits at table but doesn't bet

game.changeState(gettingBetsState);
game.joinGame('Jane', 100); // invalid, can't join (request ignored);
game.placeBet('John', 50);
game.placeBet('Jaz', 5);
game.placeBet('Jon', 50); // player not found
game.placeBet('Jane', 500); // not enough chips
game.placeBet('Jane', 50);

game.changeState(checkDealerForNaturals);
game.play('Jaz', 'stand'); // not Jaz's turn
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit'); // intentionally want John to burst

game.play('Jane', 'stand'); 
game.play('Jaz', 'stand');
// there's an error where the player array order is differnt from the bet order...
// fixed it in gettingPlaysState.js

*/

module.exports = Game;

