const { Rule } = require('../../../models/index')
const { whoIs } = require('../async_handlers/asyncClusterUtils')
const { timeoutLoop } = require('../async_handlers/parserControllerHelpers')

/**
 * Singleton
 * Класс по управлению и основным механизмам парсера.
 * Запуск, остановка, инициализация рабочей очереди парсинга.
 */
class ParserController {
  // Инстанс ParserController
  static instance = null
  // Текущие активные правила
  activeRules = []
  // Свободные воркеры ids
  freeWorkers = []
  // Флаг работы
  isWork = false
  // Cсылка на Timeout следующей обработки
  curTimeout = null
  // Ids правил переданных воркерам на обработку
  inProcessingRules = []
  // время срабатываения следующего таймаута
  nextTick = null

  constructor() {
    // Singleton
    if (ParserController.instance instanceof ParserController) {
      return ParserController.instance
    }

    // this.instance = this
    ParserController.instance = this
    return ParserController.instance
  }

  // ++ Worker'ы -----------------------------------------------------------------------
  // private
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

  pushToFreeWorkers(workerId) {
    this.freeWorkers.push(workerId)
  }
  // -- Worker'ы -----------------------------------------------------------------------

  // ++ Parser -----------------------------------------------------------------------
  /**
   * private
   * Инициализация очереди из активных правил на парсинг
   */
  async initialQueue() {
    try {
      // пока фиктивный вызов (не реализован)
      this.stop()
      // Обнуляем очередь обрабатываемых
      // Скорее всего надо вешать эвент ожидания обработки(!)
      // м.б даже с отведённым на ожидание временем
      this.inProcessingRules = []

      this.activeRules = await Rule.findAll({
        where: { activate_status: true },
      })

      console.log('Очереди проинициализированы...')
      return true
    } catch (error) {
      console.log(`Ошибка в initialQueue: ${error}`)
      return false
    }
  }

  /**
   * Запуск парсера. Остановка - Инициализация - loop
   * @returns
   */
  async start() {
    this.stop()
    console.log('Запуск парсера...')
    if (await this.initialQueue()) {
      await this.loop()
      console.log('Парсер запущен!')
    } else {
      console.log('Запуск парсера прерван.')
    }
  }

  /**
   * private
   * Метод запуск цикла обработки правил
   * Вешаем таймаут на первое созревшее,
   * по готовности текущего timeoutLoop перевешивает на следующее.
   */
  async loop() {
    // Выставляем флаг работы (возможно и не надо, лучше глобально)
    this.isWork = true
    // Бесконечный цикл работы (пока включён)
    await timeoutLoop.call(this)
    console.log('loop...')
  }

  // async reLoop(){
  //   if (nextTick)
  // }
  /**
   * Остановка парсера (через остановку очереди)
   * @returns
   */
  stop() {
    this.isWork = false
    clearTimeout(this.curTimeout)
  }

  setNextTick(nextTick) {
    this.nextTick = nextTick
  }
  // -- Parser -----------------------------------------------------------------------

  // ++ Parser.inProcessingRules -----------------------------------------------------
  /**
   * Добавляет id rule в массив "правил в обработке"
   * @param {*} ruleId
   */
  addToInProcessingRules(ruleId) {
    // Без проверок, наверно нужно добавить и возращать boolean (!)
    this.inProcessingRules.push(ruleId)
  }

  /**
   * Удаляет правило из массива "правил в обработке"
   * @param {*} ruleId
   * @returns true в случае успеха
   */
  delFromInProcessingRules(ruleId) {
    const lengthBefore = this.inProcessingRules.length
    this.inProcessingRules = this.inProcessingRules.filter(
      (id) => id !== ruleId
    )
    return lengthBefore - this.inProcessingRules.length === 1 ? true : false
  }

  // /**
  //  * Проверяет есть ли правило в массиве "правил в обработке"
  //  * @param {*} ruleId
  //  * @returns
  //  */
  // isRuleInProcessingRules(ruleId) {
  //   return this.inProcessingRules.find((id) => id === ruleId)
  // }
  // -- Parser.inProcessingRules -----------------------------------------------------

  // ++ Parser.activeRules -----------------------------------------------------------
  /**
   * Удаляет из массива "активных правил"
   * @param {*} ruleId
   * @returns true в случае успеха
   */
  delFromActiveRules(ruleId) {
    const lengthBefore = this.activeRules.length
    this.activeRules = this.activeRules.filter(
      (activeRule) => activeRule.id !== ruleId
    )
    return lengthBefore - this.activeRules.length === 1 ? true : false
  }

  /**
   * Соритирует правила в очереди по оставшимуся ожиданию.
   * В начале будут самые ранние.
   */
  sortActiveRules() {
    this.activeRules.sort((a, b) => a.getTimeout - b.getTimeout)
  }

  /**
   * Возвращает timeout первого правила в массиве "активных правил"
   * @returns number
   */
  activeRulesNextTimeout() {
    return this.activeRules[0].getTimeout
  }

  isActiveRulesNextRedy() {
    this.sortActiveRules()
    return this.activeRules[0].needCheck
  }

  /**
   * Есть ли правила в "активных правилах"
   * @returns
   */
  hasActiveRules() {
    return this.activeRules.length ? true : false
  }
  /**
   * private (?)
   * Достаёт первое правило из массива "активных правил"
   * Используется в timeoutLoop()
   * @returns
   */
  activeRuleShift() {
    return this.activeRules.shift()
  }

  activeRulesEasyPush(rule) {
    return this.activeRules.push(rule)
  }
  // -- Parser.activeRules -----------------------------------------------------------

  /**
   * Возвращает обратно правило в очередь обработки
   * @param {*} rule
   */
  async addCheckedRule(rule) {
    // Если удалось удалить из массива "правил в обработке"
    if (this.delFromInProcessingRules(rule.id)) {
      // Добавляем в очередь активных
      await this.addRuleToQueue(rule)
    }
  }

  /**
   * private
   * Добавление любых правил происходит
   * только если парсер запущен isWork == true
   * @param {*} rule
   */
  async addRuleToQueue(rule) {
    if (this.isWork) {
      this.stop()
      this.activeRules.push(rule)
      await this.loop()
    }
  }

  /**
   * Добавляет правило в очередь обработки
   * парсер должен быть запущен isWork == true
   * @param {*} rule
   */
  async addActiveRule(rule) {
    await this.addRuleToQueue(rule)
    console.log(`${whoIs()} parser.addActiveRule()`)
  }

  /**
   * Исключает правило из очереди обрабатываемых
   * @param {*} rule
   * @returns
   */
  async excludeRule(ruleId) {
    // Останавливаем очередь
    this.stop()

    // Если правило было найдено и удалено хотя бы в одном из массивов
    if (
      this.delFromActiveRules(ruleId) ||
      this.delFromInProcessingRules(ruleId)
    ) {
      // Включаем обратно очередь
      await this.loop()
      // Сообщаем об успешном завершении исключения правила
      return true
    }
    // Иначе, ну что-то пошло не так...
    else {
      console.log(
        `${whoIs()} excludeRule() не удалось исключить правило ${ruleId}`
      ) // Логируем...
      // Включаем обратно очередь
      await this.loop()
      // Сообщаем о том, что не удалось исключить правило
      return false
    }
  }
}

module.exports = { ParserController }
