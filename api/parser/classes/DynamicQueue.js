const cluster = require('cluster')
const { whoIs } = require('../async_handlers/asyncClusterUtils')
const { Rule } = require('../../../models/index')
/**
 * Метод loop() -- должен быть один на всё приложение,
 * т.к очередь обращается к singleton парсеру, пусть пока тоже будет singleton
 */
class DynamicQueue {
  instance = null
  parser = null
  isWork = false // Флаг работы

  constructor(parser) {
    if (DynamicQueue.instance instanceof DynamicQueue) {
      console.log('DynamicQueue.constructor: возвращён экземпляр объекта!') // (!) Отладка
      return DynamicQueue.instance
    }
    if (parser) {
      console.log('DynamicQueue.constructor: Singleton DynamicQueue создан!') // (!) Отладка
      this.instance = this
      this.parser = parser
      DynamicQueue.instance = this
      return DynamicQueue.instance
    }
    throw 'DynamicQueue.constructor: parser неопределён'
  }

  // stop() {
  //   this.isWork = false
  // }

  /**
   * Метод бесконечной обработки динамических правил
   */
  async loop() {
    // Включаем бесконечный цикл
    this.isWork = true
    // console.log('DynamicQueue: ', parser)
    // Бесконечный цикл работы (пока включён)
    let getOnceInfoFlag = true // (!) Отладка
    let tick = new Date() // (!) Отладка

    const loopTick = async () => {
      if (this.isWork) {
        // Если очередь парсера с динамическиими правилами не пуста
        if (this.parser.dynamicQueue.length) {
          let readyRules = [] // готовые правила

          // Отбираем готовые, оставляем -- не готовые
          this.parser.dynamicQueue = this.parser.dynamicQueue.filter((rule) => {
            let check = false
            if (rule.dataValues) {
              check = rule.needCheck()
            } else {
              const rez = Rule.build(rule, { isNewRecord: false })
              check = rez.needCheck()
              // console.log('rez:', rez, 'check:', check)
            }

            // Если правилу пока ещё не нужна проверка, то остаётся
            if (!check) {
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
          if (readyRules.length) {
            console.log(
              `loop(): Найдено готовых правил (readyRules): ${readyRules.length}`
            )
            getOnceInfoFlag = true // тогда "выведи вконце инфу один раз"
          } else {
            if (getOnceInfoFlag || new Date() - tick > 15000) {
              const queueLength = this.parser.dynamicQueue.length
              // if (getOnceInfoFlag === false) {
              //   process.stdout.moveCursor(0, -(queueLength * 3 + 1))
              // }

              // Буфер для перезаписи
              let buffStr = `Всего в parser.dynamicQueue правил:  ${queueLength}\n`

              // Пробегаем по parser.dynamicQueue ещё раз и рассчитываем оставшееся время
              this.parser.dynamicQueue.forEach((rule) => {
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

              // if (getOnceInfoFlag === false) {
              //   process.stdout.moveCursor(0, -(queueLength * 2), () => {
              //     process.stdout.clearScreenDown(() =>
              //       process.stdout.write(buffStr)
              //     )
              //   })
              // } else {
              //   process.stdout.write(buffStr)
              // }
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
              // Какой-то лютый тупняк
              // Ждём свободного воркера в синхронном главном процессе
              let workerId = false

              console.log(`${whoIs()} loop(): поиск воркеров...`)
              workerId = await this.parser.getWorker()
              console.log(`${whoIs()} loop(): воркер найден`, workerId)

              // Закинули правило на обработку Worker'у и забыли
              console.log(
                cluster.workers[workerId].send({
                  target: 'checkDynamicRule',
                  rule,
                })
                  ? `Сообщение отолслано к workerId ${workerId}`
                  : `Не удалось отослать к workerId ${workerId}`
              )
            } catch (error) {
              console.log(`Ошибка в DynamicQueue.loop() :`, error)
            }
          } // -- Цикл по готовым правилм
        } // -- Условие: parser.dynamicQueue не пустая
        setImmediate(loopTick)
      } // -- Бесконечный цикл
    }
    await loopTick()
    console.log('loop() завершён...')
  } // -- loop()
}

module.exports = { DynamicQueue }
