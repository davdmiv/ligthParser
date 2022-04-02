const Router = require('express')
const router = new Router()

const appController = require('../controllers/AppController')

// Утилита для определения Master/Worker
const { whoIs } = require('../../parser/async_handlers/asyncClusterUtils')

// GET в корень для проверки "кто и что"
router.get('/', (req, res) => {
  res.status(200).json({ message: `${whoIs()} ParserApp is WORCKING...` })
})

router.post('/rule/test', appController.testRule)
router.post('/rule/check', appController.checkRule)
router.post('/rule/activate', appController.activateRule)
router.post('/rule/deactivate', appController.deactivateRule)

router.post('/parser/start', appController.parserStart)
router.post('/parser/stop', appController.parserStop)

module.exports = router
