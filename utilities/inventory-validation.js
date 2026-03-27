const utilities = require(".")
const inventoryModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Add Classification Data Validation Rules
  * ********************************* */
  validate.addClassificationRules = () => {
    return [
      // firstname is required and must be string
      body("classification_name")
        .trim()
        .notEmpty()
        .isLength({ min: 3 })
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Please provide a valid classification name with at least 3 letters and no space or special characters.") // on error this message is sent.
        .custom(async (classification_name) => {
        const classificationExists = await inventoryModel.checkExistingClassificationName(classification_name)
        if (classificationExists) {
          throw new Error("The classification name exists. Please enter a different classification name.")
        }
      })
    ]
  }

  /* ******************************
   * Check data and return errors or add classification
   * ***************************** */
  validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name
      })
      return
    }
    next()
  }

  /*  **********************************
  *  Add Vehicle Data Validation Rules
  * ********************************* */
  validate.addVehicleRules = () => {
    return [
      // firstname is required and must be string
        body("classification_id")
            .trim()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please select a classification.") // on error this message is sent.
            .custom(async (classification_id) => {
            const classificationExists = await inventoryModel.checkExistingClassificationId(classification_id)
            if (!classificationExists) {
            throw new Error("Please choose a classification that exist.")
            }
        }),

        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a valid make for the car."), // on error this message is sent.

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid model for the car"), // on error this message is sent.

        body("inv_year")
            .trim()
            .notEmpty()
            .matches(/^[0-9]{4}/)
            .withMessage("Please provide valid year for the car."), // on error this message is sent.

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 20 })
            .withMessage("Please provide a description of the car that is more than 20 characters."), // on error this message is sent.

        body("inv_image")
            .trim()
            .notEmpty()
            .matches(/^\/images\/vehicles\/.*\.(jpg|jpeg|png|gif)$/i)
            .withMessage("Please provide a valid image path."), // on error this message is sent.

        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .matches(/^\/images\/vehicles\/.*\.(jpg|jpeg|png|gif)$/i)
            .withMessage("Please provide a valid image path."), // on error this message is sent.

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .matches(/^[0-9]{3,}/)
            .withMessage("Please provide a valid price for the car."), // on error this message is sent.

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .matches(/^[0-9]{1,}/)
            .withMessage("Please provide a valid milage for the car."), // on error this message is sent.

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .matches(/^[a-zA-Z ]{3,}/)
            .withMessage("Please provide a valid color for the car."), // on error this message is sent.
    ]
  }

    /* ******************************
   * Check data and return errors or add vehicle
   * ***************************** */
  validate.checkVehicleData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    let errors = []
    let classificationList = await utilities.addVehicleClassificationList()
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-vehicle", {
        errors,
        title: "Add Vehicle",
        nav,
        classificationList,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      })
      return
    }
    next()
  }
  module.exports = validate