'use strict'

// This is a JavaScript-based config file containing every Mocha option plus others.
// If you need conditional logic, you might want to use this type of config,
// e.g. set options via environment variables 'process.env'.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  'allow-uncaught': false,
  'async-only': false,
  // bail: false,
  'check-leaks': true,
  color: true,
  delay: false,
  diff: true,
  // exit: false, // could be expressed as "'no-exit': true"
  extension: ['js', 'cjs', 'mjs'],
  'fail-zero': true,
  // fgrep: 'something', // fgrep and grep are mutually exclusive

  // Тесты конекретных файлов без гемора и с конфигом
  // file: ['/path/to/some/file', '/path/to/some/other/file'],
  // file: ['./api/parser/check_functions/firstCheckDynamic.spec.js'],
  // file: ['./api/parser/checkFns.spec.js'],
  file: ['./api/parser/ruleFns.spec.js'],

  // 'forbid-only': false,
  // 'forbid-pending': false,
  'full-trace': true,
  // global: ['jQuery', '$'],
  // grep: /something/i, // also 'something', fgrep and grep are mutually exclusive
  // growl: false,
  ignore: ['./node_modules'],
  'inline-diffs': false,
  // invert: false, // needs to be used with grep or fgrep
  jobs: 1,
  // 'node-option': ['unhandled-rejections=strict'], // without leading "--", also V8 flags
  package: './package.json',
  // parallel: false,
  // recursive: false,
  // reporter: 'spec',
  // 'reporter-option': ['foo=bar', 'baz=quux'], // array, not object
  // require: '@babel/register',
  retries: 0,
  slow: '75',
  sort: false,
  // spec: ['./**/*.spec.js'], // the positional arguments!
  timeout: '500000', // same as "timeout: '2s'"
  // timeout: false, // same as "timeout: 0"
  'trace-warnings': true, // node flags ok
  // ui: 'bdd',
  // 'v8-stack-trace-limit': 100, // V8 flags are prepended with "v8-"
  watch: false,
  // 'watch-files': ['lib/**/*.js', 'test/**/*.js'],
  // 'watch-ignore': ['lib/vendor']
}

// Команда для тестирования одного файла
// npm run test -- --no-config --file="./api/parser/check_functions/firstCheckDynamic.spec.js"
