// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const inventoryValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/index")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
router.get("", utilities.handleErrors(invController.buildInvManagement));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.get("/add-vehicle", utilities.handleErrors(invController.buildAddVehicle))
router.post(
    "/add-classification",
    inventoryValidate.addClassificationRules(),
    inventoryValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
router.post(
    "/add-vehicle",
    inventoryValidate.addVehicleRules(),
    inventoryValidate.checkVehicleData,
    utilities.handleErrors(invController.addVehicle)
)

module.exports = router;