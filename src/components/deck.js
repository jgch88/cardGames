/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./card.js');

// Deck is a collection of cards

const Deck = function Deck(props) {
  const playerNameStyle = {
    fontWeight: `bold`,
  }
  const cardWidthStyle = {
  }
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return (
    <div>
      {props.isPlayersDeck ? <div style={playerNameStyle}>{playerNameText}</div> : <div>{playerNameText}</div>}
            { props.cards.map((card) => {
              return <td><Card suit={card.suit} value={card.value} isFaceDown={card.isFaceDown} /></td>;
            }) }
    </div>
  )
}

module.exports = Deck;
