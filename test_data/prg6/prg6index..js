const cluster = require('cluster')
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')
const AMQPController = require('./queue')

;(async () => {
  
  console.log(`${whoIs()} стартовал.`)

  const queue = new AMQPController()
  queue.start()

  if (cluster.isMaster) {
    for (let i = 0; i < 3; i++) {
      cluster.fork()
    }
    // Исполняем инициализацию для master
    require('./prg4master')
  }
  // Если ты worker
  else if (cluster.isWorker) {
    // Исполняем инициализацию для worker
    require('./prg6worker')
  }
})()