// configured decks for game/frontend testing
const decks = {
  dealerHasBlackjackDeck: require('./testDeckConfigs/dealerHasBlackjackDeck.js'),
  bothNoBlackjack: require('./testDeckConfigs/bothNoBlackjack.js'),
  dealerNoBlackjack: require('./testDeckConfigs/dealerNoBlackjackPlayerHasBlackjack.js'),
}

module.exports = decks;
