const { ChangeNote, Rule } = require('../../../models/index')
const ApiError = require('../../error/ApiError')
const checkDynamicRule = require('./checkDynamicRule')
const checkStaticRule = require('./checkStaticRule')

/**
 * Проверка правила, проверяет только уже созданные в бд,
 * если правило не проходит проверку -- оно отключается
 * @param {*} rule
 * @returns
 */
const checkRule = async (rule) => {
  // Если правило не пустое
  if (rule) {
    // И не сбилжено (м.б лучше класс смотреть)
    if (!rule.dataValues) {
      // Сразу ребилдим правило
      rule = Rule.build(rule, { isNewRecord: false })
    }
  } else {
    return ApiError.badRequest('Правило не найдено')
  }

  let testResult = null

  try {
    // если страница статическая
    if (rule.page_type === 'static') {
      testResult = await checkStaticRule(rule)
    }
    // если страница динамическая
    else if (rule.page_type === 'dynamic') {
      testResult = await checkDynamicRule(rule)
    }
    // если страница неизвестного типа
    else {
      return ApiError.internal(`Неизвестный тип страницы: ${pageType}`)
    }

    // Даже если вернулась ApiError, передаём её дальше
    // обработать должны такой какая есть
    return rule
  } catch (error) {
    return ApiError.internal(`checkRule() неизвестная ошибка: ${error.message}`)
  }
}

module.exports = checkRule
