const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accController = require("../controllers/accController")
const accountValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accController.buildLogin))
router.get("/register", utilities.handleErrors(accController.buildRegister))
router.get("", utilities.checkLogin, utilities.handleErrors(accController.buildManagement))
router.get("/update/:account_id", utilities.handleErrors(accController.buildUpdateAccount))
router.get("/logout", utilities.handleErrors(accController.logoutProcess))
router.get("/add-account", utilities.checkIfAdmin, utilities.handleErrors(accController.buildAddAccount))

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
  utilities.handleErrors(accController.accountLogin)
)

router.post("/update-data",
  accountValidate.updateRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(accController.updateAccount)
)

router.post("/update-password",
  accountValidate.updatePasswordRules(),
  utilities.handleErrors(accController.changePassword)
)

router.post("/add-account",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accController.addAccount)
)

module.exports = router;