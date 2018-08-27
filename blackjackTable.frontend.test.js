const puppeteer = require('puppeteer');
const APP = 'http://localhost:4000';
const { spawn } = require('child_process');

let page;
let browser;
let childProcess;
let dialogValue;

const USER_DATA_DIR = 'C:\\Users\\Me\\Downloads\\temp';
const USER_DATA_DIR_WSL = '/mnt/c/Users/Me/Downloads/temp';

const initServer = async () => {
  return new Promise((resolve, reject) => {
    childProcess = spawn('node', ['server.js']);

    childProcess.stdout.on('data', data => {
      console.log(JSON.stringify(data.toString('utf8')));
      resolve();
    })
  })
}

beforeAll(async () => {
  await initServer();

  browser = await puppeteer.launch({
    executablePath: `chrome.exe`,
    userDataDir: USER_DATA_DIR,
    headless: false,
    slowMo: 80,
  });
  pages = await browser.pages();
  pages[0].on('dialog', async dialog => {
    await dialog.accept(dialogValue);
    // this permanently creates a event listener that always responds this way
    // needed a global dialogValue which the tests can change
  });
})

afterAll(() => {
  browser.close();
  childProcess.kill();
})

test('loads blackjack page', async () => {
  await pages[0].goto(APP);
  const titleText = await pages[0].$eval('title', el => el.innerHTML);
  expect(titleText).toContain('Blackjack');
});

test('player can join the game with 1000 chips', async () => {
  await pages[0].goto(APP);
  dialogValue = "1000"; // string value expected by puppeteer
  await pages[0].$eval('#joinGame', el => el.click());
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');
});

test('player stands, game resolves', async () => {
  await pages[0].goto(APP);
  dialogValue = "100"
  await pages[0].$eval('#joinGame', el => el.click());
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 100');
  await pages[0].$eval('#goToBettingState', el => el.click());
  dialogValue = "10"
  await pages[0].$eval('#placeBet', el => el.click());
  await pages[0].$eval('#startRound', el => el.click());
  await pages[0].$eval('#playStand', el => el.click());
  const messageLog = await pages[0].$eval('div.messageLog', el => el.innerHTML);
  expect(messageLog).toContain('All bets resolved!');
});
