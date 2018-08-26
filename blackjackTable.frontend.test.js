const puppeteer = require('puppeteer');
const APP = 'http://localhost:4000';
const { spawn } = require('child_process');

let page;
let browser;
let childProcess;

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
  pages[0].on('dialog', async dialog => {
    await dialog.accept("1000"); // string value expected by puppeteer
  });
  const joinButton = await pages[0].$eval('#joinGame', el => el.click());
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');
});
