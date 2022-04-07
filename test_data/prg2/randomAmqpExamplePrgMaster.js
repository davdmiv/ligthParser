//https://github.com/cloudamqp/nodejs-amqp-example/blob/master/amqplib/app.js
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')
const amqp = require('amqplib/callback_api')

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null
let numMsg = 0

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
    startPublisher()
  })
}

let pubChannel = null
let offlinePubQueue = []

function startPublisher() {
  amqpConn.createConfirmChannel(function (err, ch) {
    if (closeOnErr(err)) return
    ch.on('error', function (err) {
      console.error(`${whoIs()} [AMQP] channel error`, err.message)
    })
    ch.on('close', function () {
      console.log(`${whoIs()} [AMQP] channel closed`)
    })

    pubChannel = ch
    while (true) {
      var m = offlinePubQueue.shift()
      if (!m) break
      publish(m[0], m[1], m[2])
    }
  })
}

function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(
      exchange,
      routingKey,
      content,
      { persistent: true },
      function (err, ok) {
        if (err) {
          console.error(`${whoIs()} [AMQP] publish`, err)
          offlinePubQueue.push([exchange, routingKey, content])
          pubChannel.connection.close()
        } else {
          console.log(
            `${whoIs()} успешно отпраил сообщение`,
            content.toString()
          )
        }
      }
    )
  } catch (e) {
    console.error(`${whoIs()} [AMQP] publish`, e.message)
    offlinePubQueue.push([exchange, routingKey, content])
  }
}

function closeOnErr(err) {
  if (!err) return false
  console.error(`${whoIs()} [AMQP] error`, err)
  amqpConn.close()
  return true
}

// Генерит сообщения
setInterval(function () {
  publish('', 'jobs', new Buffer.from(`msg #${numMsg++}`))
}, 1000)

start()
