const cluster = require('cluster')

const whoIs = () =>
  `${cluster.isMaster ? 'Master' : 'Worker'} pid(${process.pid})`
const pauseForResponse = () => (Math.floor(Math.random() * 12) + 3) * 10000
const getWaitingTime = (time) =>
  new Date(time).toISOString().match(/T((.)*).(...)Z/)[1]
const CR = '\n-----------------------'

module.exports = {
  whoIs,
  pauseForResponse,
  getWaitingTime,
  CR,
}
