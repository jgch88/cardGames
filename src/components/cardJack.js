/** @jsx h */
const { h, render, Component } = preact;

const CardJack = function CardJack(props) {

  const suitSymbols = {
    "Clubs": "\u2663",
    "Diamonds": "\u2666",
    "Hearts": "\u2665",
    "Spades": "\u2660"
  };

  const suitColors = {
    "Hearts": "red",
    "Diamonds": "red",
    "Clubs": "black",
    "Spades": "black",
  };

  const number = `J`;

  const suitSymbol = suitSymbols[props.suit];
  const suitColor = suitColors[props.suit];

  return (
    <div class={`card--` + suitColor}>
      <div class="card__corner card__corner--top">
        <span class="card__number">{number}</span>
        <span>{suitSymbol}</span>
      </div>
      <span class="card__face">
        <img src={"images/faces/face-"+number+"-"+props.suit+".png"} />
      </span>
      <div class="card__corner card__corner--bottom">
        <span class="card__number">{number}</span>
        <span>{suitSymbol}</span>
      </div>
    </div>
  );

};

module.exports = CardJack;
