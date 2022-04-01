const Router = require('express')
const router = new Router()

const appController = require('../controllers/appController')

// Утилита для определения Master/Worker
const { whoIs } = require('../../parser/async_handlers/asyncClusterUtils')

// GET в корень для проверки "кто и что"
router.get('/', (req, res) => {
  res.status(200).json({ message: `${whoIs()} ParserApp is WORCKING...` })
})

router.post('/rules/test', appController.testRule)

module.exports = router
