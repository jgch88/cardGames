// configured decks for game/frontend testing
const decks = {
  dealerHasBlackjackDeck: require('./testDeckConfigs/dealerHasBlackjackDeck.js'),
  bothNoBlackjack: require('./testDeckConfigs/bothNoBlackjack.js'),
  dealerNoBlackjack: require('./testDeckConfigs/dealerNoBlackjackPlayerHasBlackjack.js'),
  playerSplits: require('./testDeckConfigs/playerSplits.js'),
  playerSplitsAces: require('./testDeckConfigs/playerSplitsAces.js'),
}

module.exports = decks;
