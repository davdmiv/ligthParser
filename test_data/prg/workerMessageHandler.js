const cluster = require('cluster')
const { whoIs, CR, sleep } = require('../../api/parser/async_handlers/asyncClusterUtils')

/**
 * -------------------------------------------------
 * Обработка события 'message' на Worker'e
 * @param {*} msg
 */
 const workerMessageHandler = async (msg) => {
  console.log(`${whoIs()}, получил сообщение: ${msg}${CR}`)

  await sleep(3000)

  console.log(`${whoIs()}Сообщение от `)
}
// -------------------------------------------------

module.exports = {
  workerMessageHandler,
}