/** @jsx h */
const { h, render, Component } = preact;

const PlayerBetDisplayName = function Deck(props) {
  return (
    <div>
      {props.isCurrentPlayer ? 
      <div class="block block--height-20 block--rows block__text--bold">
        <div class="block__row--width-50">
          {props.name}
        </div>
        {props.betAmount ?
        <div class="block__row--width-50">
          Your bet: {props.betAmount}
        </div> :
        <div class="block__row--width-50">
        </div>
        }
      </div> :
      <div class="block block--height-20 block--rows">
        <div class="block__row--width-50">
          {props.name}
        </div>
        {props.betAmount ?
        <div class="block__row--width-50">
          Their bet: {props.betAmount}
        </div> :
        <div class="block__row--width-50">
        </div>
        }
      </div>}
    </div>
  )
}

module.exports = PlayerBetDisplayName;
