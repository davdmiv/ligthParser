require('dotenv').config()

const { sequelize, Rule, ChangeNote } = require('../models/index')

;(async () => {
  try {
    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    console.log(`lightParser: authenticated.`)

    // Rule.truncate({ cascade: true }) -- удаляет всё, все данные и по ссылке.
    // Rule.destroy({ truncate: true, cascade: true }) -- эффект аналогичный
    // Rule.drop({ cascade: true }) -- удаляет таблицу
    let resRule = await Rule.truncate({ cascade: true })

    let resCNote = await ChangeNote.truncate({ cascade: true })

    console.log('lightParser:  Rule.truncate', resRule)
    console.log('lightParser:  ChangeNote.truncate', resCNote)
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
