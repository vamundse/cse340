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

module.exports = invCont