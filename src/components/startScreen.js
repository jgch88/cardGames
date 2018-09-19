/** @jsx h */
const { h, render, Component } = preact;
const GameStateStatus = require('./gameStateStatus.js');
const Button = require('./button.js');
const Snack = require('./snack.js');

class StartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
    }
    this.handleNicknameChange = this.handleNicknameChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      nickname: this.props.playerNickname,
    })
  }

  handleNicknameChange(event) {
    console.log(event.target.value);
    this.setState({
      nickname: event.target.value,
    })
  }

  render() {
    return (
      <div class="block">
        <div class="block block--height-30">
          <div class="block__text">It looks like you've stumbled onto our Blackjack Lair.</div>
        </div>
        <div class="block block--height-40">
          <div class="block__text">We're giving you the nickname</div>
          <div class="block__input">
            <input 
              class="block__textbox"
              type="text" 
              onChange={this.handleNicknameChange}
              value={this.state.nickname || this.props.playerNickname}>
            </input>
          </div>
          <div class="block__text">because we need to keep you safe and anonymous.</div>
        </div>
        <div class="block block--height-30">
          <div class="block__input">
            <button class="block__button" onClick={() => this.props.joinAndChangeNickname(this.state.nickname)}>
              I want to play!
            </button>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = StartScreen;
