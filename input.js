// a simple async/await exercise to make
// readline "synchronous", like python3's input()
const readline = require('readline');

function input(hint) {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(hint, (answer) => {
      rl.close();
      resolve(answer);
    })
  })
}

module.exports = input;
