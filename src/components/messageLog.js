/** @jsx h */
const { h, render, Component } = preact;

const MessageLog = function MessageLog(props) {
  // need to reverse the messages without mutating the state
  return (
    <div>
      {props.messages.slice().reverse().map(message => {
        return <div>{message}</div>
      })}
    </div>
  )
}

module.exports = MessageLog;
