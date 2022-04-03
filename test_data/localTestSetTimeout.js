// let activeRules = []

// const initQueue = () => {
//   for(let i = 0; i< 10; i ++){
//     activeRules.push({
//       ruleName: `rule${i+1}`,
//       //
//       nextCheck: new Date(Date.now() + 60000)
//     })
//   }
// }
const { sequelize, Rule } = require('../models/index')

const sortFn = (a, b) => a.getTimeout - b.getTimeout

function timeoutLoop() {
  // console.log('timeoutLoop this', this)
  // Берём первый
  this.activeRules.sort(sortFn)
  // Получаем верхнее готовое правило
  let rule = this.activeRules.shift()
  // Ещё раз проверяем, не соврал ли таймер
  if (rule.needCheck) {
    // для иммитации мы просто меняем datetime
    rule.set('last_check', new Date())
    console.log(
      `${
        rule.name
      } обработано ${rule.last_check.toISOString()} следующая обработка через: `,
      rule.getTimeout
    )
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
  this.activeRules.push(rule)
}

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
      // let rules = await Rule.findAll()
      // this.activeRules = rules.map((rule) => rule.dataValues)
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

;(async () => {
  try {
    const parser = new Parser()
    await parser.getData()

    // Выстраивает по очерёдности
    console.log('time now:', new Date().toISOString())
    // console.log('parser', parser)
    parser.loop()

    console.log('main завершился...')
    // Теперь надо как-то брать из очереди arr.shift()
    // и ставить на таймаут, а затем:
    // -- опять сортировать, брать верх и ставить на таймаут?
    // -- или брать следующий, получать таймаут и ставить тупо на него?
    // (!) но! когда элемент возвращается, пересортировывать очередь, т.к порядок может нарушиться
    // или! вставлять элемент в нужное место, -- ?
    // т.е вставлять и сортировать сразу

    // activeRules.forEach((rule) => {
    //   console.log(`${rule.name} : ${rule.last_check}`)
    //   console.log(`${rule.name} : ${rule.getNextCheckTime()}`)
    //   console.log(`${rule.name} : ${rule.getTimeout()}`)
    // })
    //.getTime()
    // activeRules.sort((a,b) => a.)
    // console.log('activeRules:', activeRules)
  } catch (e) {
    console.log('Ошибка в main', e)
  }
})()
