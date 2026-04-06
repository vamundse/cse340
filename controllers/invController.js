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
  const classificationSelect = await utilities.addVehicleClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
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
    const classificationSelect = await utilities.addVehicleClassificationList()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect
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
*  Deliver Add new vehicle view
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
    const classificationSelect = await utilities.addVehicleClassificationList()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No Data returned"))
  }
}

/* ****************************************
*  Deliver inventory edit view
* *************************************** */
invCont.buildEditInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let invId = parseInt(req.params.inv_id)
  const itemData = await invModel.getVehicleByInvId(invId)
  const vehicle = itemData[0]
  let classificationList = await utilities.addVehicleClassificationList(vehicle.classification_id)
  const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    errors: null,
    classificationList: classificationList,
    inv_id: vehicle.inv_id,
    inv_make: vehicle.inv_make,
    inv_model: vehicle.inv_model,
    inv_year: vehicle.inv_year,
    inv_description: vehicle.inv_description,
    inv_image: vehicle.inv_image,
    inv_thumbnail: vehicle.inv_thumbnail,
    inv_price: vehicle.inv_price,
    inv_miles: vehicle.inv_miles,
    inv_color: vehicle.inv_color,
    classification_id: vehicle.classification_id
  })
}

/* ****************************************
*  Update inventory data
* *************************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body

  const updateResult = await invModel.updateInventory(
    classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was succesfully updated.`)
    res.redirect("/inv/")
    } else {
      const classificationSelect = await buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry the insert failed.")
      res.status(501).render("inventory/edit-inventory", {
      title: "Edit" + itemName,
      nav,
      classificationSelect : classificationSelect,
      errors: null,
      inv_id,
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

/* ****************************************
*  Deliver inventory edit view
* *************************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let invId = parseInt(req.params.inv_id)
  const itemData = await invModel.getVehicleByInvId(invId)
  const vehicle = itemData[0]
  const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: vehicle.inv_id,
    inv_make: vehicle.inv_make,
    inv_model: vehicle.inv_model,
    inv_year: vehicle.inv_year,
    inv_price: vehicle.inv_price
  })
}

/* ****************************************
*  Delete inventory data
* *************************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  const { inv_id, inv_make, inv_model, inv_year, inv_price } = req.body
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
    req.flash("notice", `The deletion was successful.`)
    res.redirect("/inv/")
    } else {
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry the deletion failed.")
      res.status(501).render("inventory/delete-confirm", {
      title: "Delete" + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price
    })
  }
}

module.exports = invCont