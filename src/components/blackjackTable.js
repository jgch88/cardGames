/** @jsx h */
const { h, render, Component } = preact;

class BlackjackTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dealerCards: [],
      players: [],
    };
    this.socket = props.io;
    console.log(`socket embedded`);
  }

  componentDidMount() {
    this.socket.on('render', ({ dealerCards, players
    }) => {
      console.log(`got socket stuff`);
      this.setState({
        dealerCards,
        players,
      });
    })
  }

  render() {
    return (
      <div>ABC {this.state.dealerCards} {this.state.players}</div>
    );
  }
}

module.exports = BlackjackTable;
