const { Rule, ChangeNote } = require('../models/index')
const ApiError = require('../api/error/ApiError')

const ruleCreate = async (ruleWithChangeNote) => {
  // Достаём уже подготовыленные rule и первый changeNote
  const { rule, changenote } = ruleWithChangeNote
  try {
    // Создаём Rule
    const newRule = await Rule.create(rule)

    console.log()
    // Находим ChangeNote по id
    const findCNote = await ChangeNote.findByPk(changenote.id)

    // Связываем экземпляр с правилом
    findCNote.setRule(newRule)

    // Сохраняем изменения
    await findCNote.save()

    // возвращаем true, (пока не придумал что другое,
    // т.к на серваке будет редирект на show или edit
    // данные в который будут из соответствующего запроса в бд)
    return newRule
  } catch (error) {
    console.log('Ошибка в ruleCreate:', error)
    return ApiError.internal(`Ошибка в ruleCreate: ${error}`)
  }
}
module.exports = {
  ruleCreate,
}
