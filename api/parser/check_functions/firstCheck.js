const { ChangeNote } = require('../../../models/index')
const ApiError = require('../../error/ApiError')
const firstCheckDynamic = require('./firstCheckDynamic')
const firstCheckStatic = require('./firstCheckStatic')
const RuleDTO = require('../dto/Rule.dto')

const firstCheck = async (testRuleData) => {
  // Достаём тип страницы (для удобства)
  const { pageType, ruleName, ruleUrl, shrubRule, userId } = testRuleData

  // переменная для понимая что-вернулось
  // let cangeNote = null
  let testResult = null

  try {
    // если страница статческая
    if (pageType === 'static') {
      testResult = await firstCheckStatic(testRuleData)

      // если страница динамическая
    } else if (pageType === 'dynamic') {
      testResult = await firstCheckDynamic(testRuleData)

      // если страница неизвестного типа
    } else {
      return ApiError.internal(`Неизвестный тип страницы: ${pageType}`)
    }

    // Определяем, что вернулось
    // Если вернулся инстанс ошибки - возвращем его
    if (testResult instanceof ApiError) {
      return testResult
    }

    // Если вернулась не ошибка, то сохраняем в бд
    const newChangeNote = await ChangeNote.create({ ...testResult.changeNote })

    let rule = new RuleDTO(
      ruleName,
      ruleUrl,
      shrubRule,
      newChangeNote.shrub_cache, // shrubCache
      pageType,
      userId
    )

    // Дополняем не объязательные поля,
    // которые можно заполнить исходя из первой проверки
    rule.duration = testResult.duration
    rule.page_changed = newChangeNote.check_datetime
    rule.last_check = newChangeNote.check_datetime

    // Возвращаем запись
    return { rule, changenote: newChangeNote }
  } catch (error) {
    return ApiError.internal(error)
  }
}

module.exports = firstCheck
