const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch(error) {
    console.error("getVehicleByInvId error" + error)
  }
}

async function addClassification(classification_name) {
  try {
    const data = await pool.query(
      `INSERT INTO classification (classification_name) VALUES ($1) RETURNING *`,
      [classification_name]
    )
    return data.rows;
  } catch (error) {
    return error.message
  }
}

async function checkExistingClassificationName(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const className = await pool.query(sql, [classification_name])
    return className.rowCount
  } catch (error) {
    return error.message
  }
}

async function addVehicle(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) {
  try {
    const data = await pool.query(
      `INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]
    )
    return data.rows;
  } catch (error) {
    return error.message
  }
}

async function checkExistingClassificationId(classification_id) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_id = $1"
    const classId = await pool.query(sql, [classification_id])
    return classId.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleByInvId, addClassification, checkExistingClassificationName, addVehicle, checkExistingClassificationId };