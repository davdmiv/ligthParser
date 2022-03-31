 // (!) Здесь могла быть вызвана параллельная обработка

// Получаем обновлённое правило, только что протестированное
let testedRule = await checkDynamicRule(rule)
// --

// Если получаем ошибку по правилу -- правило "выбывает из игры"
// делаем его неаквтивным
if (testedRule instanceof ApiError) {
  await rule.update({
    activate_status: false,
    description: `Обнаружена ошибка с правилом, правило деактивировано. \n${rule.description}`,
  })
  console.log(
    `loop(): получил ошибку из checkDynamicRule(), правило ${rule.name}`,
    testedRule
  )
} else {
  // Запихиваем его обратно в Парсер, в очередь активных
  parser.dynamicQueue.push(testedRule)
  console.log(`loop(): Правило ${testedRule.name} обработано`)
}
console.log('loop(): Готовых правил: ', readyRules.length)
console.log('loop(): Активных правил: ', parser.dynamicQueue.length)