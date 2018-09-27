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



