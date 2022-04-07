require('dotenv').config()
// Кластер
const cluster = require('cluster')
// ParserController
const { ParserController } = require('./parser/classes/ParserController')
// Библиотека для работы с БД, инстанс
const { sequelize } = require('../models/index')
// Оброботчик события message для Master
const {
  masterMessageHandler,
} = require('./parser/async_handlers/masterHandlers')

// Очереди
const amqp = require('amqplib/callback_api')

// const numCPUs = require('os').cpus().length
;(async () => {
  try {
    // ++ Соединяется с БД
    await sequelize.authenticate()
    await sequelize.sync()
    // -- Соединяется с БД

    // Инициализируем инстанс парсера
    const parser = new ParserController()

    // Открываем коннект с сервером очередей
    amqp.connect('amqp://localhost', function (error0, connection) {
      // Если ошибка, то бросаем исключение
      if (error0) {
        throw error0
      }
      // Если нет ошибок, то создаём канал
      connection.createChannel(function (error1, channel) {
        // Если при создании канала была ошибка, то бросаем исключение
        if (error1) {
          throw error1;
        }
        // Очередь (название)
        let queue = 'hello';
        // Сообщение
        let msg = 'Hello world';
        
        // Создаём очередь с именем из queue
        channel.assertQueue(queue, {
          durable: false  // длительность - ?
        });
        
        // Послылаем сообщение, используем буфер
        channel.sendToQueue(queue, Buffer.from(msg));
        // Печать сообщения
        console.log(" [x] Sent %s", msg);
      })
    })

    // Надо не забывать закрывать соединение с сервером очередей
    // setTimeout(function() {
    //   connection.close();
    //   process.exit(0)
    //   }, 500);

    for (let i = 0; i < 6 /*numCPUs*/; i++) {
      const worker = cluster.fork()
    }

    // // Обработка события 'message' на master
    cluster.on('message', masterMessageHandler)

    // Стартуем парсер
    await parser.start()
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
