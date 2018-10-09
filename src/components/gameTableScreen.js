/** @jsx h */
const { h, render, Component } = preact;
const PlayerBetDisplay = require('./playerBetDisplay.js');

const GameTableScreen = function GameTableScreen(props ){

  /*
  playHit() {

  }

  playStand() {

  }
  */

  return (
    <div class="block">
      <div class="block block--height-8">
      </div>
        <PlayerBetDisplay playerName='Dealer' key='Dealer' cards={props.dealerCards} />
        <div class="block__overflow">
        {Object.keys(props.bets).map((bet,index) => {
          return <PlayerBetDisplay 
            betAmount={props.bets[bet].betAmount} 
            isCurrentPlayer={props.players[props.socket.id] ? props.bets[bet].nickname === props.players[props.socket.id].nickname : ``}
            isCurrentBet={props.currentBet === bet} 
            playerName={props.bets[bet].nickname} 
            key={index} 
            cards={props.bets[bet].cards} />
        })}
        </div>
      <div class="block block--height-24">
      </div>
      <div class="block block--height-8">
      </div>
    </div>
  )
}

module.exports = GameTableScreen;
