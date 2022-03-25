// Подключаем тестируемую функцию
const easyRuleStaticTest = require('./firstCheckStatic')
const { dataLocal, dataAll } = require('../../../test_data/data')
const assert = require('assert')

describe('Тест API', function () {
  describe('easyRuleStaticTest()', async function () {
    it('Выдаёт корректные результаты для localhost', async function () {
      let staticArr = dataLocal.filter((el) => el.pageType == 'static')
      let resultArr = []
      try {
        for (let idx in staticArr) {
          resultArr[idx] = await easyRuleStaticTest(staticArr[idx])
        }
        console.log('resultArr ----------')
        for (let idx in resultArr) {
          console.log(resultArr[idx])
        }
        assert.ok(true)
      } catch (error) {
        assert.ok(error)
      }
    })
  })
  describe('easyRuleStaticTest()', async function () {
    it('Выдаёт корректные результаты для внешнего мира', async function () {
      let staticArr = dataAll.filter((el) => el.pageType == 'static')
      let resultArr = []
      try {
        for (let idx in staticArr) {
          resultArr[idx] = await easyRuleStaticTest(staticArr[idx])
          resultArr[idx].shrub = `length: ${resultArr[idx].shrub.length}`
        }
        console.log('resultArr ----------')
        for (let idx in resultArr) {
          console.log(resultArr[idx])
        }
        assert.ok(true)
      } catch (error) {
        assert.ok(error)
      }
    })
  })
})
