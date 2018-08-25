/** @jsx h */
const { h, render, Component } = preact;

const Snack = function Snack(props) {
  return (
    <div
      id="snackbar"
    >
      {props.message}
    </div>
  )
}

module.exports = Snack;
