// Безголовый хром
const puppeteer = require('puppeteer-extra')

// Плагин для puppeteer
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

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

// Инициализируем "незаметный режим"
puppeteer.use(StealthPlugin())

// Дабы не терять в любом контексте (!!) возможно можно поместить до try
let browser

/**
 * Запускает хром, проверяет динамическое правило
 * Все данные для проверки динамического правила есть в переданном правиле
 * После, если нет никаких изменений -- обновляет правило (как минимум
 * время последней проверки, счётчик)
 *
 * Если изменения есть, то вызывает создание ChangeNote и, наверно тут,
 * инициация рассылки в случае изменения в правиле, или сообщение
 * на инициацию рассылки.
 * @param {*} rule Возвращает обновлённое правило
 */
const checkDynamicRule = async (rule) => {
  try {
    // Засекаем время на запрос
    const timeStart = new Date()
    let timeFinish = new Date()

    // Запускаем puppeteer
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--window-size=1920x1080'],
      headless: true,
    })

    // Получаем страницу
    let page = await browser.newPage()

    // Переходим по присланной ссылке
    await page.goto(rule.url, { waitUntil: 'load', timeout: 100000 })

    // Костыль позволяющий дождаться загрузки CSS элемента, если он не загрузился
    // Таймаут по-дефолту 30 сек, если незагрузится -- бросает исключение
    await page.waitForSelector(rule.shrub_rule)

    // Получаем html страницы
    const html = await page.content()

    // Скармливаем его jQuery
    const $ = cheerio.load(html)

    //Проверяем сколько было найдено элементов по правилу
    console.log(
      `По правилу ${rule.name} найдено элементов: ${$(rule.shrub_rule).length}`
    ) // Отладка (!)

    // Проверяем есть один ли у нас 1 элемент по присланному "правилу"
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

        // сохраняем screenshot
        await page.screenshot({
          path: path.resolve(
            __dirname,
            PATH_TO_STATIC_CHANGE_NOTES + changeNote.newScreenShot()
          ),
          fullPage: true,
        })

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
    } else {
      // если не один, то мы с таким не работаем, возвращаем ошибку
      const pages = await browser.pages()
      await Promise.all(pages.map((page) => page.close()))
      await browser.close()

      const elemCount = $(rule.shrub_rule).length

      return ApiError.internal(
        `Правило: ${rule.name}. На странице была найдено ${elemCount} элементов по заданному правилу. Уточните правило до одного элемента.`
      )
    }

    // перед каждым return закрываем браузер
    const pages = await browser.pages()
    await Promise.all(pages.map((page) => page.close()))
    await browser.close()

    // Не забываем возвращать правило обратно
    return rule
  } catch (error) {
    console.log(`Правило ${rule.name}. catch (error):`, error)
    // перед каждым return закрываем браузер
    const pages = await browser.pages()
    await Promise.all(pages.map((page) => page.close()))
    await browser.close()

    return ApiError.internal(error.message)
  }
}

module.exports = checkDynamicRule
