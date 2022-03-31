// Кластер
const cluster = require('cluster')

// ParserController
const { ParserController } = require('../../ParserController')

const { whoIs } = require('./asyncClusterUtils')

const ApiError = require('../../error/ApiError')
/**
 * -------------------------------------------------
 * Обработка события 'message' на Master'e
 * @param {*} worker
 * @param {*} msg
 */
const masterMessageHandler = async (worker, msg) => {
  console.log(
    `${whoIs()}, MMH получил сообщение '${msg.target}' от id:`,
    worker.id
  )
  const parser = new ParserController()

  // Воркер сообщил о готовности
  if (msg.target === 'workerIsReady') {
    // Записываем ids Worker'ов в инстанс парсера
    parser.freeWorkers.push(worker.id)

    console.log(`${whoIs()}: parser.freeWorkers:`, parser.freeWorkers.length)
  }

  // Пришёл ответ от проверки
  if (msg.target === 'checkDynamicRule' || msg.target === 'checkStaticRule') {
    // Если не была передана ошибка
    if (!msg.error) {
      // Запихиваем его обратно в Парсер, в очередь активных
      parser.activeRules.push(msg.testedRule)
    } else {
      // Просто выводим лог
      console.log(
        `${whoIs()}: Правило ${
          msg.origRule ? msg.origRule.name : 'имя которого неизветно'
        } обработано c ошибкой`
      )
    }
    // Записали сами себя в готовые, надеюсь не рано (!)
    parser.freeWorkers.push(worker.id)
  }
}
// -------------------------------------------------

module.exports = {
  masterMessageHandler,
}
