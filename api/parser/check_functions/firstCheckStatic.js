// Для запроса на статику
const fetch = require('node-fetch')

// Для сохранения файлов html
const fs = require('fs')

// path для пути
const path = require('path')

// $ для поиска элемента в html
const cheerio = require('cheerio')

// Для кеширования куста
const md5 = require('md5')

// Класс dto ChangeNote
const ChangeNoteDTO = require('../dto/ChangeNote.dto')

// Экземпляк класса для кастомного описания ошибок
const ApiError = require('../../error/ApiError')

// Константа пути для файлов
const PATH_TO_STATIC_CHANGE_NOTES = require('../../utils/consts')

/**
 * Непосредственная функция теста и создания первой ChangeNote по заданным url и правилу, при удачном раскладе
 * @param {*} testRule { shrubRule, url }
 * @returns ChangeNote | ApiError
 */
const firstCheckStatic = async (testRule) => {
  // Подготавливаем объект ChangeNote для записи в бд
  const { shrubRule, ruleUrl } = testRule
  try {
    // Засекаем время на запрос
    const timeStart = new Date()

    // Запрос - получаем html - загружаем $
    const res = await fetch(ruleUrl)
    const html = await res.text()
    const $ = cheerio.load(html)

    //Проверяем сколько было найдено элементов по правилу
    console.log(`По правилу найдено элементов: ${$(shrubRule).length}`) // Отладка (!)

    // Если найден 1 элемент то создаём из него ChangeNote, проверка -- пройдена
    if ($(shrubRule).length === 1) {
      // Фиксируем время застраченное на запрос и поиск элемента
      const timeFinish = new Date()

      // если один то инициализируем куст, получаем его кеш как md5
      const shrub = $(shrubRule).html()
      const shrubCache = md5(shrub)

      // Создаём объект заметки
      let changeNote = new ChangeNoteDTO(
        shrubRule,
        shrub,
        shrubCache,
        shrubCache
      )

      // Сохраняем html на диск (!!) тут возможно нужно
      // в try catch сохранять и в бд а возвращать уже объект sequelize
      // если в catch ошибки, то удалять с диска (имитация транзакции)
      fs.writeFileSync(
        path.resolve(
          __dirname,
          PATH_TO_STATIC_CHANGE_NOTES + changeNote.html_attachment
        ),
        html
      )

      // Создаём набросок объекта правила

      return { duration: timeFinish - timeStart, changeNote }
    } else {
      // если не один, то мы с таким не работаем, возвращаем ошибку
      const elemCount = $(testRule.shrubRule).length

      console.log('Правило не прошло проверку...') // Отладка (!)

      return ApiError.internal(
        `На статическом тесте странице была найдено ${elemCount} элементов по заданному правилу. Измените правило или воспользуйтесь динамическим.`
      )
    }
  } catch (error) {
    return ApiError.internal(error)
  }
}

module.exports = firstCheckStatic
