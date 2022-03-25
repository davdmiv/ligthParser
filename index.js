require('dotenv').config()
const db = require('./api/dbController')

const { sequelize } = require('./models/index')

// Добавляем тестовые данные 
const {dataLocal: testData} = require('./test_data/data')

const start = async () => {
  try {
    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    console.log(`lightParser: authenticated.`)

    for (idx in dataLocal){
      let {url, shrubRule, pageType} = dataLocal[idx] 
      
    }
    // ++ Достаёт все актуальные правила из правил
    // await db.queueInit()
    // -- Достаёт все актуальные правила из правил

    // console.log(`lightParser: the queue has been initialized.`)

    // ++ Тест добавления
    await db.sumpleInsert()
    // -- Тест добавления

    console.log('lightparser: end of insert test')
  } catch (e) {
    console.log(e)
  }
}

start()
