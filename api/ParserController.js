const { Rule } = require('../models/index')
const { DynamicQueue } = require('./parser/classes/DynamicQueue')
// const ApiError = require('./error/ApiError')
const { whoIs } = require('./parser/async_handlers/asyncClusterUtils')

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
  staticQueue = []
  dynamicQueue = []
  freeWorkers = []

  constructor() {
    if (ParserController.instance instanceof ParserController) {
      console.log(
        `${whoIs()}: ParserController.constructor: возвращён экземпляр объекта!`
      ) // (!) Отладка
      return ParserController.instance
    }

    console.log(
      `${whoIs()}: ParserController.constructor: Singleton ParserController создан!`
    ) // (!) Отладка
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
    this.instanceDynamicQueue = new DynamicQueue(self)

    // Если инстанс DynamicQueue и DynamicQueue работает
    // if (this.instanceDynamicQueue.isWork) {
    //   // пока фиктивный вызов (не реализован)
    //   this.instanceDynamicQueue.stop()
    // }

    try {
      this.activeRules = await Rule.findAll({
        where: { activate_status: true },
      })
      this.staticQueue = this.activeRules.filter(
        (e) => e.page_type === 'static'
      )
      this.dynamicQueue = this.activeRules.filter(
        (e) => e.page_type === 'dynamic'
      )
      console.log('Очереди проинициализированы...')
    } catch (error) {
      console.log(`Ошибка в initialQueue: ${error}`)
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Запуск парсера...')
        this.instanceDynamicQueue.loop()
        // await this.instanceDynamicQueue.loop()
        console.log('Парсер запущен!')
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  // stop() {
  //   console.log('Остановка парсера...')
  //   if (this.instanceDynamicQueue) {
  //     this.instanceDynamicQueue.stop()
  //   }
  //   console.log('Парсер остановлен')
  // }
}

module.exports = { ParserController }
