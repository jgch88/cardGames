/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');
const MessageLog = require('./messageLog.js');
const GameStateStatus = require('./gameStateStatus.js');
const PlayerStatus = require('./playerStatus.js');

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
      this.setState({
        chipsInHand,
      })
    });
    this.socket.on('betAmounts', (betAmounts) => {
      this.setState({
        betAmounts,
      })
    });
    this.socket.on('gameState', ({ gameState }) => {
      this.setState({
        gameState,
      })
    });
    this.socket.on('lastEmittedState', ({ dealerCards, players, messages, gameState, betAmounts, chipsInHand }) => {
      console.log(players, messages, gameState, dealerCards);
      this.setState({
        gameState,
        messages,
        players,
        dealerCards,
        betAmounts,
        chipsInHand
      })
    });
  }

  render() {
    // const pchipsInHand = this.state.chipsInHand[this.socket.id]
    return (
      <div>
        <PlayerStatus playerName={this.socket.id} gameState={this.state}/>
        <Deck playerName='Dealer' key='Dealer' cards={this.state.dealerCards} />
        {Object.keys(this.state.players).map((player, index) => {
          return <Deck isPlayersDeck={this.socket.id === player} playerName={player} key={index} cards={this.state.players[player]} />
        })}
        <MessageLog messages={this.state.messages} />
      <GameStateStatus gameState={this.state.gameState}/>
      </div>
    );
  }
}

module.exports = BlackjackTable;
