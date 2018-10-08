/** @jsx h */
const { h, render, Component } = preact;

const PlayerBetDisplayName = function Deck(props) {
  return (
    <div class="block block--height-25">
      {props.name}
    </div>
  )
}

module.exports = PlayerBetDisplayName;
