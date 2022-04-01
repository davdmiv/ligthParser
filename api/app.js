// Конфиг для БД
require('dotenv').config()
// Экспресс фреймворк веб-сервера
const express = require('express')
// Модуль для для обработки cors
const cors = require('cors')

// Роутер для express, все маршруты описаны там
const router = require('./server/routes/index')
// Middleware для обработки ошибок
const errorHandler = require('./server/middleware/ErrorHandlingMiddleware')

// Создаём экзампляр сервера
const app = express()

// Инициализируем
// --------------------------------------
app.use(cors())
app.use(express.json())
app.use('/api', router)

//Обработка ошибок, последний Middleware! Потому как не вызывается next() и ответ уходит на клиент
app.use(errorHandler)
// --------------------------------------

// Экспортируем наш подготовленный экземпляр сервера
module.exports = app
