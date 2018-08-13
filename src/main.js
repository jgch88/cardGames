/** @jsx h */
const { h, render, Component } = preact;

const Card = require('./components/card');
const Deck = require('./components/deck');

class Clock extends Component {
  constructor() {
    super();
    this.state.time = Date.now();
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ time: Date.now() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render(props, state) {
    let time = new Date(state.time).toLocaleTimeString();
    return <span>{ time }</span>;
  }
}

render(<Clock />, document.body);
render(<Card suit={"Spades"} value={1} isFaceDown={false} />, document.body);
render(<Deck 
  cards={[
    <Card suit={"Spades"} value={1} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
  ]}
/>, document.body);

