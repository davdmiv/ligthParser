require('dotenv').config()
// Кластер
const cluster = require('cluster')
// ParserController
const { ParserController } = require('./parser/classes/ParserController')
// Библиотека для работы с БД, инстанс
const { sequelize } = require('../models/index')
// Оброботчик события message для Master
const {
  masterMessageHandler,
} = require('./parser/async_handlers/masterHandlers')

// const numCPUs = require('os').cpus().length
;(async () => {
  try {
    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    const parser = new ParserController()

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
})()
