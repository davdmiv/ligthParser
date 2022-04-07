require('dotenv').config()
// Инициализируем порт
const PORT = process.env.PORT || 5002
// Кластер
const cluster = require('cluster')
// Модуль http для создания web-сервера
const http = require('http')
// Утилита для определения Master/Worker
const { whoIs } = require('./parser/async_handlers/asyncClusterUtils')
// Оброботчик события message для Master
const {
  workerMessageHandler,
} = require('./parser/async_handlers/workerHandlers')

// Библиотека для работы с БД, инстанс (!)
// наверно лучше объявить сразу,
// чтобы не было постоянных подключений
// const { sequelize } = require('./models/index')

// Очереди
const amqp = require('amqplib/callback_api')

// Импортируем конфигурацию веб-сервера
const app = require('./server/app')

// Создаём сервер на основе импортированной конфигурации
const server = http.createServer(app)

// Запускаем прослушку порта
server.listen(PORT, () =>
  console.log(`${whoIs()} Server started.  server.address():`, server.address())
)
// Вешаем обработчики событий

server.on('error', onError)
// server.on('listening', () => {
//   console.log(`${whoIs()} server.address()`, server.address())
// })

// Устанавливаем коннект с сервером очередей
amqp.connect('amqp://localhost', function(error0, connection) {
  // Если ошибка, то бросаем исключение
  if (error0) {
    throw error0
  }
  // Если нет ошибок, то создаём канал
  connection.createChannel(function(error1, channel) {
    // Если при создании канала была ошибка, то бросаем исключение
    if (error1) {
      throw error1;
    }
    // Очередь (название)
    let queue = 'hello';

    // Получаем сообщение из очереди-? Ждём сообщения?
    channel.assertQueue(queue, {
      durable: false
    });
  });
});

//При запуске посылают на мастер 'workerIsReady' что готовы
const status = cluster.worker.send({ target: 'workerIsReady' })

// Логи... ------
console.log(
  status
    ? `${whoIs()} сообщил о готовности`
    : `${whoIs()} не смог сообщить о готовности`
)
// Логи... ------

// Вешаем обработчик сообщений на Worker'а
cluster.worker.on('message', workerMessageHandler)

// some strange errors
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

