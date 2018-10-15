/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');
const MessageLog = require('./messageLog.js');
const GameStateStatus = require('./gameStateStatus.js');
const PlayerStatus = require('./playerStatus.js');
const Button = require('./button.js');
const BetStatus = require('./betStatus.js');
const Snack = require('./snack.js');
const StartScreen = require('./startScreen.js');
const GettingBetsStateScreen = require('./gettingBetsStateScreen.js');
const GettingPlayersStateScreen = require('./gettingPlayersStateScreen.js');
const GameTableScreen = require('./gameTableScreen.js');
const GameInProgressScreen = require('./gameInProgressScreen.js');

class BlackjackTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dealerCards: [],
      players: {},
      messages: [],
      gameState: '',
      chipsInHand: {},
      betAmounts: {},
      insuranceBetAmounts: {},
      bets: {},
      currentBet: '',
      mySocketId: '',
      countdown: '',
      roomName: '',
    };
    this.socket = props.io;
    console.log(`socket embedded`);
  }

  componentDidMount() {
    this.socket.emit('newSocketReady');
    console.log('ready');
    this.socket.on('currentState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand, bets, currentBet, insuranceBetAmounts, countdown, roomName }) => {
      this.setState({
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand,
        bets,
        currentBet,
        insuranceBetAmounts,
        countdown,
        roomName,
      });
      this.setState({
        mySocketId: this.socket.id,
      });
      console.log('currentState', {
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand,
        bets,
        currentBet,
        insuranceBetAmounts,
        countdown,
        roomName,
      });
    });
    this.socket.on('emitError', (message) => {
      console.log(message);
      this.showError(message);
    });
    this.joinGame = () => {
      const chips = window.prompt("How many chips would you like to exchange?", 500);
      console.log(chips);
      this.socket.emit('joinGame', {chips: Number(chips)});
    };
    this.showError = (message) => {
      const snack = document.getElementById("snackbar");
      this.setState({
        errorMessage: message
      });
      snack.className = "show";
      setTimeout(() => {snack.className = snack.className.replace("show", "")}, 4000);
    };
    this.placeBet = (chips) => {
      // const chips = window.prompt("How much would you like to bet?", 10);
      this.socket.emit('placeBet', {chips: Number(chips)});
    };
    this.placeInsuranceBet = () => {
      const chips = window.prompt("Would you like to place an insurance bet? (Max: half your original bet)", 10);
      this.socket.emit('placeInsuranceBet', {chips: Number(chips)});
    };
    this.dontPlaceInsuranceBet = () => {
      this.socket.emit('placeInsuranceBet', {chips: Number(0)});
    }
    this.hit = () => {
      this.socket.emit('play', 'hit');
    };
    this.stand = () => {
      this.socket.emit('play', 'stand');
    };
    this.split = () => {
      this.socket.emit('play', 'split');
    };
    this.goToBettingState = () => {
      this.socket.emit('changeState', 'gettingBetsState');
      this.setState({
        betAmounts: {}
      })
    };
    this.goToCheckDealerForNaturalsState = () => {
      this.socket.emit('changeState', 'checkDealerForNaturalsState');
    };
    this.playerHasJoined = () => {
      return this.socket.id in this.state.chipsInHand;
    };
    this.playerHasBet = () => {
      return this.socket.id in this.state.betAmounts;
    };
    this.playerHasBetInsurance = () => {
      return this.socket.id in this.state.insuranceBetAmounts;
    };
    this.changeNickname = () => {
      const nickname = window.prompt("What nickname would you like to display?");
      this.socket.emit('changeNickname', nickname);
    };
    this.joinAndChangeNickname = (nickname) => {
      this.socket.emit('joinAndChangeNickname', {chips: Number(1000)}, (data) => {
        console.log(data);
        if (nickname && this.socket.id !== nickname) {
          this.socket.emit('changeNickname', nickname);
        }
      });

    };
    this.createRoom = () => {
      const roomName = window.prompt("Which room would you like to create?", `Game1`);
      this.socket.emit('createRoom', roomName);
    };
    this.joinRoom = () => {
      const roomName = window.prompt("Which room would you like to join?", `Game0`);
      this.socket.emit('joinRoom', roomName);
    };
  }
  
  betAmount() {
    if (this.socket.id in this.state.betAmounts) {
      return this.state.betAmounts[this.socket.id];
    }
  }
  
  isPlayersTurn() {
    if (!(this.state.gameState === 'dealerNoBlackjackState')) {
      return false;
    }
    if (this.state.players[this.socket.id] && this.state.currentBet) {
      if (this.state.bets[this.state.currentBet].nickname === this.state.players[this.socket.id].nickname) {
        return true;
      }
    }
    return false;
  }

  playerCanSplit() {
    if (this.isPlayersTurn()) {
      if (this.state.bets[this.state.currentBet].cards.length === 2) {
        // this was erroring due to the cards[1] value being checked immediately after splitting hands
        if (this.state.bets[this.state.currentBet].cards[0].value === this.state.bets[this.state.currentBet].cards[1].value) {
          return true;
        }
      }
    }
    return false;
  }

  render() {
    return (
      <div>
        {this.state.gameState === 'gettingPlayersState' && !(this.socket.id in this.state.players)? 
        <StartScreen playerNickname={this.state.mySocketId} joinAndChangeNickname={this.joinAndChangeNickname}/> : ''}
        {this.state.gameState === 'gettingPlayersState' && (this.socket.id in this.state.players)? 
        <GettingPlayersStateScreen 
          playerName={this.state.players[this.socket.id].nickname} 
          playerChips={this.state.chipsInHand[this.socket.id]}
          countdown={this.state.countdown}
          roomName={this.state.roomName}
          createRoom={this.createRoom}
        /> : ''}
        {this.state.gameState !== 'gettingPlayersState' && !(this.socket.id in this.state.players)?
        <GameInProgressScreen
          joinAndChangeNickname={this.joinAndChangeNickname}
        /> : ''}
        {this.state.gameState === 'gettingBetsState' && (this.socket.id in this.state.players)? 
        <GettingBetsStateScreen 
          playerName={this.state.players[this.socket.id].nickname} 
          playerChips={this.state.chipsInHand[this.socket.id]}
          placeBet={this.placeBet}
          countdown={this.state.countdown}
          bets={this.state.bets}
          roomName={this.state.roomName}
        /> : ''}
        {(this.state.gameState === 'dealerNoBlackjackState' || this.state.gameState === 'gettingInsuranceBetsState' || this.state.gameState === 'resolveState') && (this.socket.id in this.state.players)? 
        <GameTableScreen
          gameState={this.state.gameState}
          playerName={this.state.players[this.socket.id].nickname} 
          playerChips={this.state.chipsInHand[this.socket.id]}
          countdown={this.state.countdown}
          bets={this.state.bets}
          players={this.state.players}
          socket={this.socket}
          currentBet={this.state.currentBet}
          dealerCards={this.state.dealerCards}
          isPlayersTurn={this.isPlayersTurn()}
          playerCanSplit={this.playerCanSplit()}
          playHit={this.hit}
          playStand={this.stand}
          playSplit={this.split}
          placeInsuranceBet={this.placeInsuranceBet}
          dontPlaceInsuranceBet={this.dontPlaceInsuranceBet}
          roomName={this.state.roomName}
        /> : ''}
        <Snack message={this.state.errorMessage} />
      </div>
    )
    
    /*
      <div class="app">
        <div class="block">
          <div class="block block--rows block--height-8 actions">
            {this.state.gameState === 'gettingInsuranceBetsState' && !this.playerHasBetInsurance() ?
              <span><Button id="placeInsuranceBet" text={"Insurance"} clickHandler={this.placeInsuranceBet}/>
              <Button id="dontPlaceInsuranceBet" text={"No Insurance"} clickHandler={this.dontPlaceInsuranceBet}/></span> : ''}
            </div>
          </div>
        <div class="block block--height-4">MessageLog</div>
        <div class="block block--height-22">
          <MessageLog messages={this.state.messages} />
        </div>
        <div class="block block--height-4">
          <GameStateStatus gameState={this.state.gameState}/>
        </div>
      </div>
      <Snack message={this.state.errorMessage} />
      </div>
        :''}
    */

    
    /*
    return (
      <div class="app">
        <div class="block">
        <div class="block block--rows block--height-8 actions">
          <Button text={"Create room"} id={"createRoom"} clickHandler={this.createRoom}/>
          <Button text={"Join room"} id={"joinRoom"} clickHandler={this.joinRoom}/>
        </div>
        <div class="block block--height-4">
          <PlayerStatus playerName={this.state.players[this.socket.id] ? this.state.players[this.socket.id].nickname : this.socket.id} gameState={this.state} socketId={this.socket.id}/>
        </div>
        <div class="block block--height-50">
          <Deck playerName='Dealer' key='Dealer' cards={this.state.dealerCards} />
          <div class="block block--overflow" id="playerHands">
          {Object.keys(this.state.bets).map((bet, index) => {
            return <Deck 
              betAmount={this.state.bets[bet].betAmount} 
              isCurrentPlayer={this.state.players[this.socket.id] ? this.state.bets[bet].nickname === this.state.players[this.socket.id].nickname : ``}
              isCurrentBet={this.state.currentBet === bet} 
              playerName={this.state.bets[bet].nickname} 
              key={index} 
              cards={this.state.bets[bet].cards} />
          })}
          </div>
        </div>
          <div class="block block--rows block--height-8 actions">
            {this.state.gameState === 'gettingPlayersState' && !(this.playerHasJoined()) ? 
            <Button text={"Join Game"} id={"joinGame"} clickHandler={this.joinGame}/> : ''}
            {this.state.gameState === 'gettingPlayersState' && (this.socket.id in this.state.chipsInHand) ? 
            <span><Button id="changeName" text={"Change name"} clickHandler={this.changeNickname}/><Button id="goToBettingState" text={"Next"} clickHandler={this.goToBettingState}/></span> : ''}
            {this.state.gameState === 'gettingBetsState' && this.playerHasJoined() ? 
            <Button id="placeBet" text={"Place Bet"} clickHandler={this.placeBet}/> : ''}
            {this.state.gameState === 'gettingBetsState' && this.playerHasJoined() && this.playerHasBet() ? 
            <Button id="startRound" text={"Start Round"} clickHandler={this.goToCheckDealerForNaturalsState}/> : ''}
            <div>
            {this.state.gameState === 'dealerNoBlackjackState' && this.isPlayersTurn() ? 
              <span><Button id="playHit" text={"Hit"} clickHandler={this.hit}/>
              <Button id="playStand" text={"Stand"} clickHandler={this.stand}/></span> : ''}
            {this.playerCanSplit() ?
              <Button id="playSplit" text={"Split"} clickHandler={this.split}/> : ''}
            {this.state.gameState === 'gettingInsuranceBetsState' && !this.playerHasBetInsurance() ?
              <span><Button id="placeInsuranceBet" text={"Insurance"} clickHandler={this.placeInsuranceBet}/>
              <Button id="dontPlaceInsuranceBet" text={"No Insurance"} clickHandler={this.dontPlaceInsuranceBet}/></span> : ''}
            </div>
          </div>
        <div class="block block--height-4">MessageLog</div>
        <div class="block block--height-22">
          <MessageLog messages={this.state.messages} />
        </div>
        <div class="block block--height-4">
          <GameStateStatus gameState={this.state.gameState}/>
        </div>
      </div>
      <Snack message={this.state.errorMessage} />
      </div>
    );
    */
    
  }
}

module.exports = BlackjackTable;
