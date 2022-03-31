const cluster = require('cluster')

const { sequelize } = require('../models/index')

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
  cluster.workers[worker.id].send(`Привет от ${whoIs()}`)
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

  // Если ты master
  if (cluster.isMaster) {
    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    const numCPUs = require('os').cpus().length

    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork()

      // Запускаем рулетку, отправляем сообщение каждому новому созданному воркеру
      worker.send(`Hello! От ${whoIs()}`)
    }

    // Обработка события 'message' на master
    cluster.on('message', masterMessageHandler)
  }
  // Если ты worker
  else if (cluster.isWorker) {
    // Обработка события 'message' на worker
    console.log('')
    cluster.worker.on('message', workerMessageHandler)
  }
})()
