const cluster = require('cluster')
// Очереди ---------------------------------------------------------
const amqp = require('amqplib/callback_api')
// Коннект, чтобы дёргать другие функции вне колбека
let amqpConn = null

// Коннектимся
amqp.connect('amqp://localhost', function (err, conn) {
  // На ошибку во время открытия
  if (err) {
    console.error('[AMQP]', err.message)
    return 1
    // return setTimeout(start, 1000)
  }
  // На ошибку в процессе
  conn.on('error', function (err) {
    if (err.message !== 'Connection closing') {
      console.error('[AMQP] conn error', err.message)
    }
  })
  // На закрытие
  conn.on('close', function () {
    console.error('[AMQP] reconnecting')
    return setTimeout(start, 1000)
  })
  console.log('[AMQP] connected')
  // присваиваем коннект
  amqpConn = conn
  // whenConnected()
})

// Обработка события 'message' на worker
cluster.worker.on('message', workerMessageHandler)

