/** @jsx h */
const { h, render, Component } = preact;

const GettingPlayersStateScreen = function GettingPlayersStateScreen(props) {
  return (
    <div class="block">
      <div class="block block--height-30">
        <div class="block__timer">
          {this.props.countdown}
        </div>
      </div>
      <div class="block block--height-40">
        <div class="block__text">
          You are in room <strong>{this.props.roomName}</strong>.
        </div>
        <div class="block__text">
          Waiting for other players to join...
        </div>
        <div class="block__text">
          <button 
            id="joinRoom"
            class="block__button block__button--secondary"
            onClick={() => this.props.createRoom()}
          >
          Join another room
          </button>
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
          <div id="chipsInHand" class="block__text">
            Chips: {this.props.playerChips}
          </div>
        </div>
        <div class="block__row--width-33">
          <div class="block__text">
            Room: {this.props.roomName}
          </div>
        </div>
      </div>
    </div>
  )
}

module.exports = GettingPlayersStateScreen;
