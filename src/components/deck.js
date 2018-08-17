/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./card.js');

// Deck is a collection of cards

const Deck = function Deck(props) {
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return (
    <div class="horizontalScroll">
      {props.isPlayersDeck ? <h3>{playerNameText}</h3> : <div>{playerNameText}</div>}
      <table>
        <tbody>
          <tr>
            { props.cards.map((card) => {
              return <td><Card suit={card.suit} value={card.value} isFaceDown={card.isFaceDown} /></td>;
            }) }
          </tr>
        </tbody>
      </table>
    </div>
  )
}

module.exports = Deck;
