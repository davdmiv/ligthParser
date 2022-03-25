class StaticQueue {
  instance = null
  constructor() {
    if (StaticQueue.instance instanceof StaticQueue) {
      return DynamicQueue.instance
    }

    StaticQueue.instance = this
    return StaticQueue.instance
  }

  //
}

module.exports = StaticQueue
