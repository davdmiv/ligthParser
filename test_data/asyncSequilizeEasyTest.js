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

    const worker = cluster.fork()
    let callCtn = 0
    cluster.on('message', async (worker, msg) => {
      if (msg.changeNotes) {
        console.log('Master получил changeNotes:', msg.changeNotes)
      }
      if (msg.rules) {
        console.log('Master получил rules:', msg.rules)
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
    console.log('После запроса changeNotes')
    console.log('Перед запросом rules')
    try {
      let rules = await Rule.findAll()
      console.log('Запрос rules выполнен:', rules.length)

      cluster.worker.send({ rules })
    } catch (error) {
      console.log('rule worker error:', error)
    }
    console.log('После запроса rules')
  }
})()
