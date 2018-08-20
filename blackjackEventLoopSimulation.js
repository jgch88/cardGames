// test cases via simulation
// use routes via server to handle the listening of these
// moves
const game = Object.create(Game);
game.init();
game.joinGame('John', 100);
game.joinGame('Jane', 100);
game.joinGame('John', 100); // player name in use
game.joinGame('Jaz', 100);
game.placeBet('John', 50); // can't bet during this stage
game.play('John', 'stand'); // can't play during this stage
game.joinGame('Jae', 0); // not enough chips
game.joinGame('Jae', 1000); // spectator, who sits at table but doesn't bet

game.changeState(gettingBetsState);
game.joinGame('Jane', 100); // invalid, can't join (request ignored);
game.placeBet('John', 50);
game.placeBet('Jaz', 5);
game.placeBet('Jon', 50); // player not found
game.placeBet('Jane', 500); // not enough chips
game.placeBet('Jane', 50);

game.changeState(checkDealerForNaturals);
game.play('Jaz', 'stand'); // not Jaz's turn
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit');
game.play('John', 'hit'); // intentionally want John to burst

game.play('Jane', 'stand'); 
game.play('Jaz', 'stand');
// there's an error where the player array order is differnt from the bet order...
// fixed it in gettingPlaysState.js
