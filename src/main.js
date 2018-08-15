/** @jsx h */
const { h, render, Component } = preact;

const Card = require('./components/card');
const Deck = require('./components/deck');
const Clock = require('./components/clock');
const Button = require('./components/button.js');

const socket = io();

render(<Clock />, document.body);
render(<Card suit={"Spades"} value={1} isFaceDown={false} />, document.body);
render(<Deck 
  cards={[
    <Card suit={"Spades"} value={1} isFaceDown={false} />,
    <Card suit={"Spades"} value={2} isFaceDown={false} />,
  ]}
/>, document.body);

const joinGame = () => {
  const chips = window.prompt("How many chips would you like to exchange?", 500);
  console.log(chips);
  socket.emit('joinGame', {chips: chips});
}

render(<Button text={"Join Game"} id={"joinGame"} clickHandler={joinGame}/>, document.body);
render(<Button text={"Hit"} id={"hit"}/>, document.body);
render(<Button text={"Stand"} id={"stand"}/>, document.body);

socket.on('playerJoined', (player) => {
  console.log(player);
});
