/** @jsx h */
const { h, render, Component } = preact;

const BetStatus = function BetStatus(props) {
  if (!props.chips) {
    return <span></span>
  }

  return (
    <span>Your Bet: {props.chips}</span>
  )
}

module.exports = BetStatus;
