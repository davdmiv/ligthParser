const cluster = require('cluster')
const { whoIs } = require('../async_handlers/asyncClusterUtils')
const { Rule } = require('../../../models/index')
/**
 * Метод loop() -- должен быть один на всё приложение,
 * т.к очередь обращается к singleton парсеру, пусть пока тоже будет singleton
 */
class ParseQueue {
  instance = null
  parser = null
  isWork = false // Флаг работы

  constructor(parser) {
    // // Singleton
    if (ParseQueue.instance instanceof ParseQueue) {
      return ParseQueue.instance
    }
    if (parser) {
      this.instance = this
      this.parser = parser
      ParseQueue.instance = this
      return ParseQueue.instance
    }
    throw 'ParseQueue.constructor: parser неопределён'
  }

  stop() {
    this.isWork = false
  }

  /**
   * Метод бесконечной обработки динамических правил
   * Отбираем из parser.activeRules в локальную readyRules
   */
  async loop() {
    // Включаем бесконечный цикл
    this.isWork = true
    // Бесконечный цикл работы (пока включён)

    const loopTick = async () => {
      if (this.isWork) {
        // Если очередь парсера с динамическиими правилами не пуста
        if (this.parser.activeRules.length) {
          // готовые правила
          let readyRules = []

          // Изымаем готовые из parser.activeRules, оставляем остальные
          this.parser.activeRules = this.parser.activeRules.filter((rule) => {
            let check = false
            if (rule.dataValues) {
              check = rule.needCheck()
            } else {
              const rez = Rule.build(rule, { isNewRecord: false })
              check = rez.needCheck()
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

          // Если в массиве готовых правил, есть правила
          while (readyRules.length) {
            // Нет смысла дожидаться конца обработки очереди готовых,
            // если парсер остановлен
            if (!this.isWork) {
              console.log(
                ' while (readyRules.length) : !this.isWork : cработало'
              )
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
              if (rule.page_type === 'dynamic') {
                cluster.workers[workerId].send({
                  target: 'checkDynamicRule',
                  rule,
                })
              } else {
                cluster.workers[workerId].send({
                  target: 'checkStaticRule',
                  rule,
                })
              }
            } catch (error) {
              console.log(`Ошибка в ParseQueue.loop() :`, error)
            }
          } // -- Цикл по готовым правилм
        } // -- Условие: parser.ParseQueue не пустая
        setImmediate(loopTick)
      } // -- Бесконечный цикл
    }
    await loopTick()
    console.log('loop() завершён...')
  } // -- loop()
}

module.exports = { ParseQueue }
