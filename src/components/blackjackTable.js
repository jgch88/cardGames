/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');
const MessageLog = require('./messageLog.js');

class BlackjackTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dealerCards: [],
      players: {},
    };
    this.socket = props.io;
    console.log(`socket embedded`);
  }

  componentDidMount() {
    this.socket.on('render', ({ dealerCards, players
    }) => {
      console.log(`got socket stuff`);
      console.log(`got players ${JSON.stringify(players)}`);
      this.setState({
        dealerCards,
        players,
      });
    })
  }

  render() {
    return (
      <div>
        <Deck playerName='Dealer' key='Dealer' cards={this.state.dealerCards} />
        {Object.keys(this.state.players).map((player, index) => {
          return <Deck isPlayersDeck={this.socket.id === player} playerName={player} key={index} cards={this.state.players[player]} />
        })}
        <MessageLog messages={['a', 'b']} />
      </div>
    );
  }
}

module.exports = BlackjackTable;
