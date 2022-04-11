//https://github.com/cloudamqp/nodejs-amqp-example/blob/master/amqplib/app.js
const amqp = require('amqplib/callback_api')
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')

const cluster = require('cluster')

class AMQPController {
  instance = null

  connection = null
  pubChannel = null
  offlinePubQueue = []

  constructor() {
    // Singleton
    if (AMQPController.instance instanceof AMQPController) {
      return AMQPController.instance
    }

    // this.instance = this
    AMQPController.instance = this
    return AMQPController.instance
  }

  start() {
    amqp.connect('amqp://localhost', (err, conn) => {
      if (err) {
        console.error(`${whoIs()} [AMQP] err:`, err.message)
      }

      conn.on('error', (err) => {
        if (err.message !== 'Connection closing') {
          console.error(`${whoIs()} [AMQP] conn error`, err.message)
        }
      })

      conn.on('close', () => {
        console.error(`${whoIs()} [AMQP] on close -- close.`)
      })

      console.log(`${whoIs()} [AMQP] connected`)
      this.connection = conn
      this.whenConnected()
    })
  }

  whenConnected() {
    if (cluster.isMaster) {
      this.startPublisher()
    } else {
      this.startWorker()
    }
  }

  startPublisher() {
    this.connection.createConfirmChannel((err, ch) => {
      if (this.closeOnErr(err)) return

      ch.on('error', (err) => {
        console.error(`${whoIs()} [AMQP] channel error`, err.message)
      })

      ch.on('close', () => {
        console.log(`${whoIs()} [AMQP] channel close`)
      })

      this.pubChannel = ch

      while (true) {
        var m = this.offlinePubQueue.shift()
        if (!m) break
        this.publish(m[0], m[1], m[2])
      }
    })
  }

  publish(exchange, routingKey, content) {
    try {
      this.pubChannel.publish(
        exchange,
        routingKey,
        content,
        { persistent: true },
        (err, ok) => {
          if (err) {
            console.error(`${whoIs()} [AMQP] publish`, err)
            this.offlinePubQueue.push([exchange, routingKey, content])
            this.pubChannel.connection.close()
          }
        }
      )
    } catch (e) {
      console.error(`${whoIs()} [AMQP] publish`, e.message)
      this.offlinePubQueue.push([exchange, routingKey, content])
    }
  }
  // A worker that acks messages only if processed succesfully
  startWorker() {
    this.connection.createChannel((err, ch) => {
      if (this.closeOnErr(err)) return
      ch.on('error', (err) => {
        console.error(`${whoIs()} [AMQP] channel error`, err.message)
      })

      ch.on('close', () => {
        console.log(`${whoIs()} [AMQP] channel closed`)
      })

      ch.prefetch(10)

      const processMsg = (msg) => {
        this.work(msg, (ok) => {
          try {
            if (ok) ch.ack(msg)
            else ch.reject(msg, true)
          } catch (e) {
            this.closeOnErr(e)
          }
        })
      }

      ch.assertQueue('jobs', { durable: true }, (err, _ok) => {
        if (this.closeOnErr(err)) return
        ch.consume('jobs', processMsg, { noAck: false })
        console.log('Worker is started')
      })
    })
  }

  work(msg, cb) {
    console.log(`${whoIs()} Got msg `, msg.content.toString())
    cb(true)
  }

  closeOnErr(err) {
    if (!err) return false
    console.error(`${whoIs()} [AMQP] error`, err)
    this.connection.close()
    return true
  }
}

module.exports = AMQPController
