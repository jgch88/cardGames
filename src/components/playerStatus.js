/** @jsx h */
const { h, render, Component } = preact;

const PlayerStatus = function PlayerStatus(props) {
  return (
    <div
      class="playerStatus"
    >
      <span>{props.playerName}</span>
    {Object.keys(props.gameState.chipsInHand).length > 0 &&
      <span>Chips: {props.gameState.chipsInHand[props.playerName]}</span>
    }
    </div>
  )
}

module.exports = PlayerStatus;
