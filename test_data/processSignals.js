let numMsg = 0
;(async () => {
  setInterval(function () {
    let rule = {
      name: `Rule #${numMsg++}`,
      status: 'inWork',
    }
    let msg = JSON.stringify(rule)
    console.log('msg', msg)
  }, 1000)
})()

process.once('SIGINT', function () {
  console.log('catch SIGINT')
})
