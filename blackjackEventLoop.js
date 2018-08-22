const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const MessageLog = require('./messageLog.js');

const Game = {
  init(socket) {
    const deck = Object.create(Deck);
    deck.init();
    deck.createStandardDeck();
    deck.shuffle();
    this.deck = deck;

		const dealer = Object.create(Player);
		dealer.init("Dealer", 10000);
    this.dealer = dealer; // separated from players because dealer doesn't bet, and i had to kept slicing the player array to find the dealer
    this.players = []; // array instead of object because order is preserved and access to map/filter/find
    this.bettingPlayers = [];

    this.bets = [];

    // inject the server's socket
    // so the game has access to broadcast events
    this.io = socket;

    this.currentPlayer = null;

    const messageLog = Object.create(MessageLog);
    messageLog.init(12) // 4 messages
    this.messageLog = messageLog;
    this.sendMessageLogMessages(`Game initialised`);

    this.state = Object.create(gettingPlayersState);
    this.state.init(this);

  },
  changeState(newState) {
    console.log(`Changing state`);
    this.state = Object.create(newState);
    this.state.init(this);
    this.sendGameState(this.state.name);
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
  /*
  addSocket(socket) {
    this.io = socket;
  },
  */
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

    // rename dealerCards to dealer later

    console.log(renderedState);

    return renderedState;
  },
  getMessageLogMessages() {
    return {messages: this.messageLog.messages}
  },
  sendMessageLogMessages(message) {
    // the front end "console.log" api, last x no of console messages
    console.log(message);
    this.messageLog.addMessage(message);
    this.io.emit('message', this.getMessageLogMessages());
  },
  sendGameState(gameState) {
    this.io.emit('gameState',{ gameState });
  },
  emitCurrentState() {
    // minified state
    // build the "lastEmittedState" here!
    const currentState = {};
    // call all the various state methods here.
    currentState.chipsInHand = this.getPlayerChipsInHand();
    currentState.betAmounts = this.getPlayerBetAmounts();
    currentState.messages = this.getMessageLogMessages().messages;
    currentState.players = this.renderState().players;
    currentState.dealerCards = this.renderState().dealerCards;
    currentState.gameState = this.state.name;

    this.io.emit('currentState', currentState);
    console.log(currentState);
    return currentState;
  },
  // almost like redux "reducers?" like reducing state?
  getPlayerChipsInHand() {
    // this is me designing the backend API for frontend to use!!
    // create current minified state
    // from players{}
    let chipsInHand = {};
    this.players.map(player => {chipsInHand[player.name] = player.chips});
    this.io.emit('chipsInHand', chipsInHand);
    return chipsInHand;
  },
  getPlayerBetAmounts() {
    // get current minified state of 
    // playerBets
    let betAmounts = {};
    this.bettingPlayers.map(player => {
      const playerBet = this.bets.filter(bet => bet.player.name === player.name)
      if (playerBet.length > 0) {
        betAmounts[player.name] = playerBet[0].betAmount;
      }
    })
    this.io.emit('betAmounts', betAmounts);
    return betAmounts;
  },
  getBettingPlayers() {
    return this.players.filter(player => player.bet);
  }
};

module.exports = Game;

