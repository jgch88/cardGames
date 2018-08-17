/** @jsx h */
const { h, render, Component } = preact;

// Card component states:
// 1. value
// 2. suit
// 3. isFaceDown

// for a better rendering
const values = {
  1: "Ace",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "Jack",
  12: "Queen",
  13: "King"
}

const suits = {
  "Clubs": "\u2663",
  "Diamonds": "\u2666",
  "Hearts": "\u2665",
  "Spades": "\u2660"
}

// Decided to use functional components because
// we don't want the players to manage state at all!
// That would be the server's responsibility.
const Card = function Card(props) {
  return (
    <table class="card">
      <thead>
        <tr>
          <th>{props.isFaceDown ? "Face Down" : suits[props.suit]}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.isFaceDown ? "---" : values[props.value]}</td>
        </tr>
      </tbody>
    </table>
  )
}

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
