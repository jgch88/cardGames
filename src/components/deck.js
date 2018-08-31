/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./card.js');
const BetStatus = require('./betStatus.js');

// Deck is a collection of cards

const Deck = function Deck(props) {
  const playerNameStyle = {
    fontWeight: `bold`,
  }
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return (
    <div style={{ backgroundColor: props.isCurrentBet ? `azure` : `` }}>
      <BetStatus betAmount={props.betAmount}/>
      {props.isCurrentPlayer ? <div style={playerNameStyle}>{playerNameText}</div> : <div>{playerNameText}</div>}
            { props.cards.map((card) => {
              return <td><Card suit={card.suit} value={card.value} isFaceDown={card.isFaceDown} /></td>;
            }) }
    </div>
  )
}

module.exports = Deck;
