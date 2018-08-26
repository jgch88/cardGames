/** @jsx h */
const { h, render, Component } = preact;
const Button = require('./button.js');

const PlayerStatus = function PlayerStatus(props) {
  return (
    <div
      class="playerStatus"
    >
      <span id="nickname">{props.playerName}</span>
    {(props.socketId in props.gameState.chipsInHand) &&
      <span id="chipsInHand">Chips: {props.gameState.chipsInHand[props.socketId]}</span>
    }
    </div>
  )
}

module.exports = PlayerStatus;
