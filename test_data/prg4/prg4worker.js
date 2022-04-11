//https://github.com/cloudamqp/nodejs-amqp-example/blob/master/amqplib/app.js
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')
const amqp = require('amqplib/callback_api')

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null

function start() {
  amqp.connect('amqp://localhost', function (err, conn) {
    if (err) {
      console.error(`${whoIs()} [AMQP]`, err.message)
      return setTimeout(start, 1000)
    }

    // connect.on('error') start ==========================================
    conn.on('error', function (err) {
      if (err.message !== 'Connection closing') {
        console.error(`${whoIs()} [AMQP] conn error`, err.message)
      }
    })
    // connect.on('error') end --------------------------------------------

    // connect.on('close') start ==========================================
    conn.on('close', function () {
      console.error(`${whoIs()} [AMQP] reconnecting`)
      return setTimeout(start, 1000)
    })
    // connect.on('close') end --------------------------------------------

    console.log(`${whoIs()} [AMQP] connected`)
    amqpConn = conn
    startWorker()
  })
}

// A worker that acks messages only if processed succesfully
function startWorker() {
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
      work(msg, function (ok) {
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

function work(msg, cb) {
  let rule = JSON.parse(msg.content.toString())
  console.log(`${whoIs()} Got msg `, rule)
  cb(true)
}

function closeOnErr(err) {
  if (!err) return false
  console.error(`${whoIs()} [AMQP] error`, err)
  // connect.close ==========================================
  amqpConn.close()
  return true
}

process.once('SIGINT', function () {
  // connect.close ==========================================
  amqpConn.close()
  console.log(`${whoIs()} закрыл соединение`)
})

start()
