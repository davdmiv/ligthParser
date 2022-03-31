// Кластер
const cluster = require('cluster')

// Правило проверки динамических правил
const checkDynamicRule = require('../check_functions/checkDynamicRule')
const { whoIs } = require('./asyncClusterUtils')
const ApiError = require('../../error/ApiError')

// Модели
const { Rule } = require('../../../models/index')
/**
 * -------------------------------------------------
 * Обработка события 'message' на Worker'e
 * @param {*} msg
 */
const workerMessageHandler = async (msg) => {
  console.log(`${whoIs()}, WMH: получил сообщение '${msg.target}'`)

  // Просто всё разом запихнул в try catch
  try {
    if (msg.target === 'checkDynamicRule') {
      // Достаём правило из сообщения
      let { rule: objRule } = msg
      let rule = Rule.build(objRule, { isNewRecord: false })
      // Получаем обновлённое правило, только что протестированное
      let testedRule = await checkDynamicRule(rule)

      // Если получаем ошибку по правилу -- правило "выбывает из игры"
      // делаем его неаквтивным
      if (testedRule instanceof ApiError) {
        await rule.update({
          activate_status: false,
          description: `Обнаружена ошибка с правилом, правило деактивировано. \n${rule.description}`,
        })
        console.log(
          `${whoIs()}, получил ошибку из checkDynamicRule(), правило ${
            rule.name
          }`,
          testedRule
        )
      }
      // Отправили результат Master'у, и по итогу сразу в логи
      console.log(
        cluster.worker.send({ target: 'checkDynamicRule', testedRule })
          ? `${whoIs()} отправил ответ.`
          : `${whoIs()} не отправил ответ.`
      )
    } // msg.target === 'checkDynamicRule' end
  } catch (error) {
    console.error(`${whoIs()}, что-то пошло не так: `, error)
  }
}
// -------------------------------------------------

module.exports = {
  workerMessageHandler,
}
