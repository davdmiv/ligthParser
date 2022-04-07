
const cluster = require('cluster')
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')

;(async () => {
  
  console.log(`${whoIs()} стартовал.`)
  if (cluster.isMaster) {
    // Исполняем инициализацию для master
    require('./testMaster')
  }
  // Если ты worker
  else if (cluster.isWorker) {
    // Исполняем инициализацию для worker
    require('./testWorker')
  }
})()