/** @jsx h */
const { h, render, Component } = preact;

class GettingBetsStateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      betSlider: 10,
      nickname: props.nickname,
    }
    this.handleBetChange = this.handleBetChange.bind(this);
  }

  handleBetChange(event) {
    console.log(event.target.value);
    this.setState({
      betSlider: event.target.value,
    })
  }

  render() {
    return (
      <div class="block">
        <div class="block block--height-30">
          <div class="block__timer">
            {this.props.countdown}
          </div>
        </div>
        <div class="block block--height-10">
          <div class="block__text">
            How baller ya feelin' right now?
          </div>
        </div>
        <div class="block block--height-15">
          <div class="block__text">
            Place your bet: {this.state.betSlider}
          </div>
          <div class="block__input">
            <input 
              class="block__slider"
              type="range"
              onChange={this.handleBetChange}
              onInput={this.handleBetChange}
              min="0"
              max="100"
              step="2"
              value={this.state.betSlider}
            >
            </input>
          </div>
        </div>
        <div class="block block--height-12">
          <div class="block__text">
            <button 
              class="block__button"
              onClick={() => this.props.placeBet(Number(this.state.betSlider))}
            >
            Place Bet
            </button>
          </div>
        </div>
        <div class="block block--height-25">
          <div class="block block--overflow-y">
            {Object.keys(this.props.bets).map((bet, index) => {
              return <div class="block block--height-25">
                {this.props.bets[bet].nickname} bet {this.props.bets[bet].betAmount} chips.
              </div>
            })}
          </div>
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

module.exports = GettingBetsStateScreen;
