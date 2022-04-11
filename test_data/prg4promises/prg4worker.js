//https://github.com/cloudamqp/nodejs-amqp-example/blob/master/amqplib/app.js
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')
const amqp = require('amqplib/callback_api')



class AMQPController {
  instance = null 
  amqpConn = null

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
    amqp.connect('amqp://localhost', function (err, conn) {
      if (err) {
        console.error(`${whoIs()} [AMQP] start err:`, err.message)
      }
  
      // connect.on('error') start ==========================================
      conn.on('error', function (err) {
        if (err.message !== 'Connection closing') {
          console.error(`${whoIs()} [AMQP] conn on error:`, err.message)
        }
      })
      // connect.on('error') end --------------------------------------------
  
      // connect.on('close') start ==========================================
      conn.on('close', function () {
        console.error(`${whoIs()} [AMQP] on close -- close`)
      })
      // connect.on('close') end --------------------------------------------
  
      console.log(`${whoIs()} [AMQP] connected`)
      amqpConn = conn
      this.startWorker()
    })
  }


  startWorker() {
    // connect.createChannel ================================================
    amqpConn.createChannel(function (err, ch) {
      if (closeOnErr(err)) return
  
      // channel.on('error') start ==========================================
      ch.on('error', function (err) {
        console.error(`${whoIs()} [AMQP] channel error`, err.message)
      })
      // channel.on('error') end --------------------------------------------
  
      // channel.on('close') start ==========================================
      ch.on('close', function () {
        console.log(`${whoIs()} [AMQP] channel closed`)
      })
      // channel.on('close') end --------------------------------------------
  
      // channel.prefetch ===================================================
      ch.prefetch(10)
  
      // channel.assertQueue start ==========================================
      ch.assertQueue('jobs', { durable: true }, function (err, _ok) {
        if (closeOnErr(err)) return
        ch.consume('jobs', processMsg, { noAck: false })
        console.log(`${whoIs()} Queue Worker is started`)
      })
      // channel.assertQueue end --------------------------------------------
  
      function processMsg(msg) {
        this.work(msg, function (ok) {
          try {
            // channel.ack ==================================================
            if (ok) ch.ack(msg)
            // channel.reject ===============================================
            else ch.reject(msg, true)
          } catch (e) {
            closeOnErr(e)
          }
        })
      }
    })
  }

  work(msg, cb) {
    let rule = JSON.parse(msg.content.toString())
    console.log(`${whoIs()} Got msg `, rule)
    cb(true)
  }

  closeOnErr(err) {
    if (!err) return false
    console.error(`${whoIs()} [AMQP] error`, err)
    // connect.close ==========================================
    amqpConn.close()
    return true
  }

}






