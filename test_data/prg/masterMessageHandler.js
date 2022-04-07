const cluster = require('cluster')
const { whoIs, CR } = require('../../api/parser/async_handlers/asyncClusterUtils')

/**
 * -------------------------------------------------
 * Обработка события 'message' на Master'e
 * @param {*} worker
 * @param {*} msg
 */
 const masterMessageHandler = async (worker, msg) => {
  console.log(`${whoIs()}, получил сообщение: ${msg}${CR}`)
  // await sleep(500)
  // --------------------------------------------------------------
  // Воркер сообщил о готовности
  if (msg.target === 'workerIsReady') {
    // Отправляем сообщение в очередь
    // 
    publish('', 'jobs', new Buffer.from(`Тестовое правило №${testRuleNum++}`))
  }

  // --------------------------------------------------------------
  // Пришёл ответ от проверки
  if (msg.target === 'checkRule') {
    publish('', 'jobs', new Buffer.from(`Тестовое правило №${testRuleNum++}`))
  }
}
// -------------------------------------------------

module.exports = {
  masterMessageHandler,
}