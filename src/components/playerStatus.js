/** @jsx h */
const { h, render, Component } = preact;
const Button = require('./button.js');

const PlayerStatus = function PlayerStatus(props) {
  return (
    <div
      class="playerStatus"
    >
      <span>{props.playerName}</span>
    {(props.socketId in props.gameState.chipsInHand) &&
      <span>Chips: {props.gameState.chipsInHand[props.socketId]}</span>
    }
    </div>
  )
}

module.exports = PlayerStatus;
