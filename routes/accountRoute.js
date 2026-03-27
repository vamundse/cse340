const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accController = require("../controllers/accController")
const regValidate = require('../utilities/account-validation')
const loginValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accController.buildLogin))
router.get("/register", utilities.handleErrors(accController.buildRegister))
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accController.registerAccount)
)
// Process the login attempt
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;