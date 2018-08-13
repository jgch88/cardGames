/** @jsx h */
const { h, render, Component } = preact;

// Deck is a collection of cards

const Deck = function Deck(props) {
  return (
    <table>
      <tbody>
        <tr>
          { props.cards.map((card) => {
            return <td>{card}</td>;
          }) }
        </tr>
      </tbody>
    </table>
  )
}

module.exports = Deck;
