/** @jsx h */
const { h, render, Component } = preact;

const GameStateStatus = function GameStateStatus(props) {
  const gameStates = {
    gettingPlayersState: 'Waiting for Players to join',
    gettingBetsState: 'Waiting for bets to be placed',
  };
  let renderedState = gameStates[props.gameState] ? gameStates[props.gameState] : props.gameState;
  return (
    <div
      class="gameStateStatus"
    >
      {renderedState}
    </div>
  )
}

module.exports = GameStateStatus;
