const cluster = require('cluster')
// запускаем потоки
for (let i = 0; i < 6 /*numCPUs*/; i++) {
  const worker = cluster.fork()
}
// Тестовый счётчик отправленных правил 
let testRuleNum = 0

// Очереди ---------------------------------------------------------
const amqp = require('amqplib/callback_api')
// Коннект, чтобы дёргать другие функции вне колбека
let amqpConn = null
// Канал, для управления очередью меж функций
let pubChannel = null
// Оффлайн очередь О_о
let offlinePubQueue = []


// Коннектимся
amqp.connect('amqp://localhost', function (err, conn) {
  // На ошибку во время открытия
  if (err) {
    console.error('[AMQP]', err.message)
    return 1
    // return setTimeout(start, 1000)
  }
  // На ошибку в процессе
  conn.on('error', function (err) {
    if (err.message !== 'Connection closing') {
      console.error('[AMQP] conn error', err.message)
    }
  })
  // На закрытие
  conn.on('close', function () {
    console.error('[AMQP] reconnecting')
    return setTimeout(start, 1000)
  })
  console.log('[AMQP] connected')
  // присваиваем коннект
  amqpConn = conn
  whenConnected()
})

// Смысл функции в том, что срабатывает, только после создания коннекрта
function whenConnected() {
  amqpConn.createConfirmChannel(function (err, ch) {
    // Если ошибка при создании каланала -- выход
    if (closeOnErr(err)) return
    // Если ошибка в процессе, печатаем ошибку
    ch.on('error', function (err) {
      console.error('[AMQP] channel error', err.message)
    })
    // На зкарытие канала? 
    ch.on('close', function () {
      console.log('[AMQP] channel closed')
    })

    // Запоминаме в глобальную переменную
    pubChannel = ch

    // while (true) {
    //   var m = offlinePubQueue.shift()
    //   if (!m) break
    //   publish(m[0], m[1], m[2])
    // }
  })
}

// Функция отправки сообщений в очередь
function publish(exchange, routingKey, content) {
  try {
    // Видим метод канала "отправить сообщение"
    pubChannel.publish(
      exchange,
      routingKey,
      content,
      { persistent: true },
      function (err, ok) {
        // Если словили ошибку при вызове колбека
        if (err) {
          // Выводим в лог сообшение об ошибке
          console.error('[AMQP] publish', err) 
          // offlinePubQueue.push([exchange, routingKey, content])
          pubChannel.connection.close()
        }
      }
    )
  } catch (e) {
    // Если словтли ошибку при вызове pubChannel.publish
    console.error('[AMQP] publish', e.message)
    // offlinePubQueue.push([exchange, routingKey, content])
  }
}

// Обработка события 'message' на master
cluster.on('message', masterMessageHandler)



