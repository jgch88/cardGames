class Observable {
  constructor() {
    this._observers = [];
  }

  registerObserver(observer) {
    this._observers.push(observer);
  }

  removeObserver(observer) {
    this._observers = this._observers.filter(o => o !== observer);
  }

  _notifyObservers(data) {
    this._observers.forEach(observer => {
      observer.update(data);
    });
  }
}

module.exports = Observable;
