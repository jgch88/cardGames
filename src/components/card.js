/** @jsx h */
const { h, render, Component } = preact;

// Card component states:
// 1. value
// 2. suit
// 3. isFaceDown

// Decided to use functional components because
// we don't want the players to manage state at all!
// That would be the server's responsibility.
const Card = function Card(props) {
  return (
    <table class="card">
      <thead>
        <tr>
          <th>{props.isFaceDown ? "Face Down" : props.suit}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.isFaceDown ? "---" : props.value}</td>
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
