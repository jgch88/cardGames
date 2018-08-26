const puppeteer = require('puppeteer');
const APP = 'http://localhost:4000';

let page;
let browser;

const USER_DATA_DIR = 'C:\\Users\\Me\\Downloads\\temp';
const USER_DATA_DIR_WSL = '/mnt/c/Users/Me/Downloads/temp';


beforeAll(async () => {

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
})


test('loads blackjack page', async () => {
  await page.goto(APP);
  const titleText = await page.$eval('title', el => el.innerHTML);
  expect(titleText).toContain('Blackjack');
});
