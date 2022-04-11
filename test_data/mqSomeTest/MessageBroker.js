const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')

const amqp = require('amqplib')

let instance

class MessageBroker {
  /**
   * Initialize connection to rabbitMQ
   */
  async init() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost'
    )
    this.channel = await this.connection.createChannel()
  }

  /**
   * Send message to queue
   * @param {String} queue Queue name
   * @param {Object} msg Message as Buffer
   */
  async send(queue, msg) {
    if (!this.connection) {
      await this.init()
    }
    await this.channel.assertQueue(queue, { durable: true })
    this.channel.sendToQueue(queue, msg)
  }
}

MessageBroker.getInstance = async function () {
  if (!instance) {
    const broker = new MessageBroker()
    instance = broker.init()
  }
  return instance
}

module.exports = MessageBroker
