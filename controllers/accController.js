const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: res.locals.account_firstname,
    account_lastname: res.locals.account_lastname,
    account_email: res.locals.account_email,
    account_id: res.locals.accountData.account_id,
    account_type: res.locals.accountData.account_type
  })
}

/* ****************************************
*  Deliver update view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id } = req.params
  const updatedData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_firstname: updatedData.account_firstname,
    account_lastname: updatedData.account_lastname,
    account_email: updatedData.account_email
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration')
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      error: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log(accountData)
  if (!accountData) {
    req.flash("notice", "Please check you credentials and try again")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000})
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process Update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    req.flash(
      "notice",
      `Your information has been updated.`
    )
    req.flash(
      "notice",
      `First name: ${account_firstname}.`
    )
    req.flash(
      "notice",
      `Last name: ${account_lastname}`
    )
    req.flash(
      "notice",
      `Email: ${account_email}`
    )

    const updatedData = await accountModel.getAccountById(account_id)

    res.status(201).render("account/management", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: updatedData.account_firstname,
      account_lastname: updatedData.account_lastname,
      account_email: updatedData.account_email,
      account_type: updatedData.account_type,
      account_id: updatedData.account_id
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password, account_id } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration')
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      error: null,
      account_firstname,
      account_lastname,
      account_email
    })
    return
  }

  const changePassResult = await accountModel.changePassword(
    account_id,
    hashedPassword
  )

    const updatedData = await accountModel.getAccountById(account_id)

  if (changePassResult) {
    req.flash(
      "notice",
      `Your password was changed.`
    )
    res.status(201).render("account/management", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: updatedData.account_firstname,
      account_lastname: updatedData.account_lastname,
      account_email: updatedData.account_email,
      account_type: updatedData.account_type,
      account_id: updatedData.account_id
    })
  } else {
    req.flash("notice", "Sorry, an error occured when changing your password.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function logoutProcess(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

/* ****************************************
*  Deliver Add Account view
* *************************************** */
async function buildAddAccount(req, res, next) {
  let nav = await utilities.getNav()
  const accountTypeSelect = await utilities.addAccountTypeList()
  res.render("./account/add-account", {
    title: "Add Account",
    nav,
    errors: null,
    accountTypeSelect
  })
}

/* ****************************************
*  Process Adding an Account
* *************************************** */
async function addAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password, account_type } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error adding the account.')
    res.status(500).render("account/add-account", {
      title: "Add Account",
      nav,
      error: null,
      account_firstname,
      account_lastname,
      account_email,
      account_type
    })
    return
  }

  const regResult = await accountModel.addAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword,
    account_type
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve added the account for ${account_firstname} ${account_lastname}.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/add-account", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_type
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdateAccount, updateAccount, changePassword, logoutProcess, buildAddAccount, addAccount }