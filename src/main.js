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
render(<BlackjackTable io={socket}/>, document.body);

socket.on('playerJoined', (player) => {
  console.log(player);
});

socket.on('connect', function() {
  console.log(socket.id);
})

socket.on('render', (state) => {
  console.log(state);
})
