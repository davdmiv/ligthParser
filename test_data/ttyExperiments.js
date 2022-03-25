// var tty = require('tty');
// process.stdin.setRawMode(true);
// process.stdin.resume();
//  console.log('I am leaving now');
// process.stdin.on('keypress', function(char, key) {
//   if (key && key.ctrl && key.name == 'c') {

//     process.exit()
//   }
// });
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

;(async () => {
  // process.stdout.write(str)
  for (let i = 1; i < 50; i++) {
    let str = `Правило dynamic-test3 \
    Времени до повторного применения: i = ${i}\nПравило dynamic-test2 \
    Времени до повторного применения: ${Date.now()}\nПравило dynamic-test4 \
    Времени до повторного применения: ${new Date().toISOString()}\n`
    process.stdout.write(str)
    // process.stdout.write('\r')
    // process.stdout.write('\r')
    // process.stdout.write('Допустим')
    process.stdout.moveCursor(0, -4)
    // process.stdout.write('Допустим')
    // process.stdout.moveCursor(-1, 1)
    await sleep(1000)
  }
  process.stdout.moveCursor(0, 4)
})()
