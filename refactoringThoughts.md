Game class responsibility

1. Hold Game Data
2. Delegate behaviour to state pattern substates

const Game = {
    data: {
        deck
        roomName
        timerDuration
        dealer
        players: player
        bets
        currentBet
        messageLog
    }

    init(roomName)
    setTimerDuration(duration) // private field
    getGameDataState()
    _setState()

    // other methods that change data not delegated to state pattern substates
    _logMessage(message)

    // delegated methods that change data
    joinGame(playerName, chips)
    changeNickname(playerName, newNickname)
    placeBet(playerName, chips) // need to DRY and abstract bet/insuranceBet
    placeInsuranceBet(playerName, chips)
    play(playerName, move)

    
}

Other responsibilities to refactor into their own subclasses/interfaces

registerObserver(o)
removeObserver(o)
notifyObservers()

// Was keeping messageLogMessages when that's the wrong level of abstraction, it should
// be messageLog!


render() // is actually another function/class's job to use getGameDataState() and minify it


The io socket object can use an adapter to be an observer to emit state


// Thoughts after refactoring (1 Oct 2018)
Untangling reponsibilities (especially coupled functions) probably comes from "at the time it was
a good idea to couple the function to reuse duplication", but now we need to split the functions into two and then propagate
this throughout the app because we actually know why we need to decouple it back again to follow
a certain design pattern.

good to write out the FLOW of the pattern being implemented:
mutate gameData/gameState -> call gameDataChanged() -> notifyObservers() (the emitter) -> emit via socket.io to frontend


NEXT STEPS:
Tidy up State Pattern (don't expose a "changeState()" method if we're going to let subclasses be responsible for transitions, turn it into _changeState())

Use the Command Pattern (so that we can abstract away all the actions "joinGame", "changeNickname", "placeBet", "play" .etc)

