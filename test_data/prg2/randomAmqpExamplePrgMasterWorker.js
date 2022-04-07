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
    conn.on('error', function (err) {
      if (err.message !== 'Connection closing') {
        console.error(`${whoIs()} [AMQP] conn error`, err.message)
      }
    })
    //
    conn.on('close', function () {
      console.error(`${whoIs()} [AMQP] reconnecting`)
      return setTimeout(start, 1000)
    })
    console.log(`${whoIs()} [AMQP] connected`)
    amqpConn = conn
    startWorker()
  })
}

// A worker that acks messages only if processed succesfully
function startWorker() {
  amqpConn.createChannel(function (err, ch) {
    if (closeOnErr(err)) return
    ch.on('error', function (err) {
      console.error(`${whoIs()} [AMQP] channel error`, err.message)
    })

    ch.on('close', function () {
      console.log(`${whoIs()} [AMQP] channel closed`)
    })

    ch.prefetch(10)
    ch.assertQueue('jobs', { durable: true }, function (err, _ok) {
      if (closeOnErr(err)) return
      ch.consume('jobs', processMsg, { noAck: false })
      console.log(`${whoIs()} Queue Worker is started`)
    })

    function processMsg(msg) {
      work(msg, function (ok) {
        try {
          if (ok) ch.ack(msg)
          else ch.reject(msg, true)
        } catch (e) {
          closeOnErr(e)
        }
      })
    }
  })
}

function work(msg, cb) {
  console.log(`${whoIs()} Got msg `, msg.content.toString())
  cb(true)
}

function closeOnErr(err) {
  if (!err) return false
  console.error(`${whoIs()} [AMQP] error`, err)
  amqpConn.close()
  return true
}

start()
