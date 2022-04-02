const { Rule } = require('../../../models/index')
const ApiError = require('../../error/ApiError')
const { firstCheck, checkRule } = require('../../parser/check_functions/checkFunctions')
const cluster = require('cluster')

class AppController {
  /**
   * Первичный тест данных по правилу
   * Создаёт ChangeNote при удачном тесте
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns Возвращает {rule, changenote}
   */
  async testRule(req, res, next) {
    try {
      // Достаём из body все необходимые переменные
      const { pageType, ruleName, ruleUrl: url, shrubRule, userId } = req.body

      // Отправляем на тест. Тест сам разберётся как тестировать
      const testResults = await firstCheck({
        pageType,
        ruleName,
        ruleUrl: url,
        shrubRule,
        userId,
      })

      // Возвращаем результат
      return res.json(testResults)
    } catch (error) {
      // Для непредвиденных ситуаций
      return next(ApiError.internal(error))
    }
  }

  
  async checkRule(req, res, next) {
    try {
      // Достаём из body все необходимые переменные
      const { rule } = req.body

      // Отправляем на тест. Тест сам разберётся как тестировать
      const testResults = await checkRule(rule)

      // Возвращаем результат
      return res.json(testResults)
    } catch (error) {
      // Для непредвиденных ситуаций
      return next(ApiError.internal(error))
    }
  }

  /**
   * Отправляет msg на Master -- запустить парсер
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns true, если msg отправлен
   */
  async parserStart(req, res, next) {
    const idSend = cluster.worker.send({ target: 'parserStart' })
    return res.json({ parserStart: idSend })
  }

  /**
   * Отправляет msg на Master -- остановить парсер
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns true, если msg отправлен
   */
  async parserStop(req, res, next) {
    const idSend = cluster.worker.send({ target: 'parserStop' })
    return res.json({ parserStop: idSend })
  }

  /**
   * Активирует правило по Id правила
   * @param {*} req req.body.id -- в body должен быть id правила
   * @param {*} res
   * @param {*} next
   * @returns true, если msg отправлен | или ошибка
   */
  async activateRule(req, res, next) {
    try {
      const rule = await Rule.findByPk(req.body.id)
      if (!rule) {
        return next(
          ApiError.badRequest(`Правило id(${req.body.id}), не найдено`)
        )
      }
      const idSend = cluster.worker.send({ target: 'activateRule', rule })
      return res.json({ activateRule: idSend })
    } catch (error) {
      return next(
        ApiError.internal(
          `Произошла ошибка при активации правила ${error.message}`
        )
      )
    }
  }

  /**
   * Деактивирует правило по Id правила
   * (убирает из очереди активных правил парсера)
   * @param {*} req req.body.id -- в body должен быть id правила
   * @param {*} res
   * @param {*} next
   * @returns true, если msg отправлен | или ошибка
   */
  async deactivateRule(req, res, next) {
    try {
      const idSend = cluster.worker.send({
        target: 'deactivateRule',
        ruleId: req.body.id,
      })
      return res.json({ activateRule: idSend })
    } catch (error) {
      return next(
        ApiError.internal(
          `Произошла ошибка при деактивации правила ${error.message}`
        )
      )
    }
  }
}

module.exports = new AppController()
