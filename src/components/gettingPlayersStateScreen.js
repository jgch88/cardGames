/** @jsx h */
const { h, render, Component } = preact;

class GettingPlayersStateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerCountdown: 10,
      nickname: props.nickname,
    }
    // this.handleBetChange = this.handleBetChange.bind(this);
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({timerCountdown: this.state.timerCountdown - 1})
      if (this.state.timerCountdown === 0) {
        console.log(`Done!`);
        this.props.goToBettingState();
      }
    }, 1000)

  }

  render() {
    return (
      <div class="block">
        <div class="block block--height-30">
          <div class="block__timer">
            {this.state.timerCountdown}
          </div>
        </div>
        <div class="block block--height-40">
          <div class="block__text">
            Waiting for other players to join...
          </div>
        </div>
        <div class="block block--height-22">
        </div>
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
}

module.exports = GettingPlayersStateScreen;
