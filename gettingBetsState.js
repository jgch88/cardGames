const Bet = require('./bet.js');
//const checkDealerForNaturalsState = require('./checkDealerForNaturalsState.js');

const TIMER_COUNTDOWN = 5;

const gettingBetsState = {
  init(game) {
    this.game = game;
    this.game.addMessageToMessageLog(`[State]: Getting bets`);
    this.name = 'gettingBetsState';
    this.game.countdown = TIMER_COUNTDOWN;
    this.betCountdown = setInterval(() => {
      this.game.countdown -= 1;
      this.game.gameDataChanged();
      // console.log(`${this.game.countdown}`);
      if (this.game.countdown === 0) {
        if (this.game.players.length !== 0) {
          this.game.changeState(require('./checkDealerForNaturalsState.js'));
          clearInterval(this.betCountdown);
        } else {
          this.game.countdown = TIMER_COUNTDOWN;
          this.game.gameDataChanged();
        }
      }
    }, 1000)
  },
  joinGame() {
    throw `Betting has started! Join the next round`;
  },
  leaveGame() {
  },
  changeNickname() {
  },
  placeBet(playerName, betAmount, game) {

    if (betAmount <= 0) {
      throw `Please bet at least 1 chip.`;
    }
    if (betAmount % 2 !== 0) {
      // so that blackjack 1.5x payouts are whole numbers
      throw `Please bet an even number of chips.`;
    }
    const player = game.players.find(player => player.name === playerName);
    if (!player) {
      throw `${playerName} not found, exchange some chips and join the game first.`;
    }
    if (betAmount > player.chips) {
      throw `Not enough chips`;
    }
    const bet = player.placeBet(betAmount);
    this.game.bets.push(bet);

    this.game.addMessageToMessageLog(`[${player.nickname}]: Bet ${betAmount} chips`);
   
    // this.game.getPlayerChipsInHand();
    // this.game.getPlayerBetAmounts();
    
    // this method is doing too much?
    // 1. checking if player can bet
    // 2. creating bet object
    // 3. emitting bet state to front end: playerchips/messages/betamounts
  },
  play() {
    throw `Betting is in progress. Please be patient`;
  }
}

module.exports = gettingBetsState;
