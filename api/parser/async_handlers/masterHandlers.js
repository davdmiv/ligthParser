// ParserController
const { ParserController } = require('../classes/ParserController')

const { whoIs } = require('./asyncClusterUtils')

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
  
  // --------------------------------------------------------------
  // Воркер сообщил о готовности 
  if (msg.target === 'workerIsReady') {
    // Записываем ids Worker'ов в инстанс парсера
    parser.freeWorkers.push(worker.id)

    console.log(`${whoIs()}: parser.freeWorkers:`, parser.freeWorkers.length)
  }

  // --------------------------------------------------------------
  // Запуск парсера 
  if (msg.target === 'parserStart') {
    await parser.initialQueue()
    parser.start()
  }

  // --------------------------------------------------------------
  // Отправляем сигнал остановки на парсер
  if (msg.target === 'parserStop') {
    parser.stop()
  }

  // --------------------------------------------------------------
  // Добавляем правило в очередь активных
  if (msg.target === 'activateRule') {
    if (msg.rule) {
      parser.addActiveRule(msg.rule)
    } else {
      console.log(`${whoIs()}: activateRule: правило не опеределено`)
    }
  }

  // --------------------------------------------------------------
  // Исключаем правило из очереди активных (если оно там есть)
  if (msg.target === 'deactivateRule') {
    if (msg.ruleId) {
      parser.excludeRule(msg.ruleId)
    } else {
      console.log(`${whoIs()}: activateRule: правило не опеределено`)
    }
  }

  // --------------------------------------------------------------
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

module.exports = {
  masterMessageHandler,
}
