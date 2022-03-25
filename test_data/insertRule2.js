require('dotenv').config()

const { sequelize, Rule } = require('../models/index')

;(async () => {
  try {
    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    console.log(`lightParser: authenticated.`)

    // let time = '1970-01-01T00:00:00.015Z'.match(/T((.)*)Z/)[1]

    let res = await Rule.create({
      name: 'static-test2',
      url: 'http://localhost:3001/static/html/static_page3.html',
      shrub_rule: 'div[src-data="static post #3"]',
      shrub_cache: 'c616980fba92334ec30bb2fc08bc8021',
      frequency: '1970-01-02T00:00:00.000Z',
      page_type: 'static',
      page_changed: '2022-03-22T13:59:09.962Z',
      last_check: '2022-03-22T13:59:09.962Z',
      duration: time,
      public_status: false,
      description: '',
      activate_cnt: 0,
      activate_status: true,
      user_id: 1,
    })

    console.log('lightParser: res: ', res)
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
