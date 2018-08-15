const gettingPlaysState = {
  init(game) {
    this.game = game;

    // deal two cards to each person
    // starting from the first player
    this.dealOneToEveryone(game.players);
    game.players.forEach((player) => {
      player.hand.cards[0].turnFaceUp();
    });
    this.dealOneToEveryone(game.players);
    game.players.slice(1).forEach((player) => {
      player.hand.cards[1].turnFaceUp();
    });
    game.render();
    console.log(`[State]: Waiting for players to play`);

    // set current player
    // maybe should put the bet inside the player object later
    game.currentPlayer = game.players[1].name;
    console.log(`[State]: Current player: ${game.currentPlayer}`);

  },
  joinGame() {
    throw `Game has already started. Please join the next round`;
  },
  leaveGame() {
  },
  placeBet() {
    throw `Game has already started. Please join the next round`;
  },
  play(playerName, move, game) {
    // there should be a currentPlayer property on the game, only the current player gets to play a move
    if (game.currentPlayer === playerName) {
      console.log(`[${playerName}]: '${move}'`);

    } else {
      throw `It is not ${playerName}'s turn!`;
    }
  },
  dealOneToEveryone(players) {
    // deal to players before dealer
    players.slice(1).forEach(player => {
      this.game.deck.transferTopCard(player.hand);
    })
    this.game.deck.transferTopCard(players[0].hand);

  }
}

module.exports = gettingPlaysState;
