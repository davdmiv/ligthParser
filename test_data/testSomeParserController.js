require('dotenv').config()

const parser = require('../api/ParserController')

const { sequelize } = require('../models/index')

;(async () => {
  try {
    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    // await parser.initialQueue()
    
    await parser.start()
  } catch (e) {
    console.log(e)
  } finally {
    try {
      await sequelize.close()
    } catch (error) {
      console.error('Какие-то ошибки при закрытие бд:', error)
    }
  }
})()
