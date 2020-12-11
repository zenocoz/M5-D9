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
const productsFilePath = path.join(__dirname, "products.json")

//------------------------------------------ENDPOINTS--------------------------------//

//Create
router.post(
  "/",
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
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const products = await readDB(productsFilePath)
        let newProduct = {
          ...req.body,
          ID: uniquid(),
          modifiedAt: new Date(),
        }
        products.push(newProduct)
        await writeDB(productsFilePath, products)
        res.status(201).send({ "product created with id": newProduct.ID })
      }
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
