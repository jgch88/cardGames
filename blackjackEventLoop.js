const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const MessageLog = require('./messageLog.js');

const Game = {
  init(io) {
    const deck = Object.create(Deck);
    deck.init();
    deck.createStandardDeck();
    deck.shuffle();
    this.deck = deck;

		const dealer = Object.create(Player);
		dealer.init("Dealer", 10000);
    this.dealer = dealer; // separated from players because dealer doesn't bet, and i had to kept slicing the player array to find the dealer
    this.players = []; // array instead of object because order is preserved and access to map/filter/find

    // inject the server's io object
    // (different from individual sockets!)
    // so the game has access to broadcast events
    this.io = io;

    this.currentPlayer = null;

    const messageLog = Object.create(MessageLog);
    const maxMessages = 12;
    messageLog.init(maxMessages);
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
    this.state.joinGame(playerName, chips, this);
  },
  changeNickname(playerName, nickname) {
    this.state.changeNickname(playerName, nickname, this);
  },
  /*
  leaveGame(playerName) {
    try {
      this.state.leaveGame(playerName, this);
    } catch(e) {
      console.log(`[Error]: ${e}`);
    }
  },
  */
  // gettingBets
  placeBet(playerName, amount) {
    this.state.placeBet(playerName, amount, this);
  },
  // gettingPlays
  play(playerName, move) {
    this.state.play(playerName, move, this);
  },
  // helper methods
  render() {
    // show the status of the game.
    console.log(`******`)
    console.log(`Dealer`);
    this.dealer.hand.cards.forEach(card => {
      console.log(`   ${card.readFace()}`);
    });
    this.getBettingPlayers().forEach((player) => {
      console.log(`${player.name}`);
      player.hand.cards.forEach((card) => {
        console.log(`   ${card.readFace()}`);
      })
    });
    console.log(`******`);

    // this.io.emit('render', this.renderCards());
    this.emitCurrentState();
  },
  renderCards() {
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
    this.players.forEach((player) => {
      // shouldn't expose player.name though, probably use positionIds or something
      renderedState.players[player.name] = {
        cards: [],
        nickname: player.nickname
      };
      player.hand.cards.forEach((card) => {
        renderedState.players[player.name].cards.push(card);
      });
    });

    // rename dealerCards to dealer later

    // console.log(renderedState);

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
    currentState.players = this.renderCards().players;
    currentState.dealerCards = this.renderCards().dealerCards;
    currentState.gameState = this.state.name;

    this.io.emit('currentState', currentState);
    // console.log(currentState);
    return currentState;
  },
  emitCurrentChipsInHand() {
    let chipsInHand = {};
    chipsInHand.chipsInHand = this.getPlayerChipsInHand();

    this.io.emit('currentChipsInHand', chipsInHand);

  },
  // almost like redux "reducers?" like reducing state?
  getPlayerChipsInHand() {
    // this is me designing the backend API for frontend to use!!
    // create current minified state
    // from players{}
    let chipsInHand = {};
    this.players.map(player => {chipsInHand[player.name] = player.chips});
    // this.io.emit('chipsInHand', chipsInHand);
    return chipsInHand;
  },
  getPlayerBetAmounts() {
    // get current minified state of 
    // playerBets
    let betAmounts = {};
    this.getBettingPlayers().map(player => { 
      betAmounts[player.name] = player.bet.betAmount;
    });
    // this.io.emit('betAmounts', betAmounts);
    return betAmounts;
  },
  getBettingPlayers() {
    return this.players.filter(player => player.bet);
  }
};

module.exports = Game;

