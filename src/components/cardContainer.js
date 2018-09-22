/** @jsx h */
const { h, render, Component } = preact;
const CardTen = require('./cardTen.js');

const CardContainer = function CardContainer(props) {
  // list of card number templates to populate it
  return (
    <div class="card">
      <CardTen suit="Spades" />
    </div>
  )

}

module.exports = CardContainer;
