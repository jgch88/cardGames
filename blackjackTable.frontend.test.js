const puppeteer = require('puppeteer');
const APP = 'http://localhost:4000';
const { spawn } = require('child_process');

let pages;
let browser;
let childProcess;
let dialogValue;
const INSURANCE_PAUSE = 3000;

const USER_DATA_DIR = 'C:\\Users\\Public\\Public Downloads\\temp';
const USER_DATA_DIR_WSL = '/mnt/c/Users/Public/Public Downloads/temp';

const initServer = async (deckType) => {
  return new Promise((resolve, reject) => {
    childProcess = spawn('node', ['server.js', `--deck=${deckType}`]);

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
    slowMo: 50,
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
  killServer();
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

test('dealer has blackjack, player no blackjack', async () => {
  await initServer(`dealerHasBlackjackDeck`);
  await pages[0].goto(APP);
  dialogValue = "100"
  await pages[0].$eval('#joinGame', el => el.click());
  let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 100');
  await pages[0].$eval('#goToBettingState', el => el.click());
  dialogValue = "10"
  await pages[0].$eval('#placeBet', el => el.click());
  
  chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 90');
  await pages[0].$eval('#startRound', el => el.click());
  await new Promise((resolve, reject) => {
    // need to add this because of insurance bet feature
    setTimeout(resolve, INSURANCE_PAUSE);
  });
  const messageLog = await pages[0].$eval('div.messageLog', el => el.innerHTML);
  expect(messageLog).toContain('[Dealer]: Has a Blackjack');
  killServer();
}, 6000);

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


test(`dealer bursts after hitting, player doesn't burst`, async () => {
  await initServer(`bothNoBlackjack`);
  await pages[0].goto(APP);

  dialogValue = "100"
  await pages[0].waitForSelector('#joinGame');
  await pages[0].$eval('#joinGame', el => el.click());
  let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 100');

  await pages[0].$eval('#goToBettingState', el => el.click());
  dialogValue = "10"
  await pages[0].$eval('#placeBet', el => el.click());

  await pages[0].$eval('#startRound', el => el.click());
  await pages[0]
    .waitForSelector('#playHit', {timeout:200})
    .then(async () =>  {
      await pages[0].$eval('#playHit', el => el.click());
    })
    .catch((e) => {
      console.log(e)
    });
  await pages[0]
    .waitForSelector('#playStand', {timeout:200})
    .then(async () =>  {
      await pages[0].$eval('#playStand', el => el.click());
    })
    .catch((e) => {
      console.log(e)
    });
  const messageLog = await pages[0].$eval('div.messageLog', el => el.innerHTML);
  expect(messageLog).toContain('wins [Dealer]');
  chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 110');
  killServer();
}, 7000);

test(`players can create separate game rooms and play different games`, async () => {
  await initServer();

  for (let i = 0; i < 3; i++) {
    await pages[i].goto(APP);

    dialogValue = "room1";
    await pages[i]
      .waitForSelector('#createRoom')
      .then(async () => {
        await pages[i].$eval('#createRoom', el => el.click());
      })
      .catch((e) => {
        console.log(e);
      });

  }
  
  for (let i = 0; i < 3; i++) {
    dialogValue = "100"
    await pages[i].waitForSelector('#joinGame');
    await pages[i].$eval('#joinGame', el => el.click());
    await pages[i].$eval('#goToBettingState', el => el.click());

    dialogValue = "10"
    await pages[i].$eval('#placeBet', el => el.click());

    await pages[i].$eval('#startRound', el => el.click());
    await pages[i]
      .waitForSelector('#playStand', {timeout:200})
      .then(async () =>  {
        await pages[i].$eval('#playStand', el => el.click());
      })
      .catch((e) => {
        console.log(e)
      });

    const messageLog = await pages[i].$eval('div.messageLog', el => el.innerHTML);
    expect(messageLog).toContain('resolved');

  }
  killServer();

}, 13000);

describe('feature: players splitting hands', () => {
  test(`split button appears when player can split`, async () => {
    await initServer(`playerSplits`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await pages[0].$eval('#goToBettingState', el => el.click());
    dialogValue = "10"
    await pages[0].$eval('#placeBet', el => el.click());

    await pages[0].$eval('#startRound', el => el.click());
    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    await pages[0]
      .waitForSelector('#playHit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playHit', el => el.click());
      });
    await pages[0]
      .waitForSelector('#playStand', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playStand', el => el.click());
      });
    await pages[0]
      .waitForSelector('#playHit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playHit', el => el.click());
      });
    await pages[0]
      .waitForSelector('#playStand', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playStand', el => el.click());
      });
    let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
    expect(chipsInHand).toBe('Chips: 80');
    killServer();
  });

  test(`split button does not appear when player cannot split`, async () => {
    await initServer(`bothNoBlackjack`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await pages[0].$eval('#goToBettingState', el => el.click());
    dialogValue = "10"
    await pages[0].$eval('#placeBet', el => el.click());

    await pages[0].$eval('#startRound', el => el.click());
    await expect(pages[0].waitForSelector('#playSplit', {timeout:200})).rejects.toThrow('timeout');
    killServer();
  });

  test(`bets visually split into two once split button is pressed`, async () => {
    await initServer(`playerSplits`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await pages[0].$eval('#goToBettingState', el => el.click());
    dialogValue = "10"
    await pages[0].$eval('#placeBet', el => el.click());

    await pages[0].$eval('#startRound', el => el.click());
    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    // add code to test two child divs in "horizontolScroll playerHands" div
    const numberOfBets = await pages[0].$eval('.playerHands', el => el.childElementCount);
    expect(numberOfBets).toBe(2);
    killServer();
  });

  test(`when player splits with two aces, he automatically gets one card for each hand and stands`, async () => {
    await initServer(`playerSplitsAces`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await pages[0].$eval('#goToBettingState', el => el.click());
    dialogValue = "10"
    await pages[0].$eval('#placeBet', el => el.click());

    await pages[0].$eval('#startRound', el => el.click());
    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    await expect(pages[0].waitForSelector('#playStand', {timeout:500})).rejects.toThrow('timeout');
    killServer();
  });

  test(`when player splits with two aces and gets blackjacks, he doesn't get paid 1.5x`, async () => {
    await initServer(`playerSplitsAcesGetsBlackjacks`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await pages[0].$eval('#goToBettingState', el => el.click());
    dialogValue = "10"
    await pages[0].$eval('#placeBet', el => el.click());

    await pages[0].$eval('#startRound', el => el.click());
    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    await expect(pages[0].waitForSelector('#playStand', {timeout:500})).rejects.toThrow('timeout');
    const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
    expect(chipsInHand).toBe('Chips: 120');
    killServer();
  });
});


describe('feature: players can place insurance bets', () => {

  test(`when dealer's first card is an ace, game status switches to getting insurance bets`, async () => {
    await initServer(`dealerHasBlackjackDeck`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await pages[0].$eval('#goToBettingState', el => el.click());
    dialogValue = "10"
    await pages[0].$eval('#placeBet', el => el.click());

    await pages[0].$eval('#startRound', el => el.click());
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 200);
    })
    const gameState = await pages[0].$eval('.gameStateStatus', el => el.innerHTML);
    expect(gameState).toContain('Getting Insurance Bets')
    // await pages[0].$eval('#placeInsuranceBet', el => el.click());
    killServer();
  });
});
