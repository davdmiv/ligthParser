const { Rule } = require('../../../models/index')
// const { whoIs } = require('../async_handlers/asyncClusterUtils')
const { setNextRule } = require('./prg5ParserControllerHelpers')

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
  // следующее правило
  nextRule = null

  constructor() {
    // Singleton
    if (ParserController.instance instanceof ParserController) {
      return ParserController.instance
    }

    // this.instance = this
    ParserController.instance = this
    return ParserController.instance
  }

  // printState(str) {
  //   console.log(
  //     `${str}\nactiveRules:`,
  //     this.activeRules.length,
  //     '\nnextRule:',
  //     this.nextRule
  //   )
  // }

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
      this.isWork = true
      this.loop()
      console.log('Парсер запущен!')
    } else {
      console.log('Запуск парсера прерван.')
    }
  }

  /**
   * private
   * Метод запуск цикла обработки правил
   * Вешаем таймаут на первое созревшее,
   * по его прошествии перевешиваем на следующее.
   */
  loop() {
    // Выставляем флаг работы (возможно и не надо, лучше глобально)
    if (this.isWork) {
      this.clearTickData()
      // Устанавливает следующее правило, и таймаут на его обработку
      setNextRule.call(this)
      console.log('loop...')
    } else {
      console.log('loop(): парсер отключен.')
    }
  }

  /**
   * Обнуляет таймаут и данные о следующем вызове, в т.ч и правило
   */
  clearTickData() {
    clearTimeout(this.curTimeout)
    this.curTimeout = null
    this.nextRule = null
    this.nextTick = null
  }

  /**
   * Остановка парсера. (Скорее мягкая пауза)
   * Выставляем флаг работы в false.
   * Возвращаем next rule в активные.
   * Обнуляем таймаут и данные о следующем правиле
   * @returns
   */
  stop() {
    this.isWork = false
    // Если есть текущее правило, закидываем в активные
    if (this.nextRule) {
      this.activeRulesEasyPush(this.nextRule)
    }
    // Обнуляем данные о следующем вызове
    this.clearTickData()
  }

  /**
   * Сохраняет время следующей проверки текущего правила
   * @param {*} nextTick
   */
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

  /**
   * Проверяет есть ли правило в массиве "правил в обработке"
   * @param {*} ruleId
   * @returns
   */
  isRuleInProcessing(ruleId) {
    return this.inProcessingRules.find((id) => id === ruleId) ? true : false
  }
  // -- Parser.inProcessingRules -----------------------------------------------------

  // ++ Parser.activeRules -----------------------------------------------------------
  /**
   * Проверяет есть ли правило в массиве "активных правил"
   * @param {*} ruleId
   * @returns
   */
  isRuleInActiveRules(ruleId) {
    return this.activeRules.find((rule) => rule.id === ruleId) ? true : false
  }

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

  // --- тонкая настройка очереди правил
  /**
   * Находит правило с минимальным временем следующей проверки.
   * Кандидат на следующую обработку
   * @returns правило
   */
  findNextActiveRule() {
    return this.activeRules.reduce(
      (pre, cur) => (cur.getNextCheckTime < pre.getNextCheckTime ? cur : pre),
      this.activeRules[0]
    )
  }

  /**
   * Извлекает из очереди с минимальным timeout
   * Кандидат на следующую обработку
   * @returns
   */
  getNextActiveRule() {
    const findedRule = this.findNextActiveRule()
    if (findedRule) {
      this.activeRules = this.activeRules.filter(
        (rule) => rule.id !== findedRule.id
      )
    }
    return findedRule
  }

  /**
   * Нужно ли сменить таймаут?
   * Если время текущего на очереди правила больше проверяемого
   * то возвращает true
   * @param {*} rule
   * @returns
   */
  isNeedReLoop(rule) {
    if (this.isWork) {
      return this.nextTick > rule.getNextCheckTime
    }
    // Если парсер выключен, то не перезапускать
    // Это обеспечит возврат текущих обрабатываемых в активные.
    return false
  }
  // --- тонкая настройка очереди правил

  /**
   * Есть ли правила в "активных правилах"
   * @returns
   */
  get hasActiveRules() {
    return this.activeRules.length ? true : false
  }

  /**
   * Просто добавляет правило в массив активных правил
   * @param {*} rule
   * @returns
   */
  activeRulesEasyPush(rule) {
    return this.activeRules.push(rule)
  }
  // -- Parser.activeRules -----------------------------------------------------------

  /**
   * Возвращает обратно правило в очередь обработки
   * @param {*} rule
   */
  addCheckedRule(rule) {
    // Удаляем из массива "правил в обработке"
    // Если правила там нет, его скорее всего исключили из очереди
    // Отсюда и добавляем только те, что были в обработке
    if (this.delFromInProcessingRules(rule.id)) {
      // Нужно ли перезаписать таймаут? (таймаут правила меньше текущего?)
      if (!this.isNeedReLoop(rule)) {
        // Если не нужено, то просто закидываем правило в активные
        this.activeRulesEasyPush(rule)
      } else {
        // Если нужно, то закидываем текущее правило в активные
        this.activeRulesEasyPush(this.nextRule)
        // Закидываем туде же и пришедшее правило
        this.activeRulesEasyPush(rule)
        // Перезапускаем цикл (перезаписываем таймаут)
        this.loop()
      }
    } 
  }

  /**
   * Добавляет правило в очередь обработки
   * @param {*} rule
   */
  addActiveRule(rule) {
    // Правило новое? (нет ли где в обработке?)
    if (this.isNewActiveRule(rule)) {
      // Нужно ли перезаписать таймаут? (таймаут правила меньше текущего?)
      if (!this.isNeedReLoop(rule)) {
        // Если не нужено, то просто закидываем правило в активные
        this.activeRulesEasyPush(rule)
      } else {
        // Если нужно, то закидываем текущее правило в активные
        this.activeRulesEasyPush(this.nextRule)
        // Закидываем туде же и пришедшее правило
        this.activeRulesEasyPush(rule)
        // Перезапускаем цикл (перезаписываем таймаут)
        this.loop()
      }
      return true
    }
    // вот если не новое то, наверно надо заменить
    else if (this.excludeRule(rule.id)) {
      // Если удалось удалить, то повторяем наши действия
      this.addActiveRule(rule) // Да, лень, съэкономил на строчках
      return true
    }
    // так и не удалось удалить
    return false
  }

  /**
   * Проверяет есть ли id правила
   * в массивах активных или в обработке,
   * а также смотрит на текущее
   * @param {*} rule
   * @returns true если нигде не нашёл
   */
  isNewActiveRule(rule) {
    // Если не "в активных правилах", не "в обработке" и "не текущее правило", то true
    return !(
      this.isRuleInActiveRules(rule.id) ||
      this.isRuleInProcessing(rule.id) ||
      this.isRuleIsNextRule(rule.id)
    )
  }

  isRuleIsNextRule(ruleId) {
    return this.nextRule && this.nextRule.id === ruleId
  }

  /**
   * Исключает правило из очереди обрабатываемых
   * @param {*} rule
   * @returns
   */
  excludeRule(ruleId) {
    // Если правило -- текущее правило
    if (this.isRuleIsNextRule(ruleId)) {
      // Нужно перестроение очереди
      // т.к. текущее не в очереди, то его перезатрёт
      this.loop()
      return true
    }
    // Если не текущее, но в активных
    else if (this.isRuleInActiveRules(ruleId)) {
      // Удаляем, он не на что не повлияет
      return this.delFromActiveRules(ruleId)
    }
    // Если и не в обработке, то не удалось
    else {
      return this.delFromInProcessingRules(ruleId)
    }
  }
}

module.exports = { ParserController }
