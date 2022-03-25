module.exports = class RuleDTO {
  constructor(ruleName, ruleUrl, shrubRule, shrubCache, pageType, userId) {
    // id
    this['name'] = ruleName // обязательное
    this.url = ruleUrl  // обязательное
    this.shrub_rule = shrubRule // обязательное
    this.shrub_cache = shrubCache 
    this.frequency = new Date(86400000) // по дефолту 1 день // обязательное
    this.page_type = pageType // обязательное
    this.page_changed = null
    this.last_check = null
    this.duration = null
    this.public_status = false  // обязательное
    this.description = '' // обязательное
    this.activate_cnt = 0 // обязательное
    this.activate_status = true // обязательное
    this.user_id = userId // обязательное 
    // created_at
    // updated_at
  }
}
