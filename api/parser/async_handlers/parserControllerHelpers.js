const cluster = require('cluster')
const { whoIs } = require('./asyncClusterUtils')

// Функция установки таймаута на следующий запуск
async function timeoutLoop() {
  // Если по какой-то причине таймаут сработал, а правил нет
  if (!this.hasActiveRules() || !this.isWork) {
    console.log(
      `${whoIs()} timeoutLoop(): this.hasActiveRules(): ${this.hasActiveRules()}, this.idWork: ${
        this.isWork
      } -- this.curTimeout cброшен`
    )
    this.curTimeout = null
    return
  }

  // Сортируем очередь и узнаём, готово ли первое правило
  if (this.isActiveRulesNextRedy()) {
    // Берём первое на ожидании правило
    let rule = this.activeRuleShift()
    // Обработка, отправка
    try {
      console.log(`${whoIs()} timeoutLoop(): поиск воркеров...`)
      let workerId = await this.getWorker()
      console.log(`${whoIs()} timeoutLoop(): воркер найден`, workerId)

      // Добавлям правило в массив "правил в обработке"
      this.addToInProcessingRules(rule.id)
      // Закинули правило на обработку Worker'у и забыли
      cluster.workers[workerId].send({
        target: 'checkRule',
        rule,
      })
    } catch (error) {
      console.log(`Ошибка в timeoutLoop() :`, error)
    }

    // Переходим к следующему правилу
    this.curTimeout = this.hasActiveRules()
      ? setTimeout(timeoutLoop.bind(this), this.activeRulesNextTimeout())
      : null
  }
  // Если не готово, то перестраиваем таймер
  else {
    this.curTimeout = setTimeout(
      timeoutLoop.bind(this),
      this.activeRulesNextTimeout()
    )
  }
}

module.exports = { timeoutLoop }
