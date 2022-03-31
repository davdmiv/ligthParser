const { Rule } = require('../models/index')
const { ParseQueue } = require('./parser/classes/ParseQueue')
// const ApiError = require('./error/ApiError')
// const { whoIs } = require('./parser/async_handlers/asyncClusterUtils')

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
  // Контроллер очереди, ссылка на Singleton инстанс
  parseQueue = null
  // Свободные воркеры ids
  freeWorkers = []

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
    // console.log('ParserController.initialQueue(): this', this)
    let self = this

    try {
      // new ParseQueue() может кидать ошибки
      this.parseQueue = new ParseQueue(self)

      // Если инстанс ParseQueue и ParseQueue работает
      // if (this.instanceParseQueue.isWork) {
      //   // пока фиктивный вызов (не реализован)
      //   this.instanceParseQueue.stop()
      // }

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
        this.parseQueue.loop()
        // await this.instanceParseQueue.loop()
        console.log('Парсер запущен!')
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Остановка парсера (через остановку очереди)
   * @returns
   */
  stop() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Остановка парсера...')
        this.parseQueue.stop()
        console.log('Парсер остановлен')
        resolve(true)
      } catch (error) {
        reject(err)
      }
    })
  }
}

module.exports = { ParserController }
