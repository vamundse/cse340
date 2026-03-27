const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accController = require("../controllers/accController")
const accountValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accController.buildLogin))
router.get("/register", utilities.handleErrors(accController.buildRegister))
router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accController.registerAccount)
)
// Process the login attempt
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;