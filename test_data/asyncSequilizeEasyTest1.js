require('dotenv').config()
const cluster = require('cluster')

const { sequelize, ChangeNote, Rule } = require('../models/index')

// const sequelizeShutdown = async () => {
//   try {
//     await sequelize.close()
//   } catch (error) {
//     console.error('Какие-то ошибки при закрытие бд:', error)
//   }
// }

;(async () => {
  // Мaster
  if (cluster.isMaster) {
    try {
      // ++ Соединяется с БД
      await sequelize.authenticate()
      await sequelize.sync()
      // -- Соединяется с БД
      console.log('Мастер подключился к бд')
    } catch (e) {
      console.log('Ошибка в коде', e)
    }

    const numCPUs = require('os').cpus().length

    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork()
    }

    let callCtn = 0

    /**
     * Обработка сообщений от воркеров
     */
    cluster.on('message', async (worker, msg) => {
      if (msg.changeNotes) {
        console.log('Master получил changeNote:', msg.changeNote)
      }
      
      if (msg.rules) {
        console.log('Master получил rules:', msg.rule)
      }

      console.log('Количество вызовов: ', ++callCtn)
    })

    // worker.on('exit', sequelizeShutdown)
    // worker.on('error', sequelizeShutdown)
  } else if (cluster.isWorker) {
    console.log('Перед запросом')
    try {
      let changeNotes = await ChangeNote.findAll()
      console.log('Запрос changeNotes выполнен')
      cluster.worker.send({ changeNotes })
    
    } catch (error) {
      console.log('changeNotes worker error:', error)
    }

    try {
      let rules = await Rule.findAll()
      console.log('Запрос rules выполнен:', rules.length)

      cluster.worker.send({ rules })
    } catch (error) {
      console.log('rule worker error:', error)
    }
  }
})()
