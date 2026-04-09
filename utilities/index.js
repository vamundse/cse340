const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid
  if(data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildVehicleDetails = async function(data) {
  let details
  if(data.length > 0) {
    details = `<div id="detail-display">`
    data.forEach(vehicle => {
      details += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${vehicle.inv_model} ${vehicle.inv_make}">`
      details += `<p id="detail-price">Sales price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`
      details += `<ul id="details-list">`
      details += `<li><b>Mileage:</b> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</li>`
      details += `<li><b>Color:</b> ${vehicle.inv_color}</li>`
      details += `<li><b>Description:</b> ${vehicle.inv_description}</li>`
      details += `</ul>`
    })
    details += `</div>`
  } else {
    details += '<p class="notice">Sorry, the vehicle could not be found.</p>'
  }
  return details
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
 * Makes a classification list for the Add Vehicle form
 **************************************** */
Util.addVehicleClassificationList = async function (classification_id) {
  let data = await invModel.getClassifications()
  let list = `<select name="classification_id" id="classificationsList" required>`
  list += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    list += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      list += " selected "
    }
    list += ">" + row.classification_name + "</option>"
  })
    list += "</select>"
    return list
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("account/login")
        }
        res.locals.accountData = accountData
        res.locals.account_firstname = accountData.account_firstname
        res.locals.account_lastname = accountData.account_lastname
        res.locals.account_id = accountData.account_id
        res.locals.account_type = accountData.account_type
        res.locals.account_email = accountData.account_email
        res.locals.loggedin = true
        next()
      }) 
    } else {
      res.locals.loggedin = false
      next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check if Administrator or Employee
 * ************************************ */
Util.checkIfAdminOrEmployee = async (req, res, next) => {
  if (res.locals.accountData && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    next()
  } else {
    req.flash("notice", "You do not have access to this page.")
    res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check if Administrator
 * ************************************ */
Util.checkIfAdmin = async (req, res, next) => {
  if (res.locals.accountData && res.locals.accountData.account_type === "Admin") {
    next()
  } else {
    req.flash("notice", "You do not have access to this page.")
    res.redirect("/account/login")
  }
}

/* ****************************************
 * Makes a account type list for the Add account form
 **************************************** */
Util.addAccountTypeList = async function (account_type) {
  let data = await accountModel.getAccountTypes()
  let list = `<select name="account_type" id="accountTypeList" value="<%= account_type %>" required>`
  list += "<option value=''>Choose an Account Type</option>"
  data.rows.forEach((row) => {
    list += '<option value="' + row.account_type + '"'
    if (
      account_type != null &&
      row.account_type == account_type
    ) {
      list += " selected "
    }
    list += ">" + row.account_type + "</option>"
  })
    list += "</select>"
    return list
}

module.exports = Util