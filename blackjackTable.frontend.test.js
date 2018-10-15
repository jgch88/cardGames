const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

let pages;
let browser;
let childProcess;
let dialogValue;
const INSURANCE_PAUSE = 1500;

const USER_DATA_DIR = 'C:\\Users\\Public\\Public Downloads\\temp';
const USER_DATA_DIR_WSL = '/mnt/c/Users/Public/Public Downloads/temp';

const PORT = 4001; // needed this because jest runs backend and frontend tests simultaneously
// and frontend tests would fail because backend tests loaded different decks
// ^ this is not true, tests still failed. it was because waitForSelector #dontPlaceInsuranceBet was there
// but no eval().click!
const APP = `http://localhost:${PORT}`;
const initServer = async (deckType) => {
  return new Promise((resolve, reject) => {
    childProcess = spawn('node', ['server.js', `--deck=${deckType}`, `--port=${PORT}`, `--timer=${INSURANCE_PAUSE}`]);

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

  /* local
  browser = await puppeteer.launch({
    executablePath: `chrome.exe`,
    userDataDir: USER_DATA_DIR,
    headless: false,
    slowMo: 50,
  });
  */
  browser = await puppeteer.launch({
    headless: true,
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
  // dialogValue = "1000"; // string value expected by puppeteer
  // player no longer gets to choose how many chips he starts with.
  await pages[0].$eval('#joinGame', el => el.click());
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');
  killServer();
});

test('dealer has blackjack, player no blackjack', async () => {
  await initServer(`dealerHasBlackjackDeck`);
  await pages[0].goto(APP);
  await pages[0].$eval('#joinGame', el => el.click());
  let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 6000);
  });

  // place bet with slider instead of dialog
  await pages[0].$eval('#betSlider', el => {
    el.value = 20
    // needed to manually trigger the 'onChange' event
    el.dispatchEvent(new Event('change'));
  });
  let betSliderValue = await pages[0].$eval('#betSliderValue', el => el.innerHTML);
  expect(betSliderValue).toMatch(/20/);

  await pages[0].$eval('#placeBet', el => el.click());
  
  chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 980');

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 6000);
  });
  // check round over message doesn't show
  let messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
  expect(messages).toMatch(/Buy insurance/);
  // don't buy insurance
  await pages[0].$eval('#dontPlaceInsuranceBet', el => el.click());
  // check round over message shows after dealer card opens
  messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
  expect(messages).toMatch(/Round over/);
  chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 980');
  killServer();
}, 15000);

test('player stands, game resolves', async () => {
  // non deterministic
  await initServer();
  await pages[0].goto(APP);
  await pages[0].$eval('#joinGame', el => el.click());
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 6000);
  });
  const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');
  // place bet with slider instead of dialog
  let betSliderValue = await pages[0].$eval('#betSliderValue', el => el.innerHTML);
  expect(betSliderValue).toMatch(/10/);

  await pages[0].$eval('#placeBet', el => el.click());

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });

  try {
    // if dealer gets Ace, don't buy insurance
    await pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
    await pages[0].$eval('#dontPlaceInsuranceBet', el => el.click());
    await pages[1].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
    await pages[1].$eval('#dontPlaceInsuranceBet', el => el.click());
  } catch(e) {
    console.log(e);
  }

  await pages[0]
    .waitForSelector('#playStand', {timeout:200})
    .then(async () =>  {
      await pages[0].$eval('#playStand', el => el.click());
    })
    .catch((e) => {
      console.log(e)
    });
  let messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
  expect(messages).toMatch(/Round over/);
  killServer();
}, 15000);

test('two players join, both players stand, game resolves', async () => {
  await initServer();
  await pages[0].goto(APP);
  await pages[1].goto(APP);

  await pages[0].waitForSelector('#joinGame');
  await pages[0].$eval('#joinGame', el => el.click());
  await pages[1].waitForSelector('#joinGame');
  await pages[1].$eval('#joinGame', el => el.click());
  let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');
  chipsInHand = await pages[1].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });

  await pages[0].$eval('#placeBet', el => el.click());
  await pages[1].$eval('#betSlider', el => {
    el.value = 20
    // needed to manually trigger the 'onChange' event
    el.dispatchEvent(new Event('change'));
  });
  await pages[1].$eval('#placeBet', el => el.click());

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });
  // make them press "no insurance" if possible
  try {
    // if dealer gets Ace, don't buy insurance
    await pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
    await pages[0].$eval('#dontPlaceInsuranceBet', el => el.click());
    await pages[1].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
    await pages[1].$eval('#dontPlaceInsuranceBet', el => el.click());
  } catch(e) {
    console.log(e);
  }
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
  let messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
  expect(messages).toMatch(/Round over/);
  killServer();
}, 15000);


test(`dealer bursts after hitting, player doesn't burst`, async () => {
  await initServer(`bothNoBlackjack`);
  await pages[0].goto(APP);

  await pages[0].waitForSelector('#joinGame');
  await pages[0].$eval('#joinGame', el => el.click());
  let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1000');

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });

  await pages[0].$eval('#placeBet', el => el.click());

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });

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
  // expect(messageLog).toContain('wins [Dealer]');
  let messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
  expect(messages).toMatch(/Round over/);

  chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
  expect(chipsInHand).toBe('Chips: 1010');
  killServer();
}, 15000);

test(`players can create separate game rooms and play different games`, async () => {
  await initServer();

  for (let i = 0; i < 3; i++) {
    await pages[i].goto(APP);

    await pages[i].waitForSelector('#joinGame');
    await pages[i].$eval('#joinGame', el => el.click());

    dialogValue = "room1";
    await pages[i]
      .waitForSelector('#joinRoom')
      .then(async () => {
        await pages[i].$eval('#joinRoom', el => el.click());
      })
      .catch((e) => {
        console.log(e);
      });
  }
  
  for (let i = 0; i < 3; i++) {
    await pages[i].waitForSelector('#joinGame');
    await pages[i].$eval('#joinGame', el => el.click());
  }

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });

  for (let i = 0; i < 3; i++) {
    await pages[i].$eval('#placeBet', el => el.click());
  }

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 5000);
  });

  for (let i = 0; i < 3; i++) {
    try {
      // if dealer gets Ace, don't buy insurance
      await pages[i].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
      await pages[i].$eval('#dontPlaceInsuranceBet', el => el.click());
    } catch(e) {
      console.log(e);
    }
    await pages[i]
      .waitForSelector('#playStand', {timeout:200})
      .then(async () =>  {
        await pages[i].$eval('#playStand', el => el.click());
      })
      .catch((e) => {
        console.log(e)
      });
  }

  let messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
  expect(messages).toMatch(/Round over/);

  killServer();

}, 20000);

describe('feature: players splitting hands', () => {
  test(`split button appears when player can split`, async () => {
    await initServer(`playerSplits`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

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
    expect(chipsInHand).toBe('Chips: 980');
    killServer();
  }, 15000);

  test(`split button does not appear when player cannot split`, async () => {
    await initServer(`bothNoBlackjack`);
    await pages[0].goto(APP);

    dialogValue = "100"
    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await expect(pages[0].waitForSelector('#playSplit', {timeout:200})).rejects.toThrow('timeout');
    killServer();
  }, 15000);

  test(`bets visually split into two once split button is pressed`, async () => {
    await initServer(`playerSplits`);
    await pages[0].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    // add code to test two child divs in "horizontolScroll playerHands" div
    const numberOfBets = await pages[0].$eval('#playerHands', el => el.childElementCount);
    expect(numberOfBets).toBe(2);
    killServer();
  }, 15000);

  test(`when player splits with two aces, he automatically gets one card for each hand and stands`, async () => {
    await initServer(`playerSplitsAces`);
    await pages[0].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    await expect(pages[0].waitForSelector('#playStand', {timeout:500})).rejects.toThrow('timeout');
    killServer();
  }, 15000);

  test(`when player splits with two aces and gets blackjacks, he doesn't get paid 1.5x`, async () => {
    await initServer(`playerSplitsAcesGetsBlackjacks`);
    await pages[0].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0]
      .waitForSelector('#playSplit', {timeout:200})
      .then(async () =>  {
        await pages[0].$eval('#playSplit', el => el.click());
      });
    await expect(pages[0].waitForSelector('#playStand', {timeout:500})).rejects.toThrow('timeout');
    const chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
    expect(chipsInHand).toBe('Chips: 1020');
    killServer();
  }, 15000);
});


describe('feature: players can place insurance bets', () => {

  test(`when dealer's first card is an ace, game status switches to getting insurance bets`, async () => {
    await initServer(`dealerHasBlackjackDeck`);
    await pages[0].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    dialogValue = "5"
    let messages = await pages[0].$eval('#messageLog', el => el.innerHTML);
    expect(messages).toMatch(/Buy insurance/);

    await pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
    await pages[0].$eval('#placeInsuranceBet', el => el.click());
    let chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
    /* 
    // no longer need this since the promise race ends the timer
    expect(chipsInHand).toBe('Chips: 85');

    await new Promise((resolve, reject) => {
      setTimeout(async () => {
        chipsInHand = await pages[0].$eval('#chipsInHand', el => el.innerHTML);
        resolve();
      }, 3000);
    })
    */

    expect(chipsInHand).toBe('Chips: 1000');

    killServer();
  }, 15000);

  test(`insurance buttons appear when dealer gets first card ace, no other buttons`, async () => {
    await initServer(`dealerHasBlackjackDeck`);
    await pages[0].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await expect(pages[0].waitForSelector('#playHit', {timeout:200})).rejects.toThrow('timeout');
    await expect(pages[0].waitForSelector('#playStand', {timeout:200})).rejects.toThrow('timeout');
    await pages[0].waitForSelector('#placeInsuranceBet', {timeout:200});
    await pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:200});
    await pages[0].$eval('#dontPlaceInsuranceBet', el => el.click());
    killServer();
  }, 15000);

  test(`insurance buttons do not appear when dealer has no first card ace`, async () => {
    await initServer(`bothNoBlackjack`);
    await pages[0].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await expect(pages[0].waitForSelector('#placeInsuranceBet', {timeout:200})).rejects.toThrow('timeout');
    await expect(pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:200})).rejects.toThrow('timeout');
    await pages[0].waitForSelector('#playHit', {timeout:200});
    await pages[0].waitForSelector('#playStand', {timeout:200});
    await pages[0].$eval('#playStand', el => el.click());

    killServer();
  }, 15000);

  test(`insurance buttons appear when dealer gets first card ace, and disappear after player places insurance bet`, async () => {
    await initServer(`dealerHasBlackjackDeckTwoPlayer`);
    await pages[0].goto(APP);
    await pages[1].goto(APP);

    await pages[0].waitForSelector('#joinGame');
    await pages[0].$eval('#joinGame', el => el.click());
    await pages[1].waitForSelector('#joinGame');
    await pages[1].$eval('#joinGame', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await pages[0].$eval('#placeBet', el => el.click());
    await pages[1].$eval('#placeBet', el => el.click());

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 5100);
    });

    await expect(pages[0].waitForSelector('#playHit', {timeout:100})).rejects.toThrow('timeout');
    await expect(pages[0].waitForSelector('#playStand', {timeout:100})).rejects.toThrow('timeout');
    await pages[0].waitForSelector('#placeInsuranceBet', {timeout:300});
    await pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:300});
    await pages[0].$eval('#dontPlaceInsuranceBet', el => el.click());
    await expect(pages[0].waitForSelector('#placeInsuranceBet', {timeout:100})).rejects.toThrow('timeout');
    await expect(pages[0].waitForSelector('#dontPlaceInsuranceBet', {timeout:100})).rejects.toThrow('timeout');
    await pages[1].waitForSelector('#placeInsuranceBet', {timeout:300});
    await pages[1].waitForSelector('#dontPlaceInsuranceBet', {timeout:300});
    killServer();
  }, 15000);
});

