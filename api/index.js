// Кластер
const cluster = require('cluster')
const { whoIs } = require('./parser/async_handlers/asyncClusterUtils')

// -------------------------------------------------
// Main ++
;(async () => {
  console.log(`${whoIs()} стартовал.`)
  if (cluster.isMaster) {
    // Исполняем инициализацию для master
    require('./master')
  }
  // Если ты worker
  else if (cluster.isWorker) {
    // Исполняем инициализацию для worker
    require('./worker')
  }
})()
