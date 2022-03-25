require('dotenv').config()

const { sequelize, ChangeNote, Rule } = require('../models/index')

;(async () => {
  try {
    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    console.log(`lightParser: authenticated.`)

    let changeNoteBefore = await ChangeNote.findByPk(3)
    console.log('changeNoteBefore: findByPk: ', changeNoteBefore)

    let rule = await Rule.findByPk(1)
    console.log('rule: ', rule)

    changeNoteBefore.setRule(rule)
    console.log('changeNoteBefore: setRule:', changeNoteBefore)

    let res = await changeNoteBefore.save()

    console.log('res: ', res)
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
