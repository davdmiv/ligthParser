const cluster = require('cluster')
const { whoIs } = require('./asyncClusterUtils')

/**
 * Что должен делать next loop?
 * Должен:
 * 1) Закидывать самое актуальное правило на обработку
 * 2) Определять таймаут для следующего самого актуального правила
 * Из 2 следует, что когда мы попали в next loop, мы объязаны запустить nextRule правило
 *
 * nextLoop не следит за правильностью текущей очереди, но планирует на будущее.
 * -- Он запускат nextRule, который не хранится в activeRules
 * (можно проверить его на needCheck прежде... хотя хз, что с ним делать если не готово)
 * А затем извлекает из activeRules следующего кандидата
 * - запихивает его в nextRule
 * - ставит next loop на таймаут nextRule.getTimeout
 * @returns
 */
async function nextLoop() {
  // Если не работаем, то сброс таймаута и выход
  if (!this.isWork) {
    this.clearTickData()
    return
  }
  // Иначе
  if (this.nextRule) {
    console.log('nextLoop(): this.nextRule', this.nextRule) // (!) Отладка <= тут оно всегда проинициализированно
    // Добавлям правило в массив "правил в обработке"
    this.addToInProcessingRules(this.nextRule.id)
    // Поиск воркеров
    let workerId = await this.getWorker() // (!) Отладка <= А всё потому, что тут разрывается атамарность функции и затирается
    // (!) Отладка | и пока он там ждёт воркера, что-то другое пролетает над стеком и затирает this.nextRule
    // (!) Отладка | нужно как-то получать воркеров не теряя контекст, или не позволять чему бы то ни было трогать правило,
    // (!) Отладка | пока воркер не найден
    console.log('MASTER перед отправкой msg', {
      target: 'checkRule',
      rule: this.nextRule, // (!) Отладка <= А тут оно, может быть пустым! всегда проинициализированно
    }) // Отладка (!)
    // Закинули правило на обработку
    cluster.workers[workerId].send({
      target: 'checkRule',
      rule: this.nextRule,
    })
    // this.printState('nextLoop(): Перед вызовом setNextRule.call(this): ')
    // Просто сократил кусок кода
    setNextRule.call(this)
  }
  // Если правило не определено, то нам не с чем работать
  else {
    this.clearTickData()
  }
}

/**
 * Устанавливает следующее правило
 * и таймаут на его обработку
 */
function setNextRule() {
  // Берём следующее минимальное по
  this.nextRule = this.getNextActiveRule()

  // Если Ок, -- вернулось правило
  if (this.nextRule) {
    console.log('setNextRule(): if (this.nextRule) { :', this.nextRule)
    // Выставляем следующее время срабатывания
    this.nextTick = this.nextRule.getNextCheckTime
    // Выставляем слудующий таймаут
    this.curTimeout = setTimeout(nextLoop.bind(this), this.nextTick.getTimeout)
  }
  // Если правило не определено, то нам не с чем работать
  else {
    this.clearTickData()
  }
}

module.exports = { nextLoop, setNextRule }
