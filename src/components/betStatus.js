/** @jsx h */
const { h, render, Component } = preact;

const BetStatus = function BetStatus(props) {
  if (!props.betAmount) {
    return <span></span>
  }

  return (
    <span>Your Bet: {props.betAmount}</span>
  )
}

module.exports = BetStatus;
