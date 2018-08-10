const Deck = require('./deck.js');
const BlackjackHand = require('./blackjackHand.js');
const Player = require('./player.js');
const input = require('./input.js');
// not really sure what a game engine was for, so 
// tried to just build the game right here instead
// of trying to abstract so much


// there's probably some kind of turn based state
// we need to maintain via the event loop in JS

// Rules: www.bicyclecards.com/how-to-play/blackjack

// actors: dealer, player
// cards: standard 52 card pack (or 6 packs of 312 cards)
// goal: get as high, as close to 21 as possible without going over 21
//  highest hand of the round wins
// values: ace: 1 / 11, face cards are 10, other cards are pip values
// bet: min/max bet, generally $2 - $500
// phases:
//  1. shuffle/cut. place "plastic insert" to mark next shuffle (which occurs after the current round)
//  2. deal: all players get a card, face up, clockwise, followed by dealer, face up. then all players
//  get a second card, face up. dealer's second card is face down.
//  3. if dealer has a "natural" 21 (e.g. ace+10): he immediately collects everyone's bets except those who have a "natural" 21
//  who stand off. else dealer has to pay 1.5x bet to players with a "natural" 21 if dealer doesn't have 21.
//  4. players play: stand or hit
//  5. dealers play: follow algorithm for < 17 
//  (omit splits/doubling down/insurance

// players: an array. 0 is dealer, 1 is next clockwise position. minimum of 2 players including dealer (who must always be present)
// decks: main deck, each player's hand
// bets: every player places a bet
// chips: every player has some money to bet (dealer has infinite?)
// gameState: automate steps 1-3, then current player's turn

// factory method later

const Game = {
	init(deck) {
		const dealer = Object.create(Player);
		dealer.init("Dealer", 10000);
		this.players = [dealer];
		this.deck = deck;
		this.roundEnded = false;
	},
	playerJoin(player) {
		this.players.push(player);
	},
	async playGame() {
		this.roundEnded = false;
		// table.deck.showAllCards();
		// table.deck.cut(position);
		// table.deck.insertCard(blankPlasticCard,position);
		this.collectBets();
		this.dealOneToEveryone();
    this.players.forEach((player) => {
      player.hand.cards[0].turnFaceUp();
    })
    // everyone gets a face up card, including dealer
    this.render();
		this.dealOneToEveryone();

    // array slice out player0 which is dealer, then forEach
    // flip card faceUp
    this.players.slice(1).forEach((player) => {
      player.hand.cards[1].turnFaceUp();
    })
    this.render();
    // everyone gets a second face up card, but dealer's second card is face down
		let dealerHasBlackjack = this.checkForNaturals();
    if (dealerHasBlackjack) {
      this.resolveRemainingPlayers();
    } else {
      // check if players have blackjack
      /* forEach async is tricky
      await this.players.slice(1).forEach(async (player) => {
        if (player.score === 21) {
          console.log(`${player.name} has a Blackjack!`);
          player.hasNatural();
          player.resolve();
        } else {
          await this.playerPlays(player);
          this.render();
        }
      })
      */
      let players = this.players.slice(1);
      for (let index = 0; index < players.length; index++) {
        if (players[index].score === 21) {
          console.log(`${players[index].name} has a Blackjack! Dealer loses`);
          players[index].hasNatural();
          players[index].resolve();
        } else {
          await this.playerPlays(players[index]);
        }
      }
      this.dealerPlays();
      this.resolveRemainingPlayers();
    }
    console.log(`----Final State----`);
    this.players.forEach((player) => {
      console.log(`${player.name}: ${player.score}`);
    })
    this.render();
    // sequence for naturals -> check players first, before dealer. at any point if players
    // have naturals they have to challenge dealer, then dealer ONLY checks for natural
    // IF his first card is a 10/Ace.

		// checkForSplits();
		// checkForDoubleDowns();
		// do {
	},
	collectBets() {
		// this.bets = { player: amt, player2: amt }
    
    // game should have a "bet" object, that has an amt/player property. separation of concerns
    // game should also be the one responsible for doing player.hand.score! -> strategy pattern for other variations of blackjack, e.g. SG blackjack
	},
	dealOneToEveryone() {
    // by right, players get dealt before dealer
		this.players.forEach((player) => {
			// player.hand foreach? splits
			// or use Array.map?
			this.deck.transferTopCard(player.hand)
		});
	},
	checkForNaturals() {
		const players = this.players.slice(1);
		const dealer = this.players[0];
		let dealerHasTenCardOrAce = false;
		if ([1, 10, 11, 12, 13].indexOf(dealer.hand.cards[0].value) !== -1) {
      dealerHasTenCardOrAce = true;
			console.log(`Dealer has a 10 card/Ace.`);
    }
    if (dealerHasTenCardOrAce) {
      const dealerScore = dealer.score;
      if (dealerScore === 21) {
        dealer.hand.cards[1].turnFaceUp();
        dealer.hasNatural();
        console.log(`Dealer has a Blackjack!`);
        // go straight to resolve
        return true;
      }
      else {
        return false;

      }
    }

		
    /*
		players.forEach((player) => {
			if (player.hand.calcHandValue() === 21) {
				console.log(`${player.name} has a Blackjack!`);
				// challenge dealer
				if ([1, 10, 11, 12, 13].indexOf(dealer.hand.cards[0].value) !== -1) {
					console.log(`Dealer has a 10 card`);
					const dealerScore = dealer.hand.calcHandValue();
					if (dealerScore === 21) {
						console.log(`Dealer also has a Blackjack!`);
						dealerHasNatural = true;
						dealer.hand.cards[1].turnFaceUp();
					} else {
						console.log(`${player.name} wins $`);
					}
				}
				return true
			}
		})
		// if dealer is natural, set roundEnded to true
		if (dealerHasNatural) {
			this.roundEnded = true;
		}
    */
	},
  async playerPlays(player) {

    return new Promise(async (resolve) => {
      while (player.score < 21) {
        let playerInput = await input(`[${player.name}]: stand/hit?`);
        if (playerInput === "hit") {
          this.deck.transferTopCard(player.hand);
          player.hand.cards[player.hand.cards.length - 1].turnFaceUp();
        } else if (playerInput === "stand") {
          this.render();
          break;
        } else {
          console.log(`Didn't understand that. Type 'hit' or 'stand'.`);
        }
        this.render();
      }
      // console.log(`${player.name} done playing`);
      resolve(`${player.name} done playing`);
    })

    /*
    return new Promise(resolve => {
      players = this.players.slice(1);
      players.forEach(async (player) => {
        while (player.score < 21) {
          // let user stand/hit
          
          let playerInput = await input(`[${player.name}]: stand/hit?`);
          if (playerInput === "hit") {
			      this.deck.transferTopCard(player.hand);
            player.hand.cards[player.hand.cards.length - 1].turnFaceUp();
          } else if (playerInput === "stand") {
            break;
          } else {
            console.log(`Didn't understand that. Type 'hit' or 'stand'.`);
          }
        }
        resolve(`Player done`);
      })
    })
    */

    // after all players play, dealer plays
  },
	checkForWinner() {
		// this winner implementation is wrong
		// dealer challenges each player for a separate outcome
		let winner;
		let points = 0;
		this.players.forEach((player) => {
			if (player.score > points && player.score <= 21) {
				points = player.score;
				winner = player;
			}
		});

		this.roundEnded = true;
		// console.log(winner, winner.score);
    console.log(`The winner is ${winner.name} with a score of ${winner.score}`);
	},
  resolvePlayer(player) {
    const dealer = this.players[0];
    if (dealer.score > 21) {
      if (player.score > 21) {
        console.log(`Both ${player.name} (${player.score}) and Dealer (${dealer.score}) burst`);
      } else {
        console.log(`Dealer burst (${dealer.score}), loses to ${player.name} (${player.score})`);
      }
      return;
    }
    if (player.score > 21) {
      console.log(`${player.name} burst (${player.score}), Dealer wins`);
      return;
    }
    if (dealer.score > player.score) {
      console.log(`Dealer (${dealer.score}) beats ${player.name} (${player.score})`);
    } else if (dealer.score === player.score) {
      console.log(`Dealer and ${player.name} draw (${dealer.score})`);
    } else {
      console.log(`Dealer (${dealer.score}) loses to ${player.name} (${player.score})`);
    }
    player.resolve();
  },
  resolveRemainingPlayers() {
    let dealer = this.players[0];
    dealer.hand.cards.forEach(card => {
      card.turnFaceUp();
    });
    const remainingPlayers = this.players.slice(1).filter(player => !player.resolved);

    remainingPlayers.forEach((player) => {
      this.resolvePlayer(player);
    })

  },
  dealerPlays() {
    let dealer = this.players[0];
    while (dealer.score < 17) {
			this.deck.transferTopCard(dealer.hand);
    }
  },
  render() {
    // show the status of the game.
    console.log(`******`)
    this.players.forEach((player) => {
      console.log(`${player.name}`);
      player.hand.cards.forEach((card) => {
        console.log(`   ${card.readFace()}`);
      })
    })

    console.log(`******`)
  }
}

module.exports = Game;
///
//
const CardWithTwoSides = require('./card.js');
  const player1 = Object.create(Player);
  player1.init("john", 100);
  const player2 = Object.create(Player);
  player2.init("jane", 100);

	const dealerCard = Object.create(CardWithTwoSides);
	dealerCard.prepareCard({value: 1, suit: "Clubs"}, {isFaceDown: true});
	const dealerCard2 = Object.create(CardWithTwoSides);
	dealerCard2.prepareCard({value: 5, suit: "Clubs"}, {isFaceDown: true});

	const playerCard = Object.create(CardWithTwoSides);
	playerCard.prepareCard({value: 2, suit: "Clubs"}, {isFaceDown: true});
	const playerCard2 = Object.create(CardWithTwoSides);
	playerCard2.prepareCard({value: 9, suit: "Clubs"}, {isFaceDown: true});

	const player2Card = Object.create(CardWithTwoSides);
	player2Card.prepareCard({value: 5, suit: "Clubs"}, {isFaceDown: true});
	const player2Card2 = Object.create(CardWithTwoSides);
	player2Card2.prepareCard({value: 11, suit: "Clubs"}, {isFaceDown: true});


  const deck = Object.create(Deck);
  deck.init();
  deck.createStandardDeck();
  /*
  deck.addCardToTop(playerCard);
  deck.addCardToTop(player2Card);
  deck.addCardToTop(dealerCard);
  deck.addCardToTop(playerCard2);
  deck.addCardToTop(player2Card2);
  deck.addCardToTop(dealerCard2);
  */
  deck.shuffle();
  const game = Object.create(Game);
  game.init(deck);
  game.playerJoin(player1);
  game.playerJoin(player2);
  game.playGame();
