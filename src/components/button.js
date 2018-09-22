/** @jsx h */
const { h, render, Component } = preact;

const Button = function Button(props) {
  return (
    <button 
      class="block__button"
      key={props.id} 
      id={props.id} 
      onClick={props.clickHandler}>
      {props.text}
    </button>
  )
}

module.exports = Button;
