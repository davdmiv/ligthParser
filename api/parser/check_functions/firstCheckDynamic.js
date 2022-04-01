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

// Константа пути для файлов
const PATH_TO_STATIC_CHANGE_NOTES = require('../../utils/consts')

// Инициализируем "незаметный режим"
puppeteer.use(StealthPlugin())

// Дабы не терять в любом контексте (!!) возможно можно поместить до try
let browser

const firstCheckDynamic = async (testRule) => {
  // Подготавливаем объект ChangeNote для записи в бд
  const { shrubRule, ruleUrl } = testRule

  let changeNote

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
    await page.goto(ruleUrl, { waitUntil: 'load', timeout: 100000 })

    // Костыль позволяющий дождаться загрузки CSS элемента, если он не загрузился
    // Таймаут по-дефолту 30 сек, если незагрузится -- бросает исключение
    await page.waitForSelector(shrubRule)

    // Получаем html страницы
    const html = await page.content()

    // Скармливаем его jQuery
    const $ = cheerio.load(html)

    //Проверяем сколько было найдено элементов по правилу
    console.log(
      `По правилу ${testRule.ruleName} найдено элементов: ${
        $(shrubRule).length
      }`
    ) // Отладка (!)

    // проверяем есть один ли у нас элемент по присланному "правилу"
    if ($(shrubRule).length === 1) {
      // Фиксируем время застраченное на запрос и поиск элемента
      timeFinish = new Date()

      // если один то инициализируем куст, получаем его кеш как md5
      const shrub = $(shrubRule).html()
      const shrubCache = md5(shrub)

      // Создаём объект заметки
      changeNote = new ChangeNoteDTO(shrubRule, shrub, shrubCache, shrubCache)

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
    } else {
      // если не один, то мы с таким не работаем, возвращаем ошибку
      const pages = await browser.pages()
      await Promise.all(pages.map((page) => page.close()))
      await browser.close()

      const elemCount = $(shrubRule).length

      return ApiError.internal(
        `Правило: ${testRule.ruleName}. На странице была найдено ${elemCount} элементов по заданному правилу. Уточните правило до одного элемента.`
      )
    }

    // перед каждым return закрываем браузер
    const pages = await browser.pages()
    await Promise.all(pages.map((page) => page.close()))
    await browser.close()

    return { duration: timeFinish - timeStart, changeNote }
  } catch (error) {
    console.log(`Правило ${testRule.ruleName}. catch (error):`, error)
    // перед каждым return закрываем браузер
    const pages = await browser.pages()
    await Promise.all(pages.map((page) => page.close()))
    await browser.close()

    return ApiError.internal(error.message)
  }
}

module.exports = firstCheckDynamic
