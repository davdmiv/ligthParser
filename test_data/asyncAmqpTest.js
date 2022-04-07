const cluster = require('cluster')
const amqp = require('amqplib/callback_api')

// Утилита идентификации для логов
const whoIs = () =>
  `${cluster.isMaster ? 'Master' : 'Worker'} pid(${process.pid})`
const pauseForResponse = () => (Math.floor(Math.random() * 12) + 3) * 10000
const getWaitingTime = (time) =>
  new Date(time).toISOString().match(/T((.)*).(...)Z/)[1]
const CR = '\n-----------------------'

// -------------------------------------------------
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

/**
 * -------------------------------------------------
 * Обработка события 'message' на Master'e
 * @param {*} worker
 * @param {*} msg
 */
const masterMessageHandler = async (worker, msg) => {
  console.log(`${whoIs()}, получил сообщение: ${msg}${CR}`)
  await sleep(500)

  //Кластер посылает воркеру сообщение
  // cluster.workers[worker.id].send(`Привет от ${whoIs()}`)
}
// -------------------------------------------------

/**
 * -------------------------------------------------
 * Обработка события 'message' на Worker'e
 * @param {*} msg
 */
const workerMessageHandler = async (msg) => {
  const pauseTime = pauseForResponse()

  let logMsg = `${whoIs()}, получил сообщение: ${msg}\n`
  logMsg += `   Ответ будет отправлен через ${getWaitingTime(pauseTime)}${CR}`

  console.log(logMsg)

  await sleep(pauseForResponse)

  console.log(
    cluster.worker.send(`Привет от ${whoIs()}!`)
      ? `${whoIs()} отправил ответ.${CR}`
      : `${whoIs()} не отправил ответ :(${CR}}`
  )
}
// -------------------------------------------------

// -------------------------------------------------
// Main
;(async () => {
  // Лог кто ты
  console.log(`${whoIs()} запущен ${CR}`)
  let msgNum = 1

  // ++ Инициализация очереди на master ============================================
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0
    }
    // connection внутри cb amqp.connect
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      const queue = 'rulespool'
      let msg = `Rule на обработку #${msgNum}`

      channel.assertQueue(queue, {
        durable: false,
      })

      channel.sendToQueue(queue, Buffer.from(msg))

      console.log(`${whoIs()} отправил сообщение в очередь:`, msg)
    })
  })
  // -- Инициализация очереди на worker ============================================

  // Если ты master
  if (cluster.isMaster) {
    const numCPUs = require('os').cpus().length

    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork()

      // Запускаем рулетку, отправляем сообщение каждому новому созданному воркеру
      // worker.send(`Hello! От ${whoIs()}`)
    }

    // Обработка события 'message' на master
    cluster.on('message', masterMessageHandler)
  }
  // Если ты worker
  else if (cluster.isWorker) {
    // ++ Инициализация очереди на master ============================================
    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        throw error0
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1
        }
        const queue = 'rulespool'
        // Типо подписываемся на очередь
        channel.assertQueue(queue, {
          durable: false,
        })
        // Получение сообщений
        channel.consume(
          queue,
          function (msg) {


            console.log(`${whoIs()} полчуил сообщение: `, msg.content.toString())
            console.log(
              cluster.worker.send(`Привет от ${whoIs()}!`)
                ? `${whoIs()} отправил ответ.${CR}`
                : `${whoIs()} не отправил ответ :(${CR}}`
            )
          },
          {
            noAck: true,
          }
        )
      })
    })


    // -- Инициализация очереди на worker ============================================

    // Обработка события 'message' на worker
    console.log('')
    cluster.worker.on('message', workerMessageHandler)
  }
})()
