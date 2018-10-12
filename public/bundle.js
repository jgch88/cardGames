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
const StartScreen = require('./startScreen.js');
const GettingBetsStateScreen = require('./gettingBetsStateScreen.js');
const GettingPlayersStateScreen = require('./gettingPlayersStateScreen.js');
const GameTableScreen = require('./gameTableScreen.js');

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
      insuranceBetAmounts: {},
      bets: {},
      currentBet: '',
      mySocketId: '',
      countdown: ''
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
    this.socket.on('currentInsuranceBet', ({ insuranceBetAmounts }) => {
      this.setState({
        insuranceBetAmounts
      });
    });
    this.socket.on('gameState', ({ gameState }) => {
      this.setState({
        gameState
      });
    });
    // this.socket.on('lastEmittedState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand }) => {
    this.socket.on('currentState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand, bets, currentBet, insuranceBetAmounts, countdown }) => {
      this.setState({
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand,
        bets,
        currentBet,
        insuranceBetAmounts,
        countdown
      });
      this.setState({
        mySocketId: this.socket.id
      });
      console.log('currentState', {
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand,
        bets,
        currentBet,
        insuranceBetAmounts,
        countdown
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
      }, 4000);
    };
    this.placeBet = chips => {
      // const chips = window.prompt("How much would you like to bet?", 10);
      this.socket.emit('placeBet', { chips: Number(chips) });
    };
    this.placeInsuranceBet = () => {
      const chips = window.prompt("Would you like to place an insurance bet? (Max: half your original bet)", 10);
      this.socket.emit('placeInsuranceBet', { chips: Number(chips) });
    };
    this.dontPlaceInsuranceBet = () => {
      this.socket.emit('placeInsuranceBet', { chips: Number(0) });
    };
    this.hit = () => {
      this.socket.emit('play', 'hit');
    };
    this.stand = () => {
      this.socket.emit('play', 'stand');
    };
    this.split = () => {
      this.socket.emit('play', 'split');
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
    this.playerHasBetInsurance = () => {
      return this.socket.id in this.state.insuranceBetAmounts;
    };
    this.changeNickname = () => {
      const nickname = window.prompt("What nickname would you like to display?");
      this.socket.emit('changeNickname', nickname);
    };
    this.joinAndChangeNickname = nickname => {
      this.socket.emit('joinAndChangeNickname', { chips: Number(1000) }, data => {
        console.log(data);
        if (nickname && this.socket.id !== nickname) {
          this.socket.emit('changeNickname', nickname);
        }
      });
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

  isPlayersTurn() {
    if (!(this.state.gameState === 'dealerNoBlackjackState')) {
      return false;
    }
    if (this.state.players[this.socket.id] && this.state.currentBet) {
      if (this.state.bets[this.state.currentBet].nickname === this.state.players[this.socket.id].nickname) {
        return true;
      }
    }
    return false;
  }

  playerCanSplit() {
    if (this.isPlayersTurn()) {
      if (this.state.bets[this.state.currentBet].cards.length === 2) {
        // this was erroring due to the cards[1] value being checked immediately after splitting hands
        if (this.state.bets[this.state.currentBet].cards[0].value === this.state.bets[this.state.currentBet].cards[1].value) {
          return true;
        }
      }
    }
    return false;
  }

  render() {
    return h(
      'div',
      null,
      this.state.gameState === 'gettingPlayersState' && !(this.socket.id in this.state.players) ? h(StartScreen, { playerNickname: this.state.mySocketId, joinAndChangeNickname: this.joinAndChangeNickname }) : '',
      this.state.gameState === 'gettingPlayersState' && this.socket.id in this.state.players ? h(GettingPlayersStateScreen, {
        playerName: this.state.players[this.socket.id].nickname,
        playerChips: this.state.chipsInHand[this.socket.id],
        countdown: this.state.countdown
      }) : '',
      this.state.gameState === 'gettingBetsState' && this.socket.id in this.state.players ? h(GettingBetsStateScreen, {
        playerName: this.state.players[this.socket.id].nickname,
        playerChips: this.state.chipsInHand[this.socket.id],
        placeBet: this.placeBet,
        countdown: this.state.countdown,
        bets: this.state.bets
      }) : '',
      (this.state.gameState === 'dealerNoBlackjackState' || this.state.gameState === 'gettingInsuranceBetsState' || this.state.gameState === 'resolveState') && this.socket.id in this.state.players ? h(GameTableScreen, {
        gameState: this.state.gameState,
        playerName: this.state.players[this.socket.id].nickname,
        playerChips: this.state.chipsInHand[this.socket.id],
        countdown: this.state.countdown,
        bets: this.state.bets,
        players: this.state.players,
        socket: this.socket,
        currentBet: this.state.currentBet,
        dealerCards: this.state.dealerCards,
        isPlayersTurn: this.isPlayersTurn(),
        playerCanSplit: this.playerCanSplit(),
        playHit: this.hit,
        playStand: this.stand,
        playSplit: this.split,
        placeInsuranceBet: this.placeInsuranceBet,
        dontPlaceInsuranceBet: this.dontPlaceInsuranceBet
      }) : '',
      h(Snack, { message: this.state.errorMessage })
    );

    /*
      <div class="app">
        <div class="block">
          <div class="block block--rows block--height-8 actions">
            {this.state.gameState === 'gettingInsuranceBetsState' && !this.playerHasBetInsurance() ?
              <span><Button id="placeInsuranceBet" text={"Insurance"} clickHandler={this.placeInsuranceBet}/>
              <Button id="dontPlaceInsuranceBet" text={"No Insurance"} clickHandler={this.dontPlaceInsuranceBet}/></span> : ''}
            </div>
          </div>
        <div class="block block--height-4">MessageLog</div>
        <div class="block block--height-22">
          <MessageLog messages={this.state.messages} />
        </div>
        <div class="block block--height-4">
          <GameStateStatus gameState={this.state.gameState}/>
        </div>
      </div>
      <Snack message={this.state.errorMessage} />
      </div>
        :''}
    */

    /*
    return (
      <div class="app">
        <div class="block">
        <div class="block block--rows block--height-8 actions">
          <Button text={"Create room"} id={"createRoom"} clickHandler={this.createRoom}/>
          <Button text={"Join room"} id={"joinRoom"} clickHandler={this.joinRoom}/>
        </div>
        <div class="block block--height-4">
          <PlayerStatus playerName={this.state.players[this.socket.id] ? this.state.players[this.socket.id].nickname : this.socket.id} gameState={this.state} socketId={this.socket.id}/>
        </div>
        <div class="block block--height-50">
          <Deck playerName='Dealer' key='Dealer' cards={this.state.dealerCards} />
          <div class="block block--overflow" id="playerHands">
          {Object.keys(this.state.bets).map((bet, index) => {
            return <Deck 
              betAmount={this.state.bets[bet].betAmount} 
              isCurrentPlayer={this.state.players[this.socket.id] ? this.state.bets[bet].nickname === this.state.players[this.socket.id].nickname : ``}
              isCurrentBet={this.state.currentBet === bet} 
              playerName={this.state.bets[bet].nickname} 
              key={index} 
              cards={this.state.bets[bet].cards} />
          })}
          </div>
        </div>
          <div class="block block--rows block--height-8 actions">
            {this.state.gameState === 'gettingPlayersState' && !(this.playerHasJoined()) ? 
            <Button text={"Join Game"} id={"joinGame"} clickHandler={this.joinGame}/> : ''}
            {this.state.gameState === 'gettingPlayersState' && (this.socket.id in this.state.chipsInHand) ? 
            <span><Button id="changeName" text={"Change name"} clickHandler={this.changeNickname}/><Button id="goToBettingState" text={"Next"} clickHandler={this.goToBettingState}/></span> : ''}
            {this.state.gameState === 'gettingBetsState' && this.playerHasJoined() ? 
            <Button id="placeBet" text={"Place Bet"} clickHandler={this.placeBet}/> : ''}
            {this.state.gameState === 'gettingBetsState' && this.playerHasJoined() && this.playerHasBet() ? 
            <Button id="startRound" text={"Start Round"} clickHandler={this.goToCheckDealerForNaturalsState}/> : ''}
            <div>
            {this.state.gameState === 'dealerNoBlackjackState' && this.isPlayersTurn() ? 
              <span><Button id="playHit" text={"Hit"} clickHandler={this.hit}/>
              <Button id="playStand" text={"Stand"} clickHandler={this.stand}/></span> : ''}
            {this.playerCanSplit() ?
              <Button id="playSplit" text={"Split"} clickHandler={this.split}/> : ''}
            {this.state.gameState === 'gettingInsuranceBetsState' && !this.playerHasBetInsurance() ?
              <span><Button id="placeInsuranceBet" text={"Insurance"} clickHandler={this.placeInsuranceBet}/>
              <Button id="dontPlaceInsuranceBet" text={"No Insurance"} clickHandler={this.dontPlaceInsuranceBet}/></span> : ''}
            </div>
          </div>
        <div class="block block--height-4">MessageLog</div>
        <div class="block block--height-22">
          <MessageLog messages={this.state.messages} />
        </div>
        <div class="block block--height-4">
          <GameStateStatus gameState={this.state.gameState}/>
        </div>
      </div>
      <Snack message={this.state.errorMessage} />
      </div>
    );
    */
  }
}

module.exports = BlackjackTable;

},{"./betStatus.js":1,"./button.js":3,"./card.js":4,"./deck.js":21,"./gameStateStatus.js":22,"./gameTableScreen.js":23,"./gettingBetsStateScreen.js":24,"./gettingPlayersStateScreen.js":25,"./messageLog.js":26,"./playerStatus.js":30,"./snack.js":31,"./startScreen.js":32}],3:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const Button = function Button(props) {
  return h(
    "button",
    {
      "class": "block__button",
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

const CardAce = function CardAce(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `A`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_center card__pip--large_pip" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardAce;

},{}],6:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const CardAce = require('./cardAce.js');
const CardTwo = require('./cardTwo.js');
const CardThree = require('./cardThree.js');
const CardFour = require('./cardFour.js');
const CardFive = require('./cardFive.js');
const CardSix = require('./cardSix.js');
const CardSeven = require('./cardSeven.js');
const CardEight = require('./cardEight.js');
const CardNine = require('./cardNine.js');
const CardTen = require('./cardTen.js');
const CardJack = require('./cardJack.js');
const CardQueen = require('./cardQueen.js');
const CardKing = require('./cardKing.js');

const CardFaceDown = require('./cardFaceDown.js');

const CardContainer = function CardContainer(props) {
  const mapValueToCardComponent = suit => ({
    1: h(CardAce, { suit: suit }),
    2: h(CardTwo, { suit: suit }),
    3: h(CardThree, { suit: suit }),
    4: h(CardFour, { suit: suit }),
    5: h(CardFive, { suit: suit }),
    6: h(CardSix, { suit: suit }),
    7: h(CardSeven, { suit: suit }),
    8: h(CardEight, { suit: suit }),
    9: h(CardNine, { suit: suit }),
    10: h(CardTen, { suit: suit }),
    11: h(CardJack, { suit: suit }),
    12: h(CardQueen, { suit: suit }),
    13: h(CardKing, { suit: suit })
  });
  // list of card number templates to populate it
  return h(
    'div',
    { 'class': 'card' },
    props.isFaceDown ? h(CardFaceDown, null) : '',
    !props.isFaceDown && props.value ? mapValueToCardComponent(props.suit)[props.value] : ''
  );
};

module.exports = CardContainer;

},{"./cardAce.js":5,"./cardEight.js":7,"./cardFaceDown.js":8,"./cardFive.js":9,"./cardFour.js":10,"./cardJack.js":11,"./cardKing.js":12,"./cardNine.js":13,"./cardQueen.js":14,"./cardSeven.js":15,"./cardSix.js":16,"./cardTen.js":17,"./cardThree.js":18,"./cardTwo.js":19}],7:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardEight = function CardEight(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `8`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_bottom" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardEight;

},{}],8:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardFaceDown = function CardFaceDown(props) {

  return h(
    "div",
    null,
    h("div", { "class": "card__corner card__corner--top" }),
    h(
      "span",
      { "class": "card__face" },
      h("img", { src: "images/faces/face-down.png" })
    ),
    h("div", { "class": "card__corner card__corner--bottom" })
  );
};

module.exports = CardFaceDown;

},{}],9:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardFive = function CardFive(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `5`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardFive;

},{}],10:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardFour = function CardFour(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `4`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardFour;

},{}],11:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardJack = function CardJack(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `J`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__face" },
      h("img", { src: "images/faces/face-" + number + "-" + props.suit + ".png" })
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardJack;

},{}],12:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardKing = function CardKing(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `K`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__face" },
      h("img", { src: "images/faces/face-" + number + "-" + props.suit + ".png" })
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardKing;

},{}],13:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardNine = function CardNine(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `9`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_bottom_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardNine;

},{}],14:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardQueen = function CardQueen(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `Q`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__face" },
      h("img", { src: "images/faces/face-" + number + "-" + props.suit + ".png" })
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardQueen;

},{}],15:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardSeven = function CardSeven(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `7`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardSeven;

},{}],16:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardSix = function CardSix(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `6`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardSix;

},{}],17:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardTen = function CardTen(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `10`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_top_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_right" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_bottom_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_bottom_left" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_bottom_right" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardTen;

},{}],18:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardThree = function CardThree(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `3`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--middle_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_center" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardThree;

},{}],19:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const CardTwo = function CardTwo(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black"
  };

  const number = `2`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return h(
    "div",
    { "class": `card--` + suitColor },
    h(
      "div",
      { "class": "card__corner card__corner--top" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    ),
    h(
      "span",
      { "class": "card__pip card__pip--top_center" },
      suitSymbol
    ),
    h(
      "span",
      { "class": "card__pip card__pip--bottom_center" },
      suitSymbol
    ),
    h(
      "div",
      { "class": "card__corner card__corner--bottom" },
      h(
        "span",
        { "class": "card__number" },
        number
      ),
      h(
        "span",
        null,
        suitSymbol
      )
    )
  );
};

module.exports = CardTwo;

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./cardContainer.js');
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

},{"./betStatus.js":1,"./cardContainer.js":6}],22:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const GameStateStatus = function GameStateStatus(props) {
  const gameStates = {
    gettingPlayersState: 'Waiting for Players to join',
    gettingBetsState: 'Waiting for bets to be placed',
    gettingInsuranceBetsState: 'Getting Insurance Bets',
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

},{}],23:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const PlayerBetDisplay = require('./playerBetDisplay.js');

const GameTableScreen = function GameTableScreen(props) {

  return h(
    "div",
    { "class": "block" },
    h("div", { "class": "block block--height-8" }),
    h(
      "div",
      { "class": "block block--height-30" },
      h(PlayerBetDisplay, { playerName: "Dealer", key: "Dealer", cards: props.dealerCards })
    ),
    h(
      "div",
      { "class": "block block--height-30" },
      h(
        "div",
        { id: "playerHands", "class": "block block--overflow-y" },
        Object.keys(props.bets).map((bet, index) => {
          return h(PlayerBetDisplay, {
            betAmount: props.bets[bet].betAmount,
            isCurrentPlayer: props.players[props.socket.id] ? props.bets[bet].nickname === props.players[props.socket.id].nickname : ``,
            isCurrentBet: props.currentBet === bet,
            playerName: props.bets[bet].nickname,
            key: index,
            cards: props.bets[bet].cards });
        })
      )
    ),
    props.gameState === 'gettingInsuranceBetsState' && h(
      "div",
      { "class": "block block--height-24" },
      h(
        "div",
        { "class": "block__input" },
        h(
          "button",
          {
            id: "placeInsuranceBet",
            "class": "block__button",
            onClick: () => {
              this.props.placeInsuranceBet();
            }
          },
          "Buy Insurance"
        ),
        h(
          "button",
          {
            id: "dontPlaceInsuranceBet",
            "class": "block__button",
            onClick: () => {
              this.props.dontPlaceInsuranceBet();
            }
          },
          "Don't Buy Insurance"
        )
      )
    ),
    props.isPlayersTurn ? h(
      "div",
      { "class": "block block--height-24" },
      h(
        "div",
        { "class": "block__input" },
        h(
          "button",
          {
            id: "playHit",
            "class": "block__button",
            onClick: () => {
              this.props.playHit();
            }
          },
          "Hit"
        ),
        h(
          "button",
          {
            id: "playStand",
            "class": "block__button",
            onClick: () => {
              this.props.playStand();
            }
          },
          "Stand"
        ),
        props.playerCanSplit && h(
          "button",
          {
            id: "playSplit",
            "class": "block__button",
            onClick: () => {
              this.props.playSplit();
            }
          },
          "Split"
        )
      )
    ) : h(
      "div",
      { id: "messageLog", "class": "block block--height-24" },
      props.gameState === 'gettingInsuranceBetsState' && `Dealer has an Ace. Buy insurance?`,
      props.currentBet && props.gameState !== 'gettingInsuranceBetsState' && `It is ${props.bets[props.currentBet].nickname}'s turn. Please wait...`,
      props.countdown > 0 && `Round over... next round in ${props.countdown}`
    ),
    h(
      "div",
      { "class": "block block--height-8 block--rows block--theme-dark" },
      h(
        "div",
        { "class": "block__row--width-33" },
        h(
          "div",
          { "class": "block__text" },
          this.props.playerName
        )
      ),
      h(
        "div",
        { "class": "block__row--width-34" },
        h(
          "div",
          { id: "chipsInHand", "class": "block__text" },
          "Chips: ",
          this.props.playerChips
        )
      ),
      h(
        "div",
        { "class": "block__row--width-33" },
        h(
          "div",
          { "class": "block__text" },
          "Room: game0"
        )
      )
    )
  );
};

module.exports = GameTableScreen;

},{"./playerBetDisplay.js":27}],24:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

class GettingBetsStateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      betSlider: 10,
      nickname: props.nickname
    };
    this.handleBetChange = this.handleBetChange.bind(this);
  }

  handleBetChange(event) {
    console.log(event.target.value);
    this.setState({
      betSlider: event.target.value
    });
  }

  render() {
    return h(
      "div",
      { "class": "block" },
      h(
        "div",
        { "class": "block block--height-30" },
        h(
          "div",
          { "class": "block__timer" },
          this.props.countdown
        )
      ),
      h(
        "div",
        { "class": "block block--height-10" },
        h(
          "div",
          { "class": "block__text" },
          "How baller ya feelin' right now?"
        )
      ),
      h(
        "div",
        { "class": "block block--height-15" },
        h(
          "div",
          { id: "betSliderValue", "class": "block__text" },
          "Place your bet: ",
          this.state.betSlider
        ),
        h(
          "div",
          { "class": "block__input" },
          h("input", {
            id: "betSlider",
            "class": "block__slider",
            type: "range",
            onChange: this.handleBetChange,
            onInput: this.handleBetChange,
            min: "0",
            max: "100",
            step: "2",
            value: this.state.betSlider
          })
        )
      ),
      h(
        "div",
        { "class": "block block--height-12" },
        h(
          "div",
          { "class": "block__text" },
          h(
            "button",
            {
              id: "placeBet",
              "class": "block__button",
              onClick: () => this.props.placeBet(Number(this.state.betSlider))
            },
            "Place Bet"
          )
        )
      ),
      h(
        "div",
        { "class": "block block--height-25" },
        h(
          "div",
          { "class": "block block--overflow-y" },
          Object.keys(this.props.bets).map((bet, index) => {
            return h(
              "div",
              { "class": "block block--height-25" },
              this.props.bets[bet].nickname,
              " bet ",
              this.props.bets[bet].betAmount,
              " chips."
            );
          })
        )
      ),
      h(
        "div",
        { "class": "block block--height-8 block--rows block--theme-dark" },
        h(
          "div",
          { "class": "block__row--width-33" },
          h(
            "div",
            { "class": "block__text" },
            this.props.playerName
          )
        ),
        h(
          "div",
          { "class": "block__row--width-34" },
          h(
            "div",
            {
              id: "chipsInHand",
              "class": "block__text"
            },
            "Chips: ",
            this.props.playerChips
          )
        ),
        h(
          "div",
          { "class": "block__row--width-33" },
          h(
            "div",
            { "class": "block__text" },
            "Room: game0"
          )
        )
      )
    );
  }
}

module.exports = GettingBetsStateScreen;

},{}],25:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const GettingPlayersStateScreen = function GettingPlayersStateScreen(props) {
  return h(
    "div",
    { "class": "block" },
    h(
      "div",
      { "class": "block block--height-30" },
      h(
        "div",
        { "class": "block__timer" },
        this.props.countdown
      )
    ),
    h(
      "div",
      { "class": "block block--height-40" },
      h(
        "div",
        { "class": "block__text" },
        "Waiting for other players to join..."
      )
    ),
    h("div", { "class": "block block--height-22" }),
    h(
      "div",
      { "class": "block block--height-8 block--rows block--theme-dark" },
      h(
        "div",
        { "class": "block__row--width-33" },
        h(
          "div",
          { "class": "block__text" },
          this.props.playerName
        )
      ),
      h(
        "div",
        { "class": "block__row--width-34" },
        h(
          "div",
          { id: "chipsInHand", "class": "block__text" },
          "Chips: ",
          this.props.playerChips
        )
      ),
      h(
        "div",
        { "class": "block__row--width-33" },
        h(
          "div",
          { "class": "block__text" },
          "Room: game0"
        )
      )
    )
  );
};

module.exports = GettingPlayersStateScreen;

},{}],26:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const MessageLog = function MessageLog(props) {
  // need to reverse the messages without mutating the state
  return h(
    "div",
    { "class": "block block--overflow", id: "messageLog" },
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

},{}],27:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./cardContainer.js');
const PlayerBetDisplayName = require('./playerBetDisplayName.js');
const PlayerBetDisplayCards = require('./playerBetDisplayCards.js');

// render each Bet (amount, cards)

const PlayerBetDisplay = function PlayerBetDisplay(props) {
  const playerNameStyle = {
    fontWeight: `bold`
  };
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return h(
    'div',
    { 'class': props.isCurrentBet ? "block block--height-100 block__text--green_bg" : "block block--height-100" },
    h(PlayerBetDisplayName, {
      name: props.playerName,
      betAmount: props.betAmount,
      isCurrentPlayer: props.isCurrentPlayer }),
    h(PlayerBetDisplayCards, { cards: props.cards })
  )
  /*
  <div style={{ backgroundColor: props.isCurrentBet ? `azure` : `` }}>
    {props.isCurrentPlayer ? 
      <div style={playerNameStyle}>
      <BetStatus betAmount={props.betAmount}/>
      <div>{playerNameText}</div>
      </div> : <div>{playerNameText}</div>}
    {props.cards.map((card) => {
      return <td><Card suit={card.suit} value={card.value} isFaceDown={card.isFaceDown} /></td>;
    })}
  </div>
  */
  ;
};

module.exports = PlayerBetDisplay;

},{"./cardContainer.js":6,"./playerBetDisplayCards.js":28,"./playerBetDisplayName.js":29}],28:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./cardContainer.js');

const PlayerBetDisplayCards = function Deck(props) {
  return h(
    "div",
    { "class": "block block--height-80" },
    h(
      "div",
      { "class": "block__card_container" },
      props.cards.map(card => {
        return h(Card, {
          suit: card.suit,
          value: card.value,
          isFaceDown: card.isFaceDown });
      })
    )
  );
};

module.exports = PlayerBetDisplayCards;

},{"./cardContainer.js":6}],29:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const PlayerBetDisplayName = function Deck(props) {
  return h(
    "div",
    null,
    props.isCurrentPlayer ? h(
      "div",
      { "class": "block block--height-20 block--rows block__text--bold" },
      h(
        "div",
        { "class": "block__row--width-50" },
        props.name
      ),
      props.betAmount ? h(
        "div",
        { "class": "block__row--width-50" },
        "Your bet: ",
        props.betAmount
      ) : h("div", { "class": "block__row--width-50" })
    ) : h(
      "div",
      { "class": "block block--height-20 block--rows" },
      h(
        "div",
        { "class": "block__row--width-50" },
        props.name
      ),
      props.betAmount ? h(
        "div",
        { "class": "block__row--width-50" },
        "Their bet: ",
        props.betAmount
      ) : h("div", { "class": "block__row--width-50" })
    )
  );
};

module.exports = PlayerBetDisplayName;

},{}],30:[function(require,module,exports){
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

},{"./button.js":3}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

class StartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: ''
    };
    this.handleNicknameChange = this.handleNicknameChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      nickname: this.props.playerNickname
    });
  }

  handleNicknameChange(event) {
    console.log(event.target.value);
    this.setState({
      nickname: event.target.value
    });
  }

  render() {
    return h(
      "div",
      { "class": "block" },
      h(
        "div",
        { "class": "block block--height-30" },
        h(
          "div",
          { "class": "block__text" },
          "It looks like you've stumbled onto our Blackjack Lair."
        )
      ),
      h(
        "div",
        { "class": "block block--height-40" },
        h(
          "div",
          { "class": "block__text" },
          "We're giving you the nickname"
        ),
        h(
          "div",
          { "class": "block__input" },
          h("input", {
            "class": "block__textbox",
            type: "text",
            onChange: this.handleNicknameChange,
            value: this.state.nickname,
            placeholder: this.state.nickname || this.props.playerNickname })
        ),
        h(
          "div",
          { "class": "block__text" },
          "because we need to keep you safe and anonymous."
        )
      ),
      h(
        "div",
        { "class": "block block--height-30" },
        h(
          "div",
          { "class": "block__input" },
          h(
            "button",
            { id: "joinGame", "class": "block__button", onClick: () => this.props.joinAndChangeNickname(this.state.nickname) },
            "I want to play!"
          )
        )
      )
    );
  }
}

module.exports = StartScreen;

},{}],33:[function(require,module,exports){
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

// render(<Clock />, document.body);
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

},{"./components/blackjackTable.js":2,"./components/button.js":3,"./components/card":4,"./components/clock":20,"./components/deck":21}]},{},[33]);
