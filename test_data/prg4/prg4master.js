//https://github.com/cloudamqp/nodejs-amqp-example/blob/master/amqplib/app.js
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')
const amqp = require('amqplib/callback_api')

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null
let numMsg = 0

function start() {
  // connect -------------------------------------------------
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
    startPublisher()
  })
}

let pubChannel = null
let offlinePubQueue = []

function startPublisher() {
  amqpConn.createConfirmChannel(function (err, ch) {
    if (closeOnErr(err)) return
    
    // channel.on('error') start ==========================================
    ch.on('error', function (err) {
      console.error(`${whoIs()} [AMQP] channel error`, err.message)
    })
    // channel.on('error') end ==========================================
    
    // channel.on('close') start ==========================================
    ch.on('close', function () {
      console.log(`${whoIs()} [AMQP] channel closed`)
    })
    // channel.on('close') end ==========================================

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
  let rule = {
    name: `Rule #${numMsg++}`,
    status: 'inWork',
  }
  let msg = JSON.stringify(rule)
  publish('', 'jobs', new Buffer.from(msg))
}, 1000)

process.once('SIGINT', function () {
  amqpConn.close()
  console.log(`${whoIs()} закрыл соединение`)
})

start()
