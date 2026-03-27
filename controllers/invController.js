const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by details view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId

    if (inv_id === "500") {
      const error = new Error("Sorry, the vehicle does not exist")
      error.status = 500
      throw error
    }

    const data = await invModel.getVehicleByInvId(inv_id)
    const details = await utilities.buildVehicleDetails(data)
    let nav = await utilities.getNav()
    const detailModel = data[0].inv_model
    const detailMake = data[0].inv_make
    const detailYear = data[0].inv_year
    res.render("./inventory/details", {
      title: `${detailYear} ${detailMake} ${detailModel}`,
      nav,
      details,
    })
  } catch (error) {
      next(error)
  }
}

/* ****************************************
*  Deliver Inventory Management view
* *************************************** */
invCont.buildInvManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver Add classification view
* *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Add Classification
* *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const addClassResult = await invModel.addClassification(
    classification_name
  )

  if (addClassResult) {
    req.flash("notice", `You have added ${classification_name} to the classification database.`)
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry the adding of the classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name
    })
  }
}

/* ****************************************
*  Deliver Inventory Management view
* *************************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.addVehicleClassificationList()
  res.render("./inventory/add-vehicle", {
    title: "Add Vehicle",
    nav,
    errors: null,
    classificationList
  })
}

/* ****************************************
*  Process Add Vehicle
* *************************************** */
invCont.addVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

  const addClassResult = await invModel.addVehicle(
    classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  )

  if (addClassResult) {
    req.flash("notice", `You have added ${inv_year} ${inv_make} ${inv_model} to the vehicle database.`)
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry the adding of the vehicle failed.")
    res.status(501).render("inventory/add-vehicle", {
      title: "Add Vehicle",
      nav,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  }
}

module.exports = invCont