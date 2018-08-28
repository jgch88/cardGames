const puppeteer = require('puppeteer');
const APP = 'http://localhost:4000';
const { spawn } = require('child_process');

let pages;
let browser;
let childProcess;
let dialogValue;

const USER_DATA_DIR = 'C:\\Users\\Me\\Downloads\\temp';
const USER_DATA_DIR_WSL = '/mnt/c/Users/Me/Downloads/temp';

const initServer = async () => {
  return new Promise((resolve, reject) => {
    childProcess = spawn('node', ['server.js', '--deck=dealerHasBlackjackDeck']);

    childProcess.stdout.on('data', data => {
      console.log(JSON.stringify(data.toString('utf8')));
      resolve();
    })
  })
}

const killServer = () => {
  childProcess.kill();
}

beforeAll(async () => {

  browser = await puppeteer.launch({
    executablePath: `chrome.exe`,
    userDataDir: USER_DATA_DIR,
    headless: false,
    slowMo: 80,
  });
  await browser.newPage(); // open tab for 2nd player
  await browser.newPage(); // open tab for 3rd player
  pages = await browser.pages();
  // need to do this for every tab...
  pages.forEach(page => page.on('dialog', async dialog => {
    // this permanently creates a event listener that always responds this way
    // needed a global dialogValue which the tests can change
    // also needed each page to have its own listener
    await dialog.accept(dialogValue);
  }))
})

afterAll(() => {
  browser.close();
})

test('loads blackjack page', async () => {
  await initServer();
  await pages[0].goto(APP);
  const titleText = await pages[0].$eval('title', el => el.innerHTML);
  expect(titleText).toContain('Blackjack');
  killServer();
});

test('player can join the game with 1000 chips', async () => {
  await initServer();
  await pages[0].goto(APP);
  dialogValue = "1000"; // string value expected by puppeteer
  await pages[0].$eval('#joinGame', el => el.click());
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');
  killServer();
});

test('player stands, game resolves', async () => {
  await initServer();
  await pages[0].goto(APP);
  dialogValue = "100"
  await pages[0].$eval('#joinGame', el => el.click());
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 100');
  await pages[0].$eval('#goToBettingState', el => el.click());
  dialogValue = "10"
  await pages[0].$eval('#placeBet', el => el.click());
  await pages[0].$eval('#startRound', el => el.click());
  await pages[0]
    .waitForSelector('#playStand', {timeout:200})
    .then(async () =>  {
      await pages[0].$eval('#playStand', el => el.click());
    })
    .catch((e) => {
      console.log(e)
    });
  const messageLog = await pages[0].$eval('div.messageLog', el => el.innerHTML);
  expect(messageLog).toContain('All bets resolved!');
  killServer();
}, 7000);

test('two players join, both players stand, game resolves', async () => {
  await initServer();
  await pages[0].goto(APP);
  await pages[1].goto(APP);

  dialogValue = "100"
  await pages[0].waitForSelector('#joinGame');
  await pages[0].$eval('#joinGame', el => el.click());
  dialogValue = "200"
  await pages[1].waitForSelector('#joinGame');
  await pages[1].$eval('#joinGame', el => el.click());
  let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 100');
  chipsInHand = await pages[1].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 200');

  await pages[0].$eval('#goToBettingState', el => el.click());
  dialogValue = "10"
  await pages[0].$eval('#placeBet', el => el.click());
  dialogValue = "20"
  await pages[1].$eval('#placeBet', el => el.click());

  await pages[0].$eval('#startRound', el => el.click());
  await pages[0]
    .waitForSelector('#playStand', {timeout:200})
    .then(async () =>  {
      await pages[0].$eval('#playStand', el => el.click());
    })
    .catch((e) => {
      console.log(e)
    });
  await pages[1]
    .waitForSelector('#playStand', {timeout:200})
    .then(async () =>  {
      await pages[1].$eval('#playStand', el => el.click());
    })
    .catch((e) => {
      console.log(e)
    });
  const messageLog = await pages[0].$eval('div.messageLog', el => el.innerHTML);
  expect(messageLog).toContain('All bets resolved!');
  killServer();
}, 7000);
