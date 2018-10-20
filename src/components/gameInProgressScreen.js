/** @jsx h */
const { h, render, Component } = preact;

const GameInProgressScreen = function GameInProgressScreen(props) {
  return (
    <div class="block">
      <div class="block block--height-30">
        <div class="block__text">It looks like you've stumbled onto our Blackjack Lair.</div>
      </div>
      <div class="block block--height-40">
        <div class="block__text">A game is currently in progress. Please join the next round... {props.countdown ? props.countdown : ''}</div>
      </div>
      <div class="block block--height-30">
      </div>
    </div>
  )
}

module.exports = GameInProgressScreen;
