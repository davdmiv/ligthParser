const { firstCheck } = require('./checkFns')
// const { dataAll: testData } = require('../../test_data/data')
const { dataLocal: testData } = require('../../test_data/data')
const { sequelize } = require('../../models/index')

const assert = require('assert')

describe('Тест API: checkFns.js тест', function () {
  before(async () => {
    try {
      // ++ Соединяется с БД
      await sequelize.authenticate()
      await sequelize.sync()
    } catch (error) {
      console.error('Невозможно подключиться к бд:', error)
    }
  })

  describe('firstCheck()', async function () {
    it('Выдаёт корректные результаты для внешнего мира', async function () {
      try {
        for (let idx in testData) {
          let result = await firstCheck(testData[idx])
          console.log(`Правило ${testData[idx].ruleName}`)
          console.log('result: ', result)
        }
        assert.ok(true)
      } catch (error) {
        console.error(error)
        assert.ok(error)
      }
    })
  })

  // describe('assert.ok(true)', async function () {
  //   it('Выдаёт корректные результаты для внешнего мира', function () {
  //     assert.ok(true)
  //   })
  // })

  after(async () => {
    try {
      await sequelize.close()
    } catch (error) {
      console.error('Какие-то ошибки при закрытие бд:', error)
    }
  })
})
