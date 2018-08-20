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
  const borderStyle = {
    width: '52px',
    height: '91px',
    border: '1px solid black',
  };
  const centerStyle = {
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'relative',
    top: '50',
    translate: 'translateY(-50%)',
  };
  const redHexColourStyle = {
    color: '#D30000',
  };
  return (
    <div style={borderStyle}>
      <div style={(props.suit == "Hearts" || props.suit == "Diamonds") ? Object.assign(redHexColourStyle, centerStyle) : centerStyle}>
        <div style={centerStyle}>
          {props.isFaceDown ? "Face Down" : suits[props.suit]}
        </div>
        <div>
        {props.isFaceDown ? "-" : values[props.value]}
        </div>
      </div>
    </div>
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
