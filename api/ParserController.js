const { Rule, ChangeNote } = require('../models/index')
const dynamicQueue = require('./parser/classes/DynamicQueue')
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
  staticQueue = []
  dynamicQueue = []

  constructor() {
    if (ParserController.instance instanceof ParserController) {
      console.log(
        'ParserController.constructor: возвращён экземпляр объекта!',
        ParserController.instance
      ) // (!) Отладка
      return ParserController.instance
    }

    console.log(
      'ParserController.constructor: Singleton ParserController создан!'
    ) // (!) Отладка
    ParserController.instance = this
    return ParserController.instance
  }

  /**
   * Инициализация очереди из активных правил на парсинг
   */
  async initialQueue() {
    if (dynamicQueue.isWork) {
      dynamicQueue.stop()
    }
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

  async start() {
    console.log('Запуск парсера...')
    await this.initialQueue()

    await dynamicQueue.loop()
    console.log('Парсер запущен')
  }

  stop() {
    console.log('Остановка парсера...')
    dynamicQueue.stop()
    console.log('Парсер остановлен')
  }
  // ruleDelete(){
  //   return false
  // }

  // ruleImmediatelyTest(){
  //  return false
  // }
}

module.exports = new ParserController()
