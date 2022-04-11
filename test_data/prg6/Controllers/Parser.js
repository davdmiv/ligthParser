const { sequelize, Rule } = require('../../../models/index')

class Parser {
  activeRules = null

  curTimeout = null

  async getData() {
    try {
      console.log(`========== light Parser getData ==========`)

      // ++ Соединяется с БД
      await sequelize.authenticate()
      await sequelize.sync()
      // -- Соединяется с БД

      this.activeRules = await Rule.findAll()
    } catch (e) {
      console.log('Ошибка в коде', e)
    } finally {
      try {
        await sequelize.close()
        console.log('Соединение закрыто')
      } catch (error) {
        console.error('Какие-то ошибки при закрытие бд:', error)
      }
    }
  }

  loop() {
    // let self = this
    // console.log('self', self)
    // const newTimeLoop = timeoutLoop.call(self)
    this.curTimeout = timeoutLoop.call(this)
  }
}

const sortFn = (a, b) => a.getNextCheckTime - b.getNextCheckTime

function timeoutLoop() {
  // Берём первый
  this.activeRules.sort(sortFn)
  // Получаем верхнее готовое правило
  let rule = this.activeRules.shift()
  // Ещё раз проверяем, не соврал ли таймер
  if (rule.needCheck) {
    // для иммитации мы просто меняем datetime
    // -----------------------------------------
    rule.set('last_check', new Date())
    console.log(
      `${
        rule.name
      } обработано ${rule.last_check.toISOString()} следующая обработка через: `,
      rule.getTimeout
    )
    // -----------------------------------------
    console.log('activeRules.length', this.activeRules.length)
    console.log('activeRules[0].last_check', this.activeRules[0].last_check)
    this.curTimeout = setTimeout(
      timeoutLoop.bind(this),
      this.activeRules[0].getTimeout
    )
  } else {
    // Если по какой-то причине -- не нужен
    // то переставляем таймаут, т.к всё равно надо будет проверять
    console.log(
      `Сработала защита! Правило ${rule.name} : `,
      rule.getTimeout,
      ' -- не готово к обработке!'
    )
    this.curTimeout = setTimeout(timeoutLoop.bind(this), rule.getTimeout)
    // -- Защита от идиота...
  }
  // this.activeRules.push(rule)
}

module.exports = {
  Parser,
}
