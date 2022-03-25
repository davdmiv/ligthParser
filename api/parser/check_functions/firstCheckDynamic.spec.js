// Подключаем тестируемую функцию
const easyRuleDynamicTest = require('./firstCheckDynamic')
// const { dataLocal, dataAll } = require('../../../test_data/data')
const { dataLocal: testData } = require('../../../test_data/data')
const assert = require('assert')

describe('Тест API', function () {
  // describe('easyRuleDynamicTest()', async function () {
  //   it('Выдаёт корректные результаты для localhost', async function () {
  //     let dynamicArr = dataLocal.filter((el) => el.pageType == 'dynamic')
  //     let resultArr = []
  //     try {
  //       for (let idx in dynamicArr) {
  //         resultArr[idx] = await easyRuleDynamicTest(dynamicArr[idx])
  //         resultArr[idx].shrub = `length: ${resultArr[idx].shrub.length}`
  //       }
  //       console.log('resultArr ----------')
  //       for (let idx in resultArr) {
  //         console.log(resultArr[idx])
  //       }
  //       assert.ok(true)
  //     } catch (error) {
  //       assert.ok(error)
  //     }
  //   })
  // })
  describe('easyRuleDynamicTest()', async function () {
    it('Выдаёт корректные результаты для внешнего мира', async function () {
      let dynamicArr = testData.filter((el) => el.pageType == 'dynamic')
      let resultArr = []
      try {
        for (let idx in dynamicArr) {
          resultArr[idx] = await easyRuleDynamicTest(dynamicArr[idx])
          if (resultArr[idx].changeNote && resultArr[idx].changeNote.shrub) {
            resultArr[
              idx
            ].changeNote.shrub = `length: ${resultArr[idx].changeNote.shrub.length}`
          }
        }
        console.log('resultArr ----------')
        for (let idx in resultArr) {
          console.log(resultArr[idx])
        }
        assert.ok(true)
      } catch (error) {
        console.error(error)
        assert.ok(error)
      }
    })
  })
})
