/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');
const MessageLog = require('./messageLog.js');
const GameStateStatus = require('./gameStateStatus.js');
const PlayerStatus = require('./playerStatus.js');
const Button = require('./button.js');
const BetStatus = require('./betStatus.js');

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
    };
    this.socket = props.io;
    console.log(`socket embedded`);
  }

  componentDidMount() {
    this.socket.emit('newSocketReady');
    console.log('ready');
    console.log(this.state.chipsInHand);
    this.socket.on('render', ({ dealerCards, players }) => {
      console.log(`got socket stuff`);
      console.log(`got players ${JSON.stringify(players)}`);
      this.setState({
        dealerCards,
        players,
      });
    });
    this.socket.on('message', ({ messages }) => {
      this.setState({
        messages,
      })
    });
    this.socket.on('chipsInHand', (chipsInHand) => {
      console.log(chipsInHand);
      // const newChipsInHand = Object.assign(this.state.chipsInHand, chipsInHand);
      // console.log(newChipsInHand);
      // build new state in blackjackEventLoop.
      this.setState({
        chipsInHand,
      })
    });
    this.socket.on('betAmounts', (betAmounts) => {
      this.setState({
        betAmounts,
      })
      console.log(betAmounts);
    });
    this.socket.on('gameState', ({ gameState }) => {
      this.setState({
        gameState,
      })
    });
    // this.socket.on('lastEmittedState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand }) => {
    this.socket.on('currentState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand }) => {
      this.setState({
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand
      });
      console.log('currentState', {
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand
      });
    });
    this.joinGame = () => {
      const chips = window.prompt("How many chips would you like to exchange?", 500);
      console.log(chips);
      this.socket.emit('joinGame', {chips: Number(chips)});
    };
    this.placeBet = () => {
      const chips = window.prompt("How many chips would you like to bet?", 10);
      console.log(chips);
      this.socket.emit('placeBet', {chips: Number(chips)});
    };
    this.hit = () => {
      this.socket.emit('play', 'hit');
    };
    this.stand = () => {
      this.socket.emit('play', 'stand');
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
    this.changeNickname = () => {
      const nickname = window.prompt("What nickname would you like to display?");
      this.socket.emit('changeNickname', nickname);
    };
  }
  
  betAmount() {
    if (this.socket.id in this.state.betAmounts) {
      return this.state.betAmounts[this.socket.id];
    }
  }

  render() {
    // const pchipsInHand = this.state.chipsInHand[this.socket.id]
    return (
      <div class="deckTable">
        <PlayerStatus playerName={this.socket.id} gameState={this.state}/>
        <Deck playerName='Dealer' key='Dealer' cards={this.state.dealerCards} />
        <BetStatus chips={this.betAmount()} />
        <div class="horizontalScroll playerHands">
        {Object.keys(this.state.players).map((player, index) => {
          return <Deck isPlayersDeck={this.socket.id === player} playerName={this.state.players[player].nickname} key={index} cards={this.state.players[player].cards} />
        })}
        </div>
        <div class="actions">
          {this.state.gameState === 'gettingPlayersState' && !(this.playerHasJoined()) ? 
          <Button text={"Join Game"} id={"joinGame"} clickHandler={this.joinGame}/> : ''}
          {this.state.gameState === 'gettingPlayersState' && (this.socket.id in this.state.chipsInHand) ? 
          <span><Button text={"Change name"} clickHandler={this.changeNickname}/><Button text={"Next"} clickHandler={this.goToBettingState}/></span> : ''}
          {this.state.gameState === 'gettingBetsState' && this.playerHasJoined() && !this.playerHasBet() ? 
          <Button text={"Place Bet"} clickHandler={this.placeBet}/> : ''}
          {this.state.gameState === 'gettingBetsState' && this.playerHasJoined() && this.playerHasBet() ? 
          <Button text={"Start Round"} clickHandler={this.goToCheckDealerForNaturalsState}/> : ''}
          {this.state.gameState === 'dealerNoBlackjackState' ? 
          <div><Button text={"Hit"} clickHandler={this.hit}/><Button text={"Stand"} clickHandler={this.stand}/></div> : ''}
          
        </div>
        MessageLog
        <div class="messageLog">
          <MessageLog messages={this.state.messages} />
        </div>
      <GameStateStatus gameState={this.state.gameState}/>
      </div>
    );
  }
}

module.exports = BlackjackTable;
