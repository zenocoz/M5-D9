//TOOLS AND MIDDLEWARE
const express = require("express")
const fs = require("fs")
const path = require("path")
const uniquid = require("uniqid")
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { check, validationResult } = require("express-validator")
const { readDB, writeDB } = require("../../lib/utilities")

//Create Middleware Instances
const router = express.Router()
const upload = multer({})

//Paths
const cartsFilePath = path.join(__dirname, "carts.json")
const productsFolderPath = path.join(__dirname, "../../../public/img/products")
const productsFilePath = path.join(__dirname, "../products/products.json")

//Validation checks
const cartsValidation = [
    
        check("name").exists().withMessage("Insert name please"),
        check("description")
          .isLength({ min: 5 })
          .withMessage("description must be at least 5 characters")
          .exists()
          .withMessage("enter descritpion"),
        check("brand").exists().withMessage("Insert brand"),
        check("price").exists().withMessage("enter product price"),

]

//------------------------------------------ENDPOINTS--------------------------------//

//Create
router.post(
  "/",
,
  async (req, res, next) => {}
)

//Read

router.get("/", async (req, res, next) => {})

//get single product
router.get("/:id", async (req, res, next) => {
  try {
    const products = await readDB(productsFilePath)
    const singleProduct = products.filter(
      (product) => product.ID === req.params.id
    )
    if (singleProduct.length > 0) {
      res.send(singleProduct)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    next(error)
  }
})

//Update

router.put(
  "/:productId",
  [
    check("name").exists().withMessage("Insert name please"),
    check("description")
      .isLength({ min: 5 })
      .withMessage("description must be at least 5 characters")
      .exists()
      .withMessage("enter descritpion"),
    check("brand").exists().withMessage("Insert brand"),
    check("price").exists().withMessage("enter product price"),
  ],
  async (req, res, next) => {}
)

//Delete
router.delete("/:productId", async (req, res, next) => {})

module.exports = router
