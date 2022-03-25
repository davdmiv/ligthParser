const { Rule, Privilege, UserRule, ChangeNote } = require('../models/index')

const queueInit = async () => {
  const allRules = await Rule.findAll({
    where: {
      activate_status: true,
    },
  })

  console.log('--------- allRules start ---------')
  console.log('allRules:', allRules)
  console.log('--------- allRules end ---------')
}

const sumpleInsert = async () => {
  let changeNote = {
    html_attachment: `/html/html_attachment.html`,
    check_datetime: Date.now(),
    shrub_rule: 'shrub_rule',
    shrub: 'shrub',
    shrub_cache: 'shrub_cache',
    shrub_calc_cache: 'shrub_calc_cache',
  }
  
  let rezult = await ChangeNote.create(changeNote)

  console.log('rezult', rezult)
}

module.exports = {
  queueInit,
  sumpleInsert
}
