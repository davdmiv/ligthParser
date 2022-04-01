// const { ChangeNote } = require('../models/index')
// const ApiError = require('../error/ApiError')
// const easyRuleStaticTest = require('../api/easyRuleStaticTest')
// const easyRuleDynamicTest = require('../api/easyRuleDynamicTest')

class AppController {
  async testRule(req, res, next) {
    // const { url, shrubRule, pageType } = req.body

    // let cangeNote = null

    // try {
    //   if (pageType === 'static') {
    //     cangeNote = await easyRuleStaticTest({ url, shrubRule })
    //   } else if (pageType === 'dynamic') {
    //     cangeNote = await easyRuleDynamicTest({ url, shrubRule })
    //   } else {
    //     return next(ApiError.internal(`Неизвестный тип страницы ${pageType}`))
    //   }

    //   if (cangeNote instanceof ApiError) {
    //     return next(cangeNote)
    //   }

    //   const newChangeNote = await ChangeNote.create({ ...cangeNote })

    //   return res.json({ changenote: newChangeNote })
    //     } catch (error) {
    //         return next(ApiError.internal(error))
    //       }
        return res.json({ message: "Загшука AppController.testRule" })
  }


  
}

module.exports = new AppController()
