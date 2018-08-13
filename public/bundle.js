(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

// Card component states:
// 1. value
// 2. suit
// 3. isFaceDown

const Card = function Card(props) {
  return h(
    "table",
    null,
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h(
          "th",
          null,
          props.isFaceDown ? "" : props.suit
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
          props.isFaceDown ? "" : props.value
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

},{}],2:[function(require,module,exports){
/** @jsx h */
const { h, render, Component } = preact;

const Card = require('./components/card');

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

render(h(Clock, null), document.body);
render(h(Card, { suit: "Spades", value: 1, isFaceDown: false }), document.body);

},{"./components/card":1}]},{},[2]);
