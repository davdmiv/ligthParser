// ParserController
const { ParserController } = require('../classes/ParserController')
const { Rule } = require('../../../models/index')
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
    // Записали воркер в массив "свободных"
    parser.pushToFreeWorkers(worker.id)

    console.log(`${whoIs()}: parser.freeWorkers:`, parser.freeWorkers.length)
  }

  // --------------------------------------------------------------
  // Запуск парсера
  if (msg.target === 'parserStart') {
    await parser.start()
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
      // Ребилдим правило
      msg.rule = Rule.build(msg.rule, { isNewRecord: false })
      // Добавляем в очередь
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
  if (msg.target === 'checkRule') {
    // Если не была передана ошибка
    if (!msg.error) {
      // Ребилдим правило
      let reBuildRule = Rule.build(msg.testedRule, { isNewRecord: false })
      if (reBuildRule) {
        msg.testedRule = reBuildRule
      } else {
        console.log('MHH ПОТЕРЯ, не сбилдилось в ответе checkRule')
      }
      // Запихиваем его обратно в Парсер, в очередь активных
      parser.addCheckedRule(msg.testedRule)
    } else {
      // Просто выводим лог
      console.log(
        `${whoIs()}: Правило ${
          msg.origRule ? msg.origRule.name : 'имя которого неизветно'
        } обработано c ошибкой`
      )
    }
    // Вернули воркер в массив "свободных"
    parser.pushToFreeWorkers(worker.id)
  }
}

module.exports = {
  masterMessageHandler,
}
