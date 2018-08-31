const Deck = require('./deck.js');
const Player = require('./player.js');
const gettingBetsState = require('./gettingBetsState.js');
const gettingPlayersState = require('./gettingPlayersState.js');
const MessageLog = require('./messageLog.js');

const Game = {
  init(io, roomName) {
    const deck = Object.create(Deck);
    deck.init();
    deck.createStandardDeck();
    deck.shuffle();
    this.deck = deck;

    this.roomName = roomName;

		const dealer = Object.create(Player);
		dealer.init("Dealer", 10000);
    this.dealer = dealer; // separated from players because dealer doesn't bet, and i had to kept slicing the player array to find the dealer
    this.players = []; // array instead of object because order is preserved and access to map/filter/find
    this.bets = []; // restructure the game to decouple bets from players -> just directly resolve bets.

    // inject the server's io object
    // (different from individual sockets!)
    // so the game has access to broadcast events
    this.io = io;

    this.currentBet = null;

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
    this.bets.forEach((bet) => {
      console.log(`${bet.player.name}`);
      bet.cards.cards.forEach((card) => {
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
      bet.cards.cards.forEach((card) => {
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
  getMessageLogMessages() {
    return {messages: this.messageLog.messages}
  },
  sendMessageLogMessages(message) {
    // the front end "console.log" api, last x no of console messages
    console.log(message);
    this.messageLog.addMessage(message);
    this.io.to(this.roomName).emit('message', this.getMessageLogMessages());
  },
  sendGameState(gameState) {
    this.io.to(this.roomName).emit('gameState',{ gameState });
  },
  emitCurrentState() {
    // minified state
    // build the "lastEmittedState" here!
    const currentState = {};
    // call all the various state methods here.
    currentState.chipsInHand = this.getPlayerChipsInHand();
    currentState.betAmounts = this.getPlayerBetAmounts();
    currentState.messages = this.getMessageLogMessages().messages;
    currentState.players = this.renderPlayers();
    currentState.dealerCards = this.renderDealerCards();
    currentState.gameState = this.state.name;
    currentState.bets = this.renderBets(); 
    // use logic to change background colour of current bets
    currentState.currentBet = this.getCurrentBetId();

    this.io.to(this.roomName).emit('currentState', currentState);
    // console.log(currentState);
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
};

module.exports = Game;

