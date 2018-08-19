(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');
const MessageLog = require('./messageLog.js');
const GameStateStatus = require('./gameStateStatus.js');
const PlayerStatus = require('./playerStatus.js');

class BlackjackTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dealerCards: [],
      players: {},
      messages: [],
      gameState: '',
      chipsInHand: {},
      betAmounts: {}
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
    this.socket.on('chipsInHand', chipsInHand => {
      console.log(chipsInHand);
      // const newChipsInHand = Object.assign(this.state.chipsInHand, chipsInHand);
      // console.log(newChipsInHand);
      this.setState({
        chipsInHand
      });
    });
    this.socket.on('betAmounts', betAmounts => {
      this.setState({
        betAmounts
      });
    });
    this.socket.on('gameState', ({ gameState }) => {
      this.setState({
        gameState
      });
    });
    this.socket.on('lastEmittedState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand }) => {
      console.log(players, messages, gameState, dealerCards);
      this.setState({
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand
      });
    });
  }

  render() {
    // const pchipsInHand = this.state.chipsInHand[this.socket.id]
    return h(
      'div',
      null,
      h(PlayerStatus, { playerName: this.socket.id, gameState: this.state }),
      h(Deck, { playerName: 'Dealer', key: 'Dealer', cards: this.state.dealerCards }),
      Object.keys(this.state.players).map((player, index) => {
        return h(Deck, { isPlayersDeck: this.socket.id === player, playerName: player, key: index, cards: this.state.players[player] });
      }),
      h(MessageLog, { messages: this.state.messages }),
      h(GameStateStatus, { gameState: this.state.gameState })
    );
  }
}

module.exports = BlackjackTable;

},{"./card.js":3,"./deck.js":5,"./gameStateStatus.js":6,"./messageLog.js":7,"./playerStatus.js":8}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
  return h(
    "table",
    { "class": "card" },
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h(
          "th",
          null,
          props.isFaceDown ? "Face Down" : suits[props.suit]
        )
      )
    ),
    h(
      "tbody",
      null,
      h(
        "tr",
        null,
        h(
          "td",
          null,
          props.isFaceDown ? "---" : values[props.value]
        )
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./card.js');

// Deck is a collection of cards

const Deck = function Deck(props) {
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return h(
    "div",
    { "class": "horizontalScroll" },
    props.isPlayersDeck ? h(
      "h3",
      null,
      playerNameText
    ) : h(
      "div",
      null,
      playerNameText
    ),
    h(
      "table",
      null,
      h(
        "tbody",
        null,
        h(
          "tr",
          null,
          props.cards.map(card => {
            return h(
              "td",
              null,
              h(Card, { suit: card.suit, value: card.value, isFaceDown: card.isFaceDown })
            );
          })
        )
      )
    )
  );
};

module.exports = Deck;

},{"./card.js":3}],6:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const GameStateStatus = function GameStateStatus(props) {
  const gameStates = {
    gettingPlayersState: 'Waiting for Players to join',
    gettingBetsState: 'Waiting for bets to be placed'
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

},{}],7:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const MessageLog = function MessageLog(props) {
  // need to reverse the messages without mutating the state
  return h(
    "div",
    null,
    h(
      "div",
      null,
      "Message Log"
    ),
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

},{}],8:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const PlayerStatus = function PlayerStatus(props) {
  return h(
    "div",
    {
      "class": "playerStatus"
    },
    h(
      "span",
      null,
      props.playerName
    ),
    Object.keys(props.gameState.chipsInHand).length > 0 && h(
      "span",
      null,
      "Chips: ",
      props.gameState.chipsInHand[props.playerName]
    )
  );
};

module.exports = PlayerStatus;

},{}],9:[function(require,module,exports){
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
// render(<Card suit={"Spades"} value={1} isFaceDown={false} />, document.body);
render(h(BlackjackTable, { io: socket }), document.body);

/*
render(<Deck 
  cards={[
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
  ]}
/>, document.body);
render(<Deck 
  cards={[
    <Card suit={"Spades"} value={1} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
  ]}
/>, document.body);
*/

const joinGame = () => {
  const chips = window.prompt("How many chips would you like to exchange?", 500);
  console.log(chips);
  socket.emit('joinGame', { chips: Number(chips) });
};

const placeBet = () => {
  const chips = window.prompt("How many chips would you like to bet?", 10);
  console.log(chips);
  socket.emit('placeBet', { chips: Number(chips) });
};

const hit = () => {
  socket.emit('play', 'hit');
};

const stand = () => {
  socket.emit('play', 'stand');
};

const goToBettingState = () => {
  socket.emit('changeState', 'gettingBetsState');
};

const goToCheckDealerForNaturalsState = () => {
  socket.emit('changeState', 'checkDealerForNaturals');
};

render(h(Button, { text: "Join Game", id: "joinGame", clickHandler: joinGame }), document.body);
render(h(Button, { text: "Place Bet", id: "placeBet", clickHandler: placeBet }), document.body);
render(h(Button, { text: "Hit", id: "hit", clickHandler: hit }), document.body);
render(h(Button, { text: "Stand", id: "stand", clickHandler: stand }), document.body);

render(h(Button, { text: "Go to Betting State", id: "getBets", clickHandler: goToBettingState }), document.body);
render(h(Button, { text: "Play", id: "play", clickHandler: goToCheckDealerForNaturalsState }), document.body);

socket.on('playerJoined', player => {
  console.log(player);
});

socket.on('connect', function () {
  console.log(socket.id);
});

socket.on('render', state => {
  console.log(state);
});

},{"./components/blackjackTable.js":1,"./components/button.js":2,"./components/card":3,"./components/clock":4,"./components/deck":5}]},{},[9]);
