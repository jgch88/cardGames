/** @jsx h */
const { h, render, Component } = preact;

const MessageLog = function MessageLog(props) {
  return (
    <div>
      <div>Message Log</div>
      {props.messages.map(message => {
        return <div>{message}</div>
      })}
    </div>
  )
}

module.exports = MessageLog;
