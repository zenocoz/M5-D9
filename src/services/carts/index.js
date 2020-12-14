//TOOLS AND MIDDLEWARE
const express = require("express")
const fs = require("fs")
const path = require("path")
const uniquid = require("uniqid")
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { check, validationResult } = require("express-validator")
const { readDB, writeDB } = require("../../lib/utilities")
const { send } = require("process")

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
      //todo check errors differently if you don't have a body
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
        singleCart.products.push(productId)
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
    const cart = carts.find((cart) => cart._id === req.params.cartId)

    if (!cart) {
      const error = new Error("Cart Id not found")
      error.httpStatusCode = 404
      next(error)
    } else {
      const products = await readDB(productsFilePath)

      const filteredProducts = products.filter((product) =>
        cart.products.includes(product.ID)
      )
      cart.products = filteredProducts
      res.send(cart)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Delete
router.delete(
  "/:cartId/remove-from-cart/:productId",
  async (req, res, next) => {
    try {
      const carts = await readDB(cartsFilePath)
      const cart = carts.find((cart) => cart._id === req.params.cartId)
      if (!cart) {
        const error = new Error()
        error.message = "Cart ID not found"
        error.httpStatusCode = 404
        next(error)
      } else {
        const products = await readDB(productsFilePath)
        const singleProduct = products.find(
          (product) => product.ID === req.params.productId
        )
        if (!singleProduct) {
          const error = new Error("Product not found")
          error.httpStatusCode = 404
          next(error)
        } else {
          const filteredCartProducts = cart.products.filter(
            (element) => element !== singleProduct.ID
          )

          console.log(filteredCartProducts)
          cart.products = filteredCartProducts

          await writeDB(cartsFilePath, carts)

          res.status(204).send()
        }
      }
    } catch (err) {
      next(err)
    }
  }
)

module.exports = router
