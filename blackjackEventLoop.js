const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const MessageLog = require('./messageLog.js');

const MinifiedStateGenerator = require('./minifiedStateGenerator.js');

// Game module
// Single responsibility
// To initialise a game and expose its API for state changes within the game
// Allows players to do "actions" on the game "such as join room/create room/play move"
const defaultTimerDuration = 30000;
const maxMessages = 12;

const Game = {

  //init(roomName)
  init(io, roomName, timer) {
    this.roomName = roomName;
    this.registerIO(io);
    this.setTimerDuration(timer);

    this._setupGameTable();

    this._registerObserver();

    this.state = Object.create(gettingPlayersState);
    this.state.init(this);
  },

  _registerObserver() {
    this.observer = new MinifiedStateGenerator(this);
  },

  _setupGameTable() {
    this._loadData();
    this._loadDeck();
    this._loadMessageLog();
    this._loadDealer();
  },

  _loadData() {
    this.players = [];
    this.bets = [];
    this.insuranceBets = [];
    this.currentBet = null;
  },

  _loadDeck() {
    const deck = Object.create(Deck);
    deck.init();
    deck.createStandardDeck();
    deck.shuffle();
    this.deck = deck;
  },

  _loadMessageLog() {
    const messageLog = Object.create(MessageLog);
    messageLog.init(maxMessages);
    this.messageLog = messageLog;
    this.sendMessageLogMessages(`Game initialised`);
  },

  _loadDealer() {
		const dealer = Object.create(Player);
		dealer.init("Dealer", 10000);
    this.dealer = dealer; // separated from players because dealer doesn't bet, and i had to kept slicing the player array to find the dealer
  },

  setTimerDuration(duration) {
    if (duration > 0) {
      this.timer = duration;
    }
  },

  registerIO(io) {
    this.io = io;
  },


  changeState(newState) {
    console.log(`Changing state`);
    this.state = Object.create(newState);
    this.state.init(this);
    this.sendGameState(this.state.name);
  },
  joinGame(playerName, chips) {
    this.state.joinGame(playerName, chips, this);
  },
  changeNickname(playerName, nickname) {
    this.state.changeNickname(playerName, nickname, this);
  },
  placeBet(playerName, amount) {
    this.state.placeBet(playerName, amount, this);
  },
  play(playerName, move) {
    this.state.play(playerName, move, this);
  },
  placeInsuranceBet(playerName, amount) {
    this.state.placeInsuranceBet(playerName, amount, this);
  },
  _getMessageLogMessages() {
    return {messages: this.messageLog.messages}
  },
  addMessageToMessageLog(message) {
    console.log(message);
    // the front end "console.log" api, last x no of console messages
    this.messageLog.addMessage(message);
  },
  sendGameState(gameState) {
    this.io.to(this.roomName).emit('gameState',{ gameState });
  },
  sendMessageLogMessages(message) {
    this.addMessageToMessageLog(message);
    this.io.to(this.roomName).emit('message', this._getMessageLogMessages());
  },
  emitCurrentState() {
    const currentState = this._getMinifiedState();
    this.io.to(this.roomName).emit('currentState', currentState);
    return currentState;
  },
  _getMinifiedState() {
    return this.observer._getMinifiedState();
  },
};

module.exports = Game;

