/** @jsx h */
const { h, render, Component } = preact;

const Card = require('./components/card');
const Deck = require('./components/deck');
const Clock = require('./components/clock');
const Button = require('./components/button.js');
const BlackjackTable = require('./components/blackjackTable.js');

const socket = io();

// need a GAME react component composed of dealer/player decks
// need actual state in it... shouldn't be functional
// which i can call setState on...

render(<Clock />, document.body);
// render(<Card suit={"Spades"} value={1} isFaceDown={false} />, document.body);
render(<BlackjackTable io={socket}/>, document.body);
render(<Deck 
  cards={[
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
  ]}
/>, document.body);
render(<Deck 
  cards={[
    <Card suit={"Spades"} value={1} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
  ]}
/>, document.body);

const joinGame = () => {
  const chips = window.prompt("How many chips would you like to exchange?", 500);
  console.log(chips);
  socket.emit('joinGame', {chips: Number(chips)});
}

const placeBet = () => {
  const chips = window.prompt("How many chips would you like to bet?", 10);
  console.log(chips);
  socket.emit('placeBet', {chips: Number(chips)});
}

const hit = () => {
  socket.emit('play', 'hit');
}

const stand = () => {
  socket.emit('play', 'stand');
}

const goToBettingState = () => {
  socket.emit('changeState', 'gettingBetsState');
}

const goToCheckDealerForNaturalsState = () => {
  socket.emit('changeState', 'checkDealerForNaturals');
}

render(<Button text={"Join Game"} id={"joinGame"} clickHandler={joinGame}/>, document.body);
render(<Button text={"Place Bet"} id={"placeBet"} clickHandler={placeBet}/>, document.body);
render(<Button text={"Hit"} id={"hit"} clickHandler={hit}/>, document.body);
render(<Button text={"Stand"} id={"stand"} clickHandler={stand}/>, document.body);

render(<Button text={"Go to Betting State"} id={"getBets"} clickHandler={goToBettingState}/>, document.body);
render(<Button text={"Play"} id={"play"} clickHandler={goToCheckDealerForNaturalsState}/>, document.body);

socket.on('playerJoined', (player) => {
  console.log(player);
});

socket.on('connect', function() {
  console.log(socket.id);
})

socket.on('render', (state) => {
  console.log(state);
})
