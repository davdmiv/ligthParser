const { ChangeNote } = require('../../models/index')
const ApiError = require('../../error/ApiError')

class ChangeNoteController {
  createChangeNote(changeNoteDTO){
    try {
      return await ChangeNote.create(changeNoteDTO)
    } catch (error) {
      return ApiError.internal(`Ошибка при создании ChahgeNote: ${error}`)
    }
  } 
  
  deleteChangeNote(id){
    try {
      let findChangeNote = await ChangeNote.findByPk(id) 
      await findChangeNote.destroy()
      return true
    } catch (error) {
      return ApiError.internal(`Ошибка при создании ChahgeNote: ${error}`)
    }
  }
}

module.exports = new ChangeNoteController()