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
  page = await browser.newPage();
})

afterAll(() => {
  browser.close();
  childProcess.kill();
})


test('loads blackjack page', async () => {
  await page.goto(APP);
  const titleText = await page.$eval('title', el => el.innerHTML);
  expect(titleText).toContain('Blackjack');
});
