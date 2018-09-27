const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const MessageLog = require('./messageLog.js');

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

    this.state = Object.create(gettingPlayersState);
    this.state.init(this);
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
  // helper methods
  render() {
    // show the status of the game.
    console.log(`******`)
    console.log(`Dealer`);
    this.dealer.hand.cards.forEach(card => {
      console.log(`   ${card.readFace()}`);
    });
    this.bets.forEach((bet) => {
      console.log(`${bet.player.name}`);
      bet.hand.cards.forEach((card) => {
        console.log(`   ${card.readFace()}`);
      })
    });
    console.log(`******`);

    // this.io.to(this.roomName).emit('render', this.renderCards());
    this.emitCurrentState();
  },
  renderBets() {
    // state => bets: { idno: cards, player.nickname }
    const bets = {};

    this.bets.forEach((bet) => {
      bets[bet.id] = {
        betAmount: bet.betAmount,
        cards: [],
        nickname: bet.player.nickname
      };
      bet.hand.cards.forEach((card) => {
        bets[bet.id].cards.push(card);
      });
    });

    return bets;
  },
  renderPlayers() {
    const players = {};
    this.players.forEach((player) => {
      players[player.name] = {
        nickname: player.nickname
      }
    });
    return players;
  },
  renderDealerCards() {
    const blankCard = {
      value: 0,
      suit: "-",
      isFaceDown: true,
    };
    const dealerCards = [];
    this.dealer.hand.cards.forEach(card => {
      if (card.isFaceDown) {
        dealerCards.push(blankCard);
      } else {
        dealerCards.push(card);
      }
    });
    return dealerCards;
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
    const currentState = {};
    currentState.chipsInHand = this.getPlayerChipsInHand();
    currentState.betAmounts = this.getPlayerBetAmounts();
    currentState.insuranceBetAmounts = this.getPlayerInsuranceBetAmounts();
    currentState.messages = this.messageLog.messages;
    currentState.players = this.renderPlayers();
    currentState.dealerCards = this.renderDealerCards();
    currentState.gameState = this.state.name;
    currentState.bets = this.renderBets(); 
    currentState.currentBet = this.getCurrentBetId();
    return currentState;
  },
  getCurrentBetId() {
    return this.currentBet ? this.currentBet.id : '';

  },
  emitCurrentChipsInHand() {
    let chipsInHand = {};
    chipsInHand.chipsInHand = this.getPlayerChipsInHand();

    this.io.to(this.roomName).emit('currentChipsInHand', chipsInHand);

  },
  emitInsuranceBets() {
    let currentState = {};
    currentState.insuranceBetAmounts = this.getPlayerInsuranceBetAmounts();
    this.io.to(this.roomName).emit('currentInsuranceBets', currentState);
  },
  emitCurrentBet() {
    this.io.to(this.roomName).emit('currentBet', this.getCurrentBetId());
  },
  // almost like redux "reducers?" like reducing state?
  getPlayerChipsInHand() {
    // this is me designing the backend API for frontend to use!!
    // create current minified state
    // from players{}
    let chipsInHand = {};
    this.players.map(player => {chipsInHand[player.name] = player.chips});
    // this.io.to(this.roomName).emit('chipsInHand', chipsInHand);
    return chipsInHand;
  },
  getPlayerBetAmounts() {
    // get current minified state of 
    // playerBets
    let betAmounts = {};
    this.bets.map(bet => {
      betAmounts[bet.player.name] = bet.betAmount;
    });
    // this.io.to(this.roomName).emit('betAmounts', betAmounts);
    return betAmounts;
  },
  getPlayerInsuranceBetAmounts() {
    let insuranceBetAmounts = {};
    this.insuranceBets.map(insuranceBet => {
      if (insuranceBet.promiseIsResolved) {
        insuranceBetAmounts[insuranceBet.player.name] = insuranceBet.amount;
      }
    });
    return insuranceBetAmounts;
  },
};

module.exports = Game;

