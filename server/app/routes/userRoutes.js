const express = require('express')
const router = express.Router()
const userauthController = require('../controllers/userauthController')

router.post('/signup',userauthController.signup) //tested
router.post('/login',userauthController.login) //tested
router.post('/sendotp',userauthController.sendotp)
router.post('/forgotPassword',userauthController.forgotPassword)
router.post('/resetPassword',userauthController.resetPassword)
router.post('/updatePassword',userauthController.updatePassword)

// router.get('/getUser/:id',userauthController.getAUserinfo) //tested
// router.get('/getAllUsers',userauthController.getAllUsers) //tested
 
module.exports = router
