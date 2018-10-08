/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./cardContainer.js');
const PlayerBetDisplayName = require('./playerBetDisplayName.js');
const PlayerBetDisplayCards = require('./playerBetDisplayCards.js');

// render each Bet (amount, cards)

const PlayerBetDisplay = function PlayerBetDisplay(props) {
  const playerNameStyle = {
    fontWeight: `bold`,
  }
  const playerNameText = props.cards.length > 0 ? props.playerName : "";
  return (
    <div class="block block--height-30">
      <PlayerBetDisplayName name={props.playerName} />
      <PlayerBetDisplayCards cards={props.cards} />
    </div>
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
  )
}

module.exports = PlayerBetDisplay;
