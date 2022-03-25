require('dotenv').config()

const { sequelize, Rule } = require('../models/index')
const RuleDTO = require('../api/parser/dto/Rule.dto')
const testRuleObj = {
  ruleName: 'погода на яндексе',
  ruleUrl: 'https://yandex.ru/',
  shrubRule: 'div[class="weather__temp"]',
  pageType: 'dynamic',
  userId: 1,
}

;(async () => {
  try {
    const { ruleName, ruleUrl, shrubRule, pageType, userId } = testRuleObj

    console.log(`========== light Parser start ==========`)

    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    console.log(`lightParser: authenticated.`)

    let rule = new RuleDTO(
      ruleName,
      ruleUrl,
      shrubRule,
      'shrubCache',
      pageType,
      userId
    )

    console.log('lightParser: rule by DTO: ', rule)

    // Из RuleDTO отлично создаётся, только надо не забыть user_id
    let res = await Rule.create(rule)

    console.log('lightParser: res: ', res)
  } catch (e) {
    console.log(e)
  } finally {
    try {
      await sequelize.close()
    } catch (error) {
      console.error('Какие-то ошибки при закрытие бд:', error)
    }
  }
})()
