/** @jsx h */
const { h, render, Component } = preact;

const PlayerBetDisplayName = function Deck(props) {
  return (
    <div class="block block--height-20">
      <div class={props.isCurrentPlayer ? "block__text--bold" : ""}>
        {props.name}
      </div>
    </div>
  )
}

module.exports = PlayerBetDisplayName;
