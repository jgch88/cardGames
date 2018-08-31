(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const BetStatus = function BetStatus(props) {
  if (!props.betAmount) {
    return h("span", null);
  }

  return h(
    "span",
    null,
    "Your Bet: ",
    props.betAmount
  );
};

module.exports = BetStatus;

},{}],2:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');
const MessageLog = require('./messageLog.js');
const GameStateStatus = require('./gameStateStatus.js');
const PlayerStatus = require('./playerStatus.js');
const Button = require('./button.js');
const BetStatus = require('./betStatus.js');
const Snack = require('./snack.js');

class BlackjackTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dealerCards: [],
      players: {},
      messages: [],
      gameState: '',
      chipsInHand: {},
      betAmounts: {},
      bets: {},
      currentBet: ''
    };
    this.socket = props.io;
    console.log(`socket embedded`);
  }

  componentDidMount() {
    this.socket.emit('newSocketReady');
    console.log('ready');
    console.log(this.state.chipsInHand);
    this.socket.on('render', ({ dealerCards, players }) => {
      console.log(`got socket stuff`);
      console.log(`got players ${JSON.stringify(players)}`);
      this.setState({
        dealerCards,
        players
      });
    });
    this.socket.on('message', ({ messages }) => {
      this.setState({
        messages
      });
    });
    this.socket.on('currentChipsInHand', ({ chipsInHand }) => {
      // const newChipsInHand = Object.assign(this.state.chipsInHand, chipsInHand);
      // console.log(newChipsInHand);
      // build new state in blackjackEventLoop.
      this.setState({
        chipsInHand
      });
    });
    this.socket.on('betAmounts', betAmounts => {
      this.setState({
        betAmounts
      });
      console.log(betAmounts);
    });
    this.socket.on('currentBet', betId => {
      this.setState({
        currentBet: betId
      });
      console.log(`betId`, betId);
    });
    this.socket.on('gameState', ({ gameState }) => {
      this.setState({
        gameState
      });
    });
    // this.socket.on('lastEmittedState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand }) => {
    this.socket.on('currentState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand, bets, currentBet }) => {
      this.setState({
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand,
        bets,
        currentBet
      });
      console.log('currentState', {
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand,
        bets,
        currentBet
      });
    });
    this.socket.on('emitError', message => {
      console.log(message);
      this.showError(message);
    });
    this.joinGame = () => {
      const chips = window.prompt("How many chips would you like to exchange?", 500);
      console.log(chips);
      this.socket.emit('joinGame', { chips: Number(chips) });
    };
    this.showError = message => {
      const snack = document.getElementById("snackbar");
      this.setState({
        errorMessage: message
      });
      snack.className = "show";
      setTimeout(() => {
        snack.className = snack.className.replace("show", "");
      }, 2000);
    };
    this.placeBet = () => {
      const chips = window.prompt("How many chips would you like to bet?", 10);
      console.log(chips);
      this.socket.emit('placeBet', { chips: Number(chips) });
    };
    this.hit = () => {
      this.socket.emit('play', 'hit');
    };
    this.stand = () => {
      this.socket.emit('play', 'stand');
    };
    this.goToBettingState = () => {
      this.socket.emit('changeState', 'gettingBetsState');
      this.setState({
        betAmounts: {}
      });
    };
    this.goToCheckDealerForNaturalsState = () => {
      this.socket.emit('changeState', 'checkDealerForNaturalsState');
    };
    this.playerHasJoined = () => {
      return this.socket.id in this.state.chipsInHand;
    };
    this.playerHasBet = () => {
      return this.socket.id in this.state.betAmounts;
    };
    this.changeNickname = () => {
      const nickname = window.prompt("What nickname would you like to display?");
      this.socket.emit('changeNickname', nickname);
    };
    this.createRoom = () => {
      const roomName = window.prompt("Which room would you like to create?", 123);
      this.socket.emit('createRoom', roomName);
    };
    this.joinRoom = () => {
      const roomName = window.prompt("Which room would you like to join?", 123);
      this.socket.emit('joinRoom', roomName);
    };
  }

  betAmount() {
    if (this.socket.id in this.state.betAmounts) {
      return this.state.betAmounts[this.socket.id];
    }
  }

  render() {
    // const pchipsInHand = this.state.chipsInHand[this.socket.id]
    return h(
      'div',
      { 'class': 'deckTable' },
      h(Button, { text: "Create room", id: "createRoom", clickHandler: this.createRoom }),
      h(Button, { text: "Join room", id: "joinRoom", clickHandler: this.joinRoom }),
      h(PlayerStatus, { playerName: this.state.players[this.socket.id] ? this.state.players[this.socket.id].nickname : this.socket.id, gameState: this.state, socketId: this.socket.id }),
      h(Deck, { playerName: 'Dealer', key: 'Dealer', cards: this.state.dealerCards }),
      h(
        'div',
        { 'class': 'horizontalScroll playerHands' },
        Object.keys(this.state.bets).map((bet, index) => {
          return h(Deck, {
            betAmount: this.state.bets[bet].betAmount,
            isCurrentPlayer: this.state.players[this.socket.id] ? this.state.bets[bet].nickname === this.state.players[this.socket.id].nickname : ``,
            isCurrentBet: this.state.currentBet === bet,
            playerName: this.state.bets[bet].nickname,
            key: index,
            cards: this.state.bets[bet].cards });
        })
      ),
      h(
        'div',
        { 'class': 'actions' },
        this.state.gameState === 'gettingPlayersState' && !this.playerHasJoined() ? h(Button, { text: "Join Game", id: "joinGame", clickHandler: this.joinGame }) : '',
        this.state.gameState === 'gettingPlayersState' && this.socket.id in this.state.chipsInHand ? h(
          'span',
          null,
          h(Button, { id: 'changeName', text: "Change name", clickHandler: this.changeNickname }),
          h(Button, { id: 'goToBettingState', text: "Next", clickHandler: this.goToBettingState })
        ) : '',
        this.state.gameState === 'gettingBetsState' && this.playerHasJoined() ? h(Button, { id: 'placeBet', text: "Place Bet", clickHandler: this.placeBet }) : '',
        this.state.gameState === 'gettingBetsState' && this.playerHasJoined() && this.playerHasBet() ? h(Button, { id: 'startRound', text: "Start Round", clickHandler: this.goToCheckDealerForNaturalsState }) : '',
        this.state.gameState === 'dealerNoBlackjackState' ? h(
          'div',
          null,
          h(Button, { id: 'playHit', text: "Hit", clickHandler: this.hit }),
          h(Button, { id: 'playStand', text: "Stand", clickHandler: this.stand })
        ) : ''
      ),
      'MessageLog',
      h(
        'div',
        { 'class': 'messageLog' },
        h(MessageLog, { messages: this.state.messages })
      ),
      h(GameStateStatus, { gameState: this.state.gameState }),
      h(Snack, { message: this.state.errorMessage })
    );
  }
}

module.exports = BlackjackTable;

},{"./betStatus.js":1,"./button.js":3,"./card.js":4,"./deck.js":6,"./gameStateStatus.js":7,"./messageLog.js":8,"./playerStatus.js":9,"./snack.js":10}],3:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const Button = function Button(props) {
  return h(
    "button",
    {
      key: props.id,
      id: props.id,
      onClick: props.clickHandler },
    props.text
  );
};

module.exports = Button;

},{}],4:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

// Card component states:
// 1. value
// 2. suit
// 3. isFaceDown

// for a better rendering
const values = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K"
};

const suits = {
  "Clubs": "\u2663",
  "Diamonds": "\u2666",
  "Hearts": "\u2665",
  "Spades": "\u2660"

  // Decided to use functional components because
  // we don't want the players to manage state at all!
  // That would be the server's responsibility.
};const Card = function Card(props) {
  const borderStyle = {
    width: '52px',
    height: '91px',
    border: '1px solid black'
  };
  const centerStyle = {
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'relative',
    top: '50',
    translate: 'translateY(-50%)'
  };
  const redHexColourStyle = {
    color: '#D30000'
  };
  return h(
    "div",
    { style: borderStyle },
    h(
      "div",
      { style: props.suit == "Hearts" || props.suit == "Diamonds" ? Object.assign(redHexColourStyle, centerStyle) : centerStyle },
      h(
        "div",
        { style: centerStyle },
        props.isFaceDown ? "Face Down" : suits[props.suit]
      ),
      h(
        "div",
        null,
        props.isFaceDown ? "-" : values[props.value]
      )
    )
  );
};

/*
class Card extends Component {
  constructor({value = 1, suit = "Spades"} = {}, {isFaceDown = true} = {}) {
    super();
    this.value = value;
    this.suit = suit;
    this.isFaceDown = isFaceDown;
  }
  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Suit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Value</td>
          </tr>
        </tbody>
      </table>
    )
  }
}
*/

module.exports = Card;

},{}],5:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

class Clock extends Component {
  constructor() {
    super();
    this.state.time = Date.now();
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ time: Date.now() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render(props, state) {
    let time = new Date(state.time).toLocaleTimeString();
    return h(
      "span",
      null,
      time
    );
  }
}

module.exports = Clock;

},{}],6:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./card.js');
const BetStatus = require('./betStatus.js');

// Deck is a collection of cards

const Deck = function Deck(props) {
  const playerNameStyle = {
    fontWeight: `bold`
  };
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return h(
    'div',
    { style: { backgroundColor: props.isCurrentBet ? `azure` : `` } },
    props.isCurrentPlayer ? h(
      'div',
      { style: playerNameStyle },
      h(BetStatus, { betAmount: props.betAmount }),
      h(
        'div',
        null,
        playerNameText
      )
    ) : h(
      'div',
      null,
      playerNameText
    ),
    props.cards.map(card => {
      return h(
        'td',
        null,
        h(Card, { suit: card.suit, value: card.value, isFaceDown: card.isFaceDown })
      );
    })
  );
};

module.exports = Deck;

},{"./betStatus.js":1,"./card.js":4}],7:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const GameStateStatus = function GameStateStatus(props) {
  const gameStates = {
    gettingPlayersState: 'Waiting for Players to join',
    gettingBetsState: 'Waiting for bets to be placed',
    checkDealerForNaturals: 'Checking if Dealer has Blackjack',
    dealerHasBlackjackState: 'Dealer Blackjack!',
    dealerNoBlackjackState: 'Playing',
    resolveState: 'Resolving bets'
  };
  let renderedState = gameStates[props.gameState] ? gameStates[props.gameState] : props.gameState;
  return h(
    'div',
    {
      'class': 'gameStateStatus'
    },
    renderedState
  );
};

module.exports = GameStateStatus;

},{}],8:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const MessageLog = function MessageLog(props) {
  // need to reverse the messages without mutating the state
  return h(
    "div",
    null,
    props.messages.slice().reverse().map(message => {
      return h(
        "div",
        null,
        message
      );
    })
  );
};

module.exports = MessageLog;

},{}],9:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Button = require('./button.js');

const PlayerStatus = function PlayerStatus(props) {
  return h(
    "div",
    {
      "class": "playerStatus"
    },
    h(
      "span",
      { id: "nickname" },
      props.playerName
    ),
    props.socketId in props.gameState.chipsInHand && h(
      "span",
      { id: "chipsInHand" },
      "Chips: ",
      props.gameState.chipsInHand[props.socketId]
    )
  );
};

module.exports = PlayerStatus;

},{"./button.js":3}],10:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const Snack = function Snack(props) {
  return h(
    "div",
    {
      id: "snackbar"
    },
    props.message
  );
};

module.exports = Snack;

},{}],11:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const Card = require('./components/card');
const Deck = require('./components/deck');
const Clock = require('./components/clock');
const Button = require('./components/button.js');
const BlackjackTable = require('./components/blackjackTable.js');

const socket = io();

// need a GAME react component composed of dealer/player decks
// need actual state in it... shouldn't be functional
// which i can call setState on...

render(h(Clock, null), document.body);
render(h(BlackjackTable, { io: socket }), document.body);

socket.on('playerJoined', player => {
  console.log(player);
});

socket.on('connect', function () {
  console.log(socket.id);
});

socket.on('render', state => {
  console.log(state);
});

},{"./components/blackjackTable.js":2,"./components/button.js":3,"./components/card":4,"./components/clock":5,"./components/deck":6}]},{},[11]);
