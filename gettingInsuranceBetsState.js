const dealerHasBlackjackState = require('./dealerHasBlackjackState.js');
const dealerNoBlackjackState = require('./dealerNoBlackjackState.js');

const gettingInsuranceBetsState = {
  async init(game) {
    // this state will transit to dealerBlackjack/dealerNoBlackjack
    // after getting all insurance bet decisions
    const greeting = `[State]: Getting insurance bets`;
    this.game = game;
    this.game.sendMessageLogMessages(greeting);
    this.name = 'gettingInsuranceBetsState';
    console.log(`waiting for insurance bets`);
    // this insuranceBets property is created here and resolves within this state
    // don't add an unncessary 'resolved' property
    this.game.insuranceBets = this.game.bets.map(bet => {
      let betResolve;
      let betReject;
      const insuranceBetPromise = new Promise((resolve, reject) => {
        betResolve = resolve;
        betReject = reject;
      });
      return {
        player: bet.player,
        name: bet.player.name,
        amount: 0,
        insuranceBetPromise,
        betResolve,
        betReject,
      }
    })
    console.log(this.game.insuranceBets);
    // this.insuranceBets = await this.waitForAllInsuranceBets();
    // await this.waitForAllInsuranceBets();
    await this.raceAllBetPromisesWithTimer().then((raceWinner) => {
      console.log(`Promise race winner:`, raceWinner);
    });
    console.log(`all insurance bets gotten`, this.game.insuranceBets);
    // branch to dealerNoBlackjack or dealerBlackjack
    this.checkIfDealerHasBlackjack();
  },
  joinGame() {
  },
  leaveGame() {
  },
  changeNickname() {
  },
  placeBet() {
  },
  play() {
  },
  placeInsuranceBet(playerName, amount, game) {
    console.log(`[${playerName}]: Placed insurance bet ${amount} chips`);
    const bet = this.game.bets.find(bet => bet.player.name === playerName);
    if (!bet) {
      throw `${playerName} did not place a bet!`;
    }
    if (amount > (bet.betAmount / 2)) {
      throw `${playerName} cannot bet more than half the original bet`;
    }
    if (amount < 0) {
      throw `${playerName} cannot bet negative amounts`;
    }
    // max insurance bet amount is half
    bet.player.chips -= amount;
    this.game.dealer.chips += amount;
    const insuranceBet = this.game.insuranceBets.find(insuranceBet => insuranceBet.name === playerName);
    insuranceBet.amount = amount;
    insuranceBet.betResolve(`${playerName} placed insurance bet and promise resolved`);
    // emit a message to all players and expect a response within 30s?
  },
  // the function returning a promise doesn't need to be async
  raceAllBetPromisesWithTimer() {
    betPromises = Promise.all(this.game.insuranceBets.map(insuranceBet => insuranceBet.insuranceBetPromise));
    console.log(`betPromises`, betPromises);
      /* .then((promises) => {
      console.log(`All Insurance Bets Placed`)
    });
    */

    const timerDuration = 3000;
    console.log(`Waiting ${timerDuration}ms for insurance bets to be placed.`);
    const timerPromise = new Promise((resolve) => {
      setTimeout(resolve, timerDuration, 'Insurance bet timeout');
    })
    const race = Promise.race([betPromises, timerPromise]);
    console.log(`race`, race);
    return race;
  },
  async waitForAllInsuranceBets() {
    // i'm not actually using this... bets.all, i'm actually just using the timer.
    const timer = 3000;
    console.log(`Waiting ${timer}ms for insurance bets to be placed.`);
    /*
    let insuranceBetPromises = this.game.bets.map(bet => new Promise((resolve, reject) => {
      setTimeout(resolve, 5000, `insurance bet timeout`);
      // each bet access a state?
    }));
    return await Promise.all(insuranceBetPromises).then(bets => {
      return bets;
    });
    */
    return new Promise((resolve, reject) => {
      setTimeout(resolve, timer, `Insurance bet timeout`);
    })
  },
  checkIfDealerHasBlackjack() {
    const dealer = this.game.dealer;
    if ([1, 10, 11, 12, 13].indexOf(dealer.hand.cards[0].value) !== -1) {
      this.game.sendMessageLogMessages(`[Dealer]: Has a 10 card/Ace.`);
      if (dealer.score === 21) {
        dealer.hand.cards[1].turnFaceUp();
        this.game.sendMessageLogMessages(`[Dealer]: Has a Blackjack!`);
        // resolve all insurance plays
        // if insurance betamount > 0 log the message, payout some chips
        this.game.sendMessageLogMessages(`[Dealer]: Resolving insurance bets`);
        this.game.insuranceBets.map(insuranceBet => {
          if (!(insuranceBet.amount === 0)) {
            this.game.sendMessageLogMessages(`[${insuranceBet.player.nickname}]: Wins insurance bet`);
            insuranceBet.player.chips += (insuranceBet.amount * 3);
            this.game.dealer.chips -= (insuranceBet.amount * 3);
            this.game.emitCurrentChipsInHand();
            console.log(insuranceBet.player.chips, this.game.dealer.chips);
          }
        })
        this.game.changeState(dealerHasBlackjackState);
      } else {
        this.game.sendMessageLogMessages(`[Dealer]: Has no Blackjack. Insurance bets collected by the house.`);
        this.game.changeState(dealerNoBlackjackState);
      }
    } else {
      this.game.changeState(dealerNoBlackjackState);
    }
  }
}

module.exports = gettingInsuranceBetsState;
