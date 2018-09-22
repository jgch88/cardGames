/** @jsx h */
const { h, render, Component } = preact;

const CardFaceDown = function CardFaceDown(props) {

  return (
    <div>
      <div class="card__corner card__corner--top">
      </div>
      <span class="card__face">
        <img src={"images/faces/face-down.png"} />
      </span>
      <div class="card__corner card__corner--bottom">
      </div>
    </div>
  );

};

module.exports = CardFaceDown;
