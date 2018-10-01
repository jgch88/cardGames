const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const MessageLog = require('./messageLog.js');

const MinifiedStateGenerator = require('./minifiedStateGenerator.js');
const emitterObserver = require('./emitterObserver.js');

// Game module
// Single responsibility
// To initialise a game and expose its API for state changes within the game
// Allows players to do "actions" on the game "such as join room/create room/play move"
const defaultTimerDuration = 30000;
const maxMessages = 12;

const Game = {
  // Game should really be GameState, like TCPState

  //init(roomName)
  init(io, roomName, timer) {
    this._observers = [];
    this.roomName = roomName;
    this.registerIO(io);
    this.setTimerDuration(timer);

    this._minifyStateHelper();
    this._setupGameTable();

    this.state = Object.create(gettingPlayersState);
    this.EmitterObserver = new emitterObserver(this); // this should be "on" parent class, not within the game?
    this.state.init(this);
    this.addMessageToMessageLog(`Game initialised`);
  },

  _minifyStateHelper() {
    this._minifyStateHelper = new MinifiedStateGenerator(this);
  },

  gameDataChanged() {
    // ALL data mutations should call this method
    this._notifyObservers(this._minifyStateHelper._getMinifiedState());
  },

  _setupGameTable() {
    this._loadMessageLog();
    this._loadData();
    this._loadDeck();
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
    this.gameDataChanged();
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
  addMessageToMessageLog(message) {
    // 'global' gameData mutator
    console.log(message);
    this.messageLog.addMessage(message);
    this.gameDataChanged();
  },
  _getMinifiedState() {
    return this._minifyStateHelper._getMinifiedState();
  },

  /* observer stuff, figure a way to compose it with classes / oloo later */
  registerObserver(observer) {
    this._observers.push(observer);
  },

  _notifyObservers(data) {
    this._observers.forEach(observer => {
      observer.update(data);
    })
  },
};

/*
Game._observers = [];
Game.registerObserver = function(observer) {
  this._observers.push(observer);
}

Game._notifyObservers = function(data) {
  this._observers.forEach(observer => {
    observer.update(data);
  })
}
*/


module.exports = Game;

