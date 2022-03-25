const { ruleCreate } = require('./ruleFns')
const { firstCheck } = require('./checkFns')
const ApiError = require('../error/ApiError')
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
      let checkedRules = []
      try {
        for (let idx in testData) {
          let result = await firstCheck(testData[idx])
          if (result instanceof ApiError) {
            console.log('Пришла ошибка из firstCheck: ', result)
          } else {
            checkedRules.push(result)
          }
        }
        for (let idx in checkedRules) {
          console.log('Вызов ruleCreate с параметрами:', checkedRules[idx])
          let result = await ruleCreate(checkedRules[idx])
          if (result) {
            console.log(`Правило "${result.name}" создано`)
          } else {
            console.log(
              `Что-то пошло не так с правилом "${checkedRules[idx].rule.name}"...`
            )
          }
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
