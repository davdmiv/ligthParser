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

// Модели
const { Rule, ChangeNote } = require('../../../models/index')

// Константа пути для файлов
const PATH_TO_STATIC_CHANGE_NOTES = require('../../utils/consts')

/**
 * Непосредственная функция теста и создания первой ChangeNote
 * по заданным url и правилу, при удачном раскладе
 * @param {*} rule
 * @returns Rule | ApiError
 */
const checkStaticRule = async (rule) => {
  // Подготавливаем объект ChangeNote для записи в бд
  try {
    // Засекаем время на запрос
    const timeStart = new Date()
    let timeFinish = new Date()

    // Запрос - получаем html - загружаем $
    const res = await fetch(rule.url)
    const html = await res.text()
    const $ = cheerio.load(html)

    //Проверяем сколько было найдено элементов по правилу
    console.log(
      `По правилу ${rule.name} найдено элементов: ${$(rule.shrub_rule).length}`
    ) // Отладка (!)

    // Проверяем есть один ли у нас 1 элемент по присланному "правилу
    if ($(rule.shrub_rule).length === 1) {
      // Фиксируем время застраченное на запрос и поиск элемента
      timeFinish = new Date()

      // Инициализируем куст, получаем его кеш как md5
      const shrub = $(rule.shrub_rule).html()
      const shrubCalcCache = md5(shrub)

      // Сравиниваем хеш с тем что записано в правиле
      if (rule.shrub_cache !== shrubCalcCache) {
        console.log(`В правиле "${rule.name}" замечено изменение!`) // Отладка (!)

        // Если не равны, создаём объект заметки
        // Создаём объект заметки
        // Создание объекта заметки -------------------------------------------------------
        let changeNote = new ChangeNoteDTO(
          rule.shrub_rule,
          shrub,
          rule.shrub_cache,
          shrubCalcCache
        )
        // Привязываем сразу к правилу
        changeNote.rule_id = rule.id

        // сохраняем html
        fs.writeFileSync(
          path.resolve(
            __dirname,
            PATH_TO_STATIC_CHANGE_NOTES + changeNote.html_attachment
          ),
          html
        )

        const newChangeNote = await ChangeNote.create(changeNote)
        // Создание объекта заметки -------------------------------------------------------

        // Обновление инфу в правиле
        await rule.update({
          shrub_cache: shrubCalcCache,
          page_changed: newChangeNote.check_datetime,
          last_check: newChangeNote.check_datetime,
          duration: timeFinish - timeStart,
          activate_cnt: rule.activate_cnt + 1,
        })

        // Возможно тут вызов рассылки с оповещением всех,
        // что по правилу произошли изменения
      } else {
        // Если хеш не поменялся
        // Обновление инфу в правиле
        await rule.update({
          last_check: Date.now(),
          duration: timeFinish - timeStart,
          activate_cnt: rule.activate_cnt + 1,
        })
      }

      // Не забываем возвращать правило обратно
      return rule
    } else {
      // если не один, то мы с таким не работаем, возвращаем ошибку
      const elemCount = $(rule.shrub_rule).length

      console.log('Правило не прошло проверку...') // Отладка (!)

      return ApiError.internal(
        `Правило: ${rule.name}. На странице была найдено ${elemCount} элементов по заданному правилу. Уточните правило до одного элемента.`
      )
    }
  } catch (error) {
    return ApiError.internal(error.message)
  }
}

module.exports = checkStaticRule
