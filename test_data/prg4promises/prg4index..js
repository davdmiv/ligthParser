const cluster = require('cluster')
const { whoIs } = require('../../api/parser/async_handlers/asyncClusterUtils')

;(async () => {
  
  console.log(`${whoIs()} стартовал.`)
  if (cluster.isMaster) {
    for (let i = 0; i < 3 /*numCPUs*/; i++) {
      const worker = cluster.fork()
    }
    // Исполняем инициализацию для master
    require('./prg4master')
  }
  // Если ты worker
  else if (cluster.isWorker) {
    // Исполняем инициализацию для worker
    require('./prg4worker')
  }
})()