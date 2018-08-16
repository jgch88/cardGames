/** @jsx h */
const { h, render, Component } = preact;
const Deck = require('./deck.js');
const Card = require('./card.js');

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
        {this.state.dealerCards.length > 0 ? <h1>Dealer</h1> : ""}
        {this.state.dealerCards.map((card, index) => {
          // update later
          return <Card key={index} value={card.value} suit={card.suit} isFaceDown={card.isFaceDown}/>;
        })}
        <div>{JSON.stringify(this.state.players)}</div>
      </div>
    );
  }
}

module.exports = BlackjackTable;
