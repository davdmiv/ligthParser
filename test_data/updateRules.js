require('dotenv').config()

const { sequelize, Rule } = require('../models/index')

;(async () => {
  try {
    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    // await parser.initialQueue()

    let allRules = await Rule.findAll()

    for (idx in allRules) {
      const randomTime = (Math.floor(Math.random() * 84) + 6) * 10000
      await allRules[idx].update({ frequency: new Date(randomTime) })
    }
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
