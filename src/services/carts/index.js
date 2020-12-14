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
  // check("ownerId").exists().withMessage("owner id mandatory"),
  // check("total").isFloat({ min: 0 }).withMessage("Price must be non negative"),
]

//------------------------------------------ENDPOINTS--------------------------------//

//add product to cart
router.post(
  "/:cartId/add-to-cart/:productId",
  cartsValidation,
  async (req, res, next) => {
    try {
      //todo check errors differently
      const validationErrors = validationResult(req)

      if (!validationErrors.isEmpty()) {
        const error = new Error()
        error.httpStatusCode = 400
        error.message = validationErrors
        next(error)
      } else {
        productId = req.params.productId
        cartId = req.params.cartId
        const carts = await readDB(cartsFilePath)
        const singleCart = carts.find((cart) => cart._id === cartId)
        singleCart.products.push({ ID: productId })
        await writeDB(cartsFilePath, carts)
        res.send(singleCart)
      }
    } catch (errors) {
      next(errors)
    }
  }
)

//Read

//get cart
router.get("/:cartId", async (req, res, next) => {
  try {
    const carts = await readDB(cartsFilePath)
    const cart = carts.find((cart) => (cart._id = req.params.cartId))
    console.log(cart.products[0].ID)

    const products = await readDB(productsFilePath)

    const cartProducts = cart.products.forEach((cartProduct) =>
      products.filter((product, index) => product.ID === cartProduct.ID)
    )

    console.log(cartProducts)
  } catch {}
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
