const amqp = require('amqplib')

/**
 * Broker for async messaging
 */
class MessageBroker {
  // Ссылка на экземпляер
  instance = null
  // Соединение
  connection = null

  constructor() {
    // Singleton
    if (MessageBroker.instance instanceof MessageBroker) {
      return MessageBroker.instance
    }
    // пока хз зачем
    this.queues = {}
    // this.instance = this
    MessageBroker.instance = this
    return MessageBroker.instance
  }

  /**
   * Вызывает connect, получаем соедениенени
   */
  async init() {
    // Создаём соединение
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost'
    )
    // Создаём канал
    this.channel = await this.connection.createChannel()
    return this
  }

  /**
   * Посылает сообщение в очередь
   * @param {String} queue Название очереди
   * @param {Object} msg Сообщение, типа Buffer
   */
  async send(queue, msg) {
    // Если нет соединения, то инициируем его
    if (!this.connection) {
      await this.init()
    }
    // (!)
    await this.channel.assertQueue(queue, { durable: true })
    this.channel.sendToQueue(queue, msg)
  }

  /**
   * Подписаться на очередь
   * @param {String} queue Название очереди
   * @param {Function} handler Обработчик, который будет вызываться
   * с заданным сообщением и функцией подтверждения (msg, ack)
   */
  async subscribe(queue, handler) {
    // Если нет соединения, то инициируем его
    if (!this.connection) {
      await this.init()
    }
    // Если эта очередь уже есть "в подписках"
    if (this.queues[queue]) {
      
      // const existingHandler = _.find(this.queues[queue], (h) => h === handler)
      // Ищет обработчик?
      const existingHandler = _.find(this.queues[queue], (h) => h === handler)
      // Если нашла обработчки
      if (existingHandler) {
        // Возвращает функцию вызывающую функцию отписки от переданной очереди 
        // с найденным обработчиком existingHandler эквивалентным handler
        return () => this.unsubscribe(queue, existingHandler)
      }
      // Если не нашла обработчик, то кладём его в объект this.queues, по свойству "queue", как в массив
      this.queues[queue].push(handler)
      // Возвращаем функцию вызывающую функцию отписки от переданной очереди queue
      // с переданым обработчиком handler
      return () => this.unsubscribe(queue, handler)
    }

    // Если очереди нет this.queues
    // Подтверждение существования очереди,  durable: true -- переживёт перезапуск брокера
    await this.channel.assertQueue(queue, { durable: true })
    // Кладём handler в объект this.queues, по свойству "queue", как массив с единственным элементом handler
    this.queues[queue] = [handler]
    this.channel.consume(queue, async (msg) => {
      const ack = _.once(() => this.channel.ack(msg))
      this.queues[queue].forEach((h) => h(msg, ack))
    })
    return () => this.unsubscribe(queue, handler)
  }

  async unsubscribe(queue, handler) {
    _.pull(this.queues[queue], handler)
  }
}

/**
 * @return {Promise<MessageBroker>}
 */
MessageBroker.getInstance = async function () {
  if (!instance) {
    const broker = new MessageBroker()
    instance = broker.init()
  }
  return instance
}

module.exports = MessageBroker
