const uuid = require('uuid')

module.exports = class ChangeNoteDTO {
  constructor(shrubRule, shrub, shrubCache, shrubCalcCache) {
    // id
    this.screenshot_attachment = null
    this.html_attachment = `/html/${uuid.v4()}.html` // обязательное
    this.check_datetime = Date.now() // обязательное
    this.shrub_rule = shrubRule // обязательное
    this.shrub = shrub
    this.shrub_cache = shrubCache
    this.shrub_calc_cache = shrubCalcCache // обязательное
    this.user_note = ''
    this.rule_id = null
    // created_at
    // updated_at
  }

  newScreenShot() {
    return this.screenshot_attachment = `/screenshots/${uuid.v4()}.png`
  }
}
