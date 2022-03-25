require('dotenv').config()

const { sequelize, ChangeNote, Rule } = require('../models/index')

;(async () => {
  try {
    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    let activeRules = await Rule.findAll({
      where: { activate_status: true },
    })

    activeRules.forEach((el) => {
      console.log(`Rule.name: ${el.name}`)
      console.log('el.needCheck() : ', el.needCheck())
      console.log('==================================')
    })
  } catch (e) {
    console.log('Ошибка в коде', e)
  } finally {
    try {
      await sequelize.close()
    } catch (error) {
      console.error('Какие-то ошибки при закрытие бд:', error)
    }
  }
})()
