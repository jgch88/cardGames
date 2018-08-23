/** @jsx h */
const { h, render, Component } = preact;
const Button = require('./button.js');

const PlayerStatus = function PlayerStatus(props) {
  return (
    <div
      class="playerStatus"
    >
      <span>{props.playerName}</span><Button text={"Change nickname"} clickHandler={props.changeNicknameHandler} />
    {(props.playerName in props.gameState.chipsInHand) &&
      <span>Chips: {props.gameState.chipsInHand[props.playerName]}</span>
    }
    </div>
  )
}

module.exports = PlayerStatus;
