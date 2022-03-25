const checkDynamicRule = require('../check_functions/checkDynamicRule')
const ApiError = require('../../error/ApiError')

/**
 * Метод loop() -- должен быть один на всё приложение,
 * т.к очередь обращается к singleton парсеру, пусть пока тоже будет singleton
 */
class DynamicQueue {
  instance = null

  // Флаг работы
  isWork = false

  constructor() {
    if (DynamicQueue.instance instanceof DynamicQueue) {
      console.log(
        'DynamicQueue.constructor: возвращён экземпляр объекта!',
        DynamicQueue.instance
      ) // (!) Отладка
      return DynamicQueue.instance
    }
    console.log('DynamicQueue.constructor: Singleton DynamicQueue создан!') // (!) Отладка
    DynamicQueue.instance = this
    return DynamicQueue.instance
  }

  stop() {
    this.isWork = false
  }

  /**
   * Метод бесконечной обработки динамических правил
   */
  async loop() {
    const parser = require('../../ParserController')
    let getOnceInfoFlag = true // (!) Отладка
    let tick = new Date() // (!) Отладка

    // Включаем бесконечный цикл
    this.isWork = true
    // console.log('DynamicQueue: ', parser)
    // Бесконечный цикл работы (пока включён)
    while (this.isWork) {
      // Если очередь парсера с динамическиими правилами не пуста
      if (parser.dynamicQueue.length != 0) {
        let readyRules = [] // готовые правила

        // Отбираем готовые, оставляем -- не готовые
        parser.dynamicQueue = parser.dynamicQueue.filter((rule) => {
          // Если правилу пока ещё не нужна проверка, то остаётся
          if (!rule.needCheck()) {
            // Если не готово, то оставляем его в очереди
            return true
          } else {
            // Если готово, то изымаем его в массив на обработку
            readyRules.push(rule)
            return false
          }
        })

        // (!) Отладка ------------------------------------
        // Если количество готовых правил не 0
        if (readyRules.length !== 0) {
          console.log(
            `loop(): Найдено готовых правил (readyRules): ${readyRules.length}`
          )
          getOnceInfoFlag = true // тогда "выведи вконце инфу один раз"
        } else {
          if (getOnceInfoFlag || new Date() - tick > 1000) {
            const queueLength = parser.dynamicQueue.length
            if (getOnceInfoFlag === false) {
              process.stdout.moveCursor(0, -(queueLength * 2 + 1))
            }
            // если "выведи вконце инфу один раз"
            console.log(`Всего в parser.dynamicQueue правил: `, queueLength)

            // Буфер для перезаписи
            let buffStr = ''

            // Пробегаем по parser.dynamicQueue ещё раз и рассчитываем оставшееся время
            parser.dynamicQueue.forEach((rule) => {
              const timeNow = Date.now()
              const timeLastCheck = new Date(rule.last_check)
              const timeLeft = new Date(timeNow - timeLastCheck)

              // если прошло времени больше, чем частота, то пора проверять
              const time = new Date(new Date(rule.frequency) - timeLeft)
              buffStr += `Правило ${rule.name}\n`
              buffStr += `Времени до повторного применения: ${
                time.toISOString().match(/T((.)*).(...)Z/)[1]
              }\n`
            })

            process.stdout.write(buffStr)

            getOnceInfoFlag = false
            tick = new Date()
          }
        }
        // (!) Отладка ------------------------------------

        // Если в массиве готовых правил, есть правила
        while (readyRules.length) {
          // Нет смысла дожидаться конца обработки очереди готовых,
          // если парсер остановлен
          if (!this.isWork) {
            break
          }

          let rule = readyRules.shift()

          try {
            // (!) Здесь могла быть вызвана параллельная обработка

            // Получаем обновлённое правило, только что протестированное
            let testedRule = await checkDynamicRule(rule)
            // --

            // Если получаем ошибку по правилу -- правило "выбывает из игры"
            // делаем его неаквтивным
            if (testedRule instanceof ApiError) {
              await rule.update({
                activate_status: false,
                description: `Обнаружена ошибка с правилом, правило деактивировано. \n${rule.description}`,
              })
              console.log(
                `loop(): получил ошибку из checkDynamicRule(), правило ${rule.name}`,
                testedRule
              )
            } else {
              // Запихиваем его обратно в Парсер, в очередь активных
              parser.dynamicQueue.push(testedRule)
              console.log(`loop(): Правило ${testedRule.name} обработано`)
            }
            console.log('loop(): Готовых правил: ', readyRules.length)
            console.log('loop(): Активных правил: ', parser.dynamicQueue.length)
          } catch (error) {
            console.log(`Ошибка в DynamicQueue.loop() :`, error)
          }
        } // -- Цикл по готовым правилм
      } // -- Условие: parser.dynamicQueue не пустая
    } // -- Бесконечный цикл
  } // -- loop()
}

module.exports = new DynamicQueue()
