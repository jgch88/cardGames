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
            120
          </div>
        </div>
        <div class="block block--height-10">
          <div class="block__text">
            How baller ya feelin' right now?
          </div>
        </div>
        <div class="block block--height-15">
          <div class="block__text">
            Place your bet
          </div>
          <div class="block__input">
            <input 
              class="block__slider"
              type="range"
              onChange={this.handleBetChange}
              min="0"
              max="100"
              step="2"
              value={this.state.betSlider}
            >
            </input>
          </div>
        </div>
        <div class="block block--height-25">
        </div>
        <div class="block block--height-12">
        </div>
        <div class="block block--height-8 block--rows block--theme-dark">
          <div class="block__row--width-33">
            <div class="block__text">
              asdf
            </div>
          </div>
          <div class="block__row--width-34">
      a
          </div>
          <div class="block__row--width-33">
      aa
          </div>
        </div>
      </div>
    )
  }
}

module.exports = GettingBetsStateScreen;