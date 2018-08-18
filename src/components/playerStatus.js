/** @jsx h */
const { h, render, Component } = preact;

const PlayerStatus = function PlayerStatus(props) {
  const playerStatus = {
    name: 'abc',
    chips: '123',
  };
  return (
    <div
      class="playerStatus"
    >
      <span>PlayerName</span>
      <span>Chips: 1000</span>
    </div>
  )
}

module.exports = PlayerStatus;
