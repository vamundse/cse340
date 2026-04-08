// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const inventoryValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/index")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))
router.get("/", utilities.checkIfAdmin, utilities.handleErrors(invController.buildInvManagement))
router.get("/add-classification", utilities.checkIfAdmin, utilities.handleErrors(invController.buildAddClassification))
router.get("/add-vehicle", utilities.checkIfAdmin, utilities.handleErrors(invController.buildAddVehicle))
router.get("/getInventory/:classification_id", utilities.checkIfAdmin, utilities.handleErrors(invController.getInventoryJSON))
// Route to build the inventory edit view
router.get("/edit/:inv_id", utilities.checkIfAdmin, utilities.handleErrors(invController.buildEditInventory))
// Route to build the inventory deletion view
router.get("/delete/:inv_id", utilities.checkIfAdmin, utilities.handleErrors(invController.buildDeleteInventory))

router.post(
    "/add-classification/",
    inventoryValidate.addClassificationRules(),
    inventoryValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
router.post(
    "/add-vehicle/",
    inventoryValidate.addVehicleRules(),
    inventoryValidate.checkVehicleData,
    utilities.handleErrors(invController.addVehicle)
)
router.post(
    "/update/",
    inventoryValidate.addVehicleRules(),
    inventoryValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

router.post(
    "/delete/",
    utilities.handleErrors(invController.deleteInventory)
)
module.exports = router;