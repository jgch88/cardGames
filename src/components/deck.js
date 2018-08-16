/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./card.js');

// Deck is a collection of cards

const Deck = function Deck(props) {
  return (
    <div class="horizontalScroll">
      <div>{ props.cards.length > 0 ? props.playerName : "" }</div>
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
