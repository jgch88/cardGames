/** @jsx h */
const { h, render, Component } = preact;
const Card = require('./cardContainer.js');

const PlayerBetDisplayCards = function Deck(props) {
  return (
    <div class="block block--height-75">
      <div class="block__card_container">
      {props.cards.map(card => {
        return <Card
          suit={card.suit}
          value={card.value}
          isFaceDown={card.isFaceDown} />
      })}
      </div>
    </div>
  )
}

module.exports = PlayerBetDisplayCards;
