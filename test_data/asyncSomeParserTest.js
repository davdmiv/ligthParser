require('dotenv').config()

// Кластер
const cluster = require('cluster')

// ParserController
const { ParserController } = require('../api/ParserController')

// БД
const { sequelize } = require('../models/index')

const { whoIs } = require('../api/parser/async_handlers/asyncClusterUtils')
const {
  masterMessageHandler,
} = require('../api/parser/async_handlers/masterHandlers')
const {
  workerMessageHandler,
} = require('../api/parser/async_handlers/workerHandlers')

// -------------------------------------------------
// Main ++
;(async () => {
  console.log(`${whoIs()} стартовал.`)
  if (cluster.isMaster) {
    try {
      // ++ Соединяется с БД
      await sequelize.authenticate()
      await sequelize.sync()
      // -- Соединяется с БД

      const parser = new ParserController()

      // const numCPUs = require('os').cpus().length

      for (let i = 0; i < 6 /*numCPUs*/; i++) {
        const worker = cluster.fork()
      }

      // // Обработка события 'message' на master
      cluster.on('message', masterMessageHandler)

      await parser.initialQueue()
      // Стартуем парсер
      parser.start()
    } catch (e) {
      console.log(e)
    }
  }
  // Если ты worker
  else if (cluster.isWorker) {
    //При запуске посылают на мастер 'workerIsReady' что готовы
    console.log(
      cluster.worker.send({ target: 'workerIsReady' })
        ? `${whoIs()} сообщил о готовности`
        : `${whoIs()} не смог сообщить о готовности`
    )
    // Вешаем обработчик сообщений на Worker'а
    cluster.worker.on('message', workerMessageHandler)
  }
})()
