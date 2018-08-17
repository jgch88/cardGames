const MessageLog = {
  // a log that only holds up to a 
  // certain number of messages
  // using a queue
  init(maxMessages) {
    this.maxMessages = maxMessages;
    this.messages = [];
  },
  addMessage(message) {
    if (this.messages.length === this.maxMessages) {
      this.messages.shift();
      this.messages.push(message);
    } else {
      this.messages.push(message);
    }
  }
}

module.exports = MessageLog;
