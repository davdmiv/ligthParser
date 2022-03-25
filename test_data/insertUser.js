require('dotenv').config()

const { sequelize, User } = require('../models/index')

;(async () => {
  try {
    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    console.log(`lightParser: authenticated.`)

    // User.create({
    //   email: 'admin@ya.ru',
    //   password:
    //     '$2b$05$RgLzuOqZAVwUKthu2iYvg.M3mr3bNxSby0pJneCeqi3pg6kh8lcdq', //password
    //   nikname: 'admin',
    // })

    let res = await User.bulkCreate([
      {
        id: 1,
        email: 'admin1@mail.com',
        password:
          '$2b$05$RgLzuOqZAVwUKthu2iYvg.M3mr3bNxSby0pJneCeqi3pg6kh8lcdq', //password
        nikname: 'admin 1',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])

    console.log('lightparser: end of insert test')
    console.log('res: ', res)
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
