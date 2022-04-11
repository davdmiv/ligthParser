const cluster = require('cluster')
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')
const AMQPController = require('./queue')

;(async () => {
  console.log(`${whoIs()} стартовал.`)

  const queue = new AMQPController()
  queue.start()

  console.log(`${whoIs()} после queue.start()`)

  if (cluster.isMaster) {
    for (let i = 0; i < 3; i++) {
      cluster.fork()
    }

    setInterval(function () {
      queue.publish('', 'jobs', new Buffer.from('work work work'))
    }, 1000)
  }

  process.once('SIGINT', function () {
    queue.amqpConn.close()
    console.log(`${whoIs()} закрыл соединение`)
  })
})()
