/** @jsx h */
const { h, render, Component } = preact;
const CardAce = require('./cardAce.js');
const CardTwo = require('./cardTwo.js');
const CardThree = require('./cardThree.js');
const CardFour = require('./cardFour.js');
const CardFive = require('./cardFive.js');
const CardSix = require('./cardSix.js');
const CardSeven = require('./cardSeven.js');
const CardEight = require('./cardEight.js');
const CardNine = require('./cardNine.js');
const CardTen = require('./cardTen.js');
const CardJack = require('./cardJack.js');
const CardQueen = require('./cardQueen.js');
const CardKing = require('./cardKing.js');

const CardFaceDown = require('./cardFaceDown.js');

const CardContainer = function CardContainer(props) {
  const mapValueToCardComponent = (suit) => ({
    1: <CardAce suit={suit} />,
    2: <CardTwo suit={suit} />,
    3: <CardThree suit={suit} />,
    4: <CardFour suit={suit} />,
    5: <CardFive suit={suit} />,
    6: <CardSix suit={suit} />,
    7: <CardSeven suit={suit} />,
    8: <CardEight suit={suit} />,
    9: <CardNine suit={suit} />,
    10: <CardTen suit={suit} />,
    11: <CardJack suit={suit} />,
    12: <CardQueen suit={suit} />,
    13: <CardKing suit={suit} />,
  });
  // list of card number templates to populate it
  return (
    <div class="card">
      {props.isFaceDown ? <CardFaceDown /> : ''}
      {!props.isFaceDown && props.value ? mapValueToCardComponent(props.suit)[props.value] : ''}
    </div>
  )

}

module.exports = CardContainer;
