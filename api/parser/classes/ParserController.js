const cluster = require('cluster')
const { Rule } = require('../../../models/index')
const { whoIs } = require('../async_handlers/asyncClusterUtils')


// const ApiError = require('./error/ApiError')

/**
 * Singleton
 * Класс по управлению и основным механизмам парсера.
 * Запуск, остановка, инициализация рабочей очереди парсинга.
 */
class ParserController {
  // Инстанс ParserController
  instance = null
  // Текущие активные правила
  activeRules = []
  // Свободные воркеры ids
  freeWorkers = []
  // Флаг работы
  isWork = false

  constructor() {
    // Singleton
    if (ParserController.instance instanceof ParserController) {
      return ParserController.instance
    }

    this.instance = this
    ParserController.instance = this
    return ParserController.instance
  }

  // Берёт id свободного воркера
  getWorker() {
    return new Promise(async (resolve) => {
      console.log('getWorker() свободных воркеров:', this.freeWorkers.length)
      let worker = false
      const searchWorkerTick = async () => {
        if (!worker) {
          worker = this.freeWorkers.shift() || false
        }
        if (!worker) {
          setImmediate(searchWorkerTick)
        } else {
          resolve(worker)
        }
      }
      await searchWorkerTick()
    })
  }

  /**
   * Инициализация очереди из активных правил на парсинг
   */
  async initialQueue() {

    try {
      // Если работает
      if (this.isWork) {
        // пока фиктивный вызов (не реализован)
        this.stop()
      }

  

      this.activeRules = await Rule.findAll({
        where: { activate_status: true },
      })

      console.log('Очереди проинициализированы...')
    } catch (error) {
      console.log(`Ошибка в initialQueue: ${error}`)
    }
  }

  /**
   * Запуск парсера (через запуск очереди)
   * @returns
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Запуск парсера...')
        this.loop()
        console.log('Парсер запущен!')
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
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
        if (this.activeRules.length) {
          // готовые правила
          let readyRules = []

          // Изымаем готовые из parser.activeRules, оставляем остальные
          this.activeRules = this.activeRules.filter((rule) => {
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
              workerId = await this.getWorker()
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
              console.log(`Ошибка в loop() :`, error)
            }
          } // -- Цикл по готовым правилм
        } // -- Условие: activeRules не пустая
        setImmediate(loopTick)
      } // -- Бесконечный цикл
    }
    await loopTick()
    console.log('loop() завершён...')
  } // -- loop()

  /**
   * Остановка парсера (через остановку очереди)
   * @returns
   */
  stop() {
    this.isWork = false
  }

  addActiveRule() {
    console.log(`${whoIs()} parser.addActiveRule()`)
  }

  excludeRule() {
    console.log(`${whoIs()} parser.addActiveRule()`)
  }
}

module.exports = { ParserController }
