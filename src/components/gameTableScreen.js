/** @jsx h */
const { h, render, Component } = preact;
const PlayerBetDisplay = require('./playerBetDisplay.js');

const GameTableScreen = function GameTableScreen(props) {

  return (
    <div class="block">
      <div class="block block--height-8">
      </div>
      <div class="block block--height-30">
        <PlayerBetDisplay playerName='Dealer' key='Dealer' cards={props.dealerCards} />
      </div>
      <div class="block block--height-30">
        <div class="block block--overflow-y">
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
      </div>
      {props.gameState === 'gettingInsuranceBetsState' &&
      <div class="block block--height-24">
        <div class="block__input">
          <button 
            class="block__button"
            onClick={() => {this.props.placeInsuranceBet()}}
          >
          Buy Insurance
          </button>
          <button 
            class="block__button"
            onClick={() => {this.props.dontPlaceInsuranceBet()}}
          >
          Don't Buy Insurance
          </button>
        </div>
      </div>
      }
      {props.isPlayersTurn ?
      <div class="block block--height-24">
        <div class="block__input">
          <button 
            class="block__button"
            onClick={() => {this.props.playHit()}}
          >
          Hit
          </button>
          <button 
            class="block__button"
            onClick={() => {this.props.playStand()}}
          >
          Stand
          </button>
          {props.playerCanSplit &&
          <button 
            class="block__button"
            onClick={() => {this.props.playSplit()}}
          >
          Split
          </button>
          }
        </div>
      </div>
      :
      <div class="block block--height-24">
        {props.currentBet ?
        `It is ${props.bets[props.currentBet].nickname}'s turn. Please wait...`
        :
        `Round over... next round in ${props.countdown}`
        }
      </div>
      }
      <div class="block block--height-8 block--rows block--theme-dark">
        <div class="block__row--width-33">
          <div class="block__text">
            {this.props.playerName}
          </div>
        </div>
        <div class="block__row--width-34">
          <div class="block__text">
            Chips: {this.props.playerChips}
          </div>
        </div>
        <div class="block__row--width-33">
          <div class="block__text">
            Room: game0
          </div>
        </div>
      </div>
    </div>
  )
}

module.exports = GameTableScreen;
