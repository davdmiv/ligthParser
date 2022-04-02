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
const { data } = require('cheerio/lib/api/attributes')
const { sequelize, Rule } = require('../models/index')

const sortFn = (a, b) => a.getTimeout() - b.getTimeout()

// class Parser {

//   activeRules = null

//   curTimeout = null

//   getData () {
//     return new Promise(async (resolve, reject) => {
//       try {
//         console.log(`========== light Parser start ==========`)

//         // ++ Соединяется с БД
//         await sequelize.authenticate()
//         await sequelize.sync()
//         // -- Соединяется с БД

//         let rules = await Rule.findAll()

//         // let activeRules = rules.map((rule) => rule.dataValues)

//         // resolve(activeRules)
//         resolve(rules)
//       } catch (e) {
//         console.log('Ошибка в коде', e)
//         reject(e)
//       } finally {
//         try {
//           await sequelize.close()
//           console.log('Соединение закрыто')
//         } catch (error) {
//           console.error('Какие-то ошибки при закрытие бд:', error)
//         }
//       }
//     })
//   }

// }

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

const getData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`========== light Parser start ==========`)

      // ++ Соединяется с БД
      await sequelize.authenticate()
      await sequelize.sync()
      // -- Соединяется с БД

      let rules = await Rule.findAll()

      // let activeRules = rules.map((rule) => rule.dataValues)

      // resolve(activeRules)
      resolve(rules)
    } catch (e) {
      console.log('Ошибка в коде', e)
      reject(e)
    } finally {
      try {
        await sequelize.close()
        console.log('Соединение закрыто')
      } catch (error) {
        console.error('Какие-то ошибки при закрытие бд:', error)
      }
    }
  })
}

let activeRules = null
let curTimeout = null

;(async () => {
  try {
    activeRules = await getData()

    // Выстраивает по очерёдности
    console.log('time now:', new Date().toISOString())
    const timeoutLoop = () => {
      // Берём первый
      activeRules.sort(sortFn)
      // Получаем верхнее готовое правило
      let rule = activeRules.shift()
      // Ещё раз проверяем, не соврал ли таймер
      if (rule.needCheck()) {
        // для иммитации мы просто меняем datetime
        rule.set('last_check', new Date())
        console.log(
          `${
            rule.name
          } обработано ${rule.last_check.toISOString()} следующая обработка через: `,
          rule.getTimeout()
        )
        console.log('activeRules.length', activeRules.length)
        console.log('activeRules[0].last_check', activeRules[0].last_check)
        curTimeout = setTimeout(timeoutLoop, activeRules[0].getTimeout())
      } else {
        // Если по какой-то причине -- не нужен
        // то переставляем таймаут, т.к всё равно надо будет проверять
        console.log(
          `Сработала защита! Правило ${rule.name} : `,
          rule.getTimeout(),
          ' -- не готово к обработке!'
        )
        curTimeout = setTimeout(timeoutLoop, rule.getTimeout())
        // -- Защита от идиота...
      }
      activeRules.push(rule)
    }
    curTimeout = timeoutLoop()

    await sleep(30000)
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
