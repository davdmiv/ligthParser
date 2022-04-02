// Кластер
const cluster = require('cluster')

// Правило проверки динамических правил
// const checkDynamicRule = require('../check_functions/checkDynamicRule')
// const checkStaticRule = require('../check_functions/checkStaticRule')
const checkRule = require('../check_functions/checkRule')

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

  // Подготавливаем объект ответа
  let response = {
    target: msg.target,
    origRule: msg.rule ? msg.rule : '',
    error: null,
  }

  // Если в объекте сообщения есть правило
  if (msg.rule) {
    // Сразу ребилдим правило
    msg.rule = Rule.build(msg.rule, { isNewRecord: false })
  }

  // Просто всё разом запихнул в try catch
  try {
    // Обработка динамических правил
    if (msg.target === 'checkDynamicRule' || msg.target === 'checkStaticRule') {
      // Достаём правило из сообщения
      let { rule } = msg

      let testedRule = await checkRule(rule)

      // Если получаем ошибку по правилу -- правило "выбывает из игры"
      // Если пришла обработанная ошибка
      if (testedRule instanceof ApiError) {
        // Записываем в ответ ошибку
        response.error = testedRule

        // Обновляем инфу о правиле
        await rule.update({
          activate_status: false,
          description: `Обнаружена ошибка с правилом, правило деактивировано. \n Ошибка: \n ${testedRule.message}\n${rule.description}`,
        })

        // Выводим лог в консоль (!) Отладка
        console.log(
          `${whoIs()}, получил ошибку из ${msg.target}(), правило ${rule.name}`,
          testedRule
        )
      }

      // Формируем ответ
      response.testedRule = testedRule
    }
  } catch (error) {
    // Обрабатываем глобальные ошибки
    // Выводим глобальный stderr
    console.error(`${whoIs()}, что-то пошло не так: `, error)

    try {
      // Пытаемся деактивировать правило, иначе оно попадёт в очередь ещё раз
      await msg.rule.update({
        activate_status: false,
        description: `Обнаружена ошибка с правилом, правило деактивировано. \n Ошибка: \n ${error.message}\n${rule.description}`,
      })
    } catch (errorDb) {
      // Ничего не поделаешь... гиперлог на 2 ошибки
      console.error(
        `${whoIs()}Ошибка: `,
        errorDb,
        `\nпри попытке отключить правило ${msg.rule.name} после ошибки...`
      )
    }

    // Инициализируем ошибку, чтобы Master не клал правило в активные в текущей очереди
    response.error = ApiError.internal(
      `Ошибка обработки ответа : ${error.message}`
    )
  } finally {
    // Отправка заранее подготовленного объекта сообщения
    console.log(
      cluster.worker.send(response)
        ? `${whoIs()} отправил ответ.`
        : `${whoIs()} не отправил ответ.`
    )
  }
}
// -------------------------------------------------

module.exports = {
  workerMessageHandler,
}
