/** @jsx h */
const { h, render, Component } = preact;

// Deck is a collection of cards

const Deck = function Deck(props) {
  return (
    <div class="horizontalScroll">
      <table>
        <tbody>
          <tr>
            { props.cards.map((card) => {
              return <td>{card}</td>;
            }) }
          </tr>
        </tbody>
      </table>
    </div>
  )
}

module.exports = Deck;
