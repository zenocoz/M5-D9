//TOOLS AND MIDDLEWARE
const express = require("express")
const fs = require("fs")
const path = require("path")
const uniquid = require("uniqid")
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { check, validationResult } = require("express-validator")
const { readDB, writeDB } = require("../../lib/utilities")
const { parseString } = require("xml2js")
const publicIp = require("public-ip")
const axios = require("axios")
const { promisify } = require("util")
const { begin } = require("xmlbuilder")
const { parse } = require("path")
const { send } = require("process")

//Create Middleware Instances
const router = express.Router()
const upload = multer({})
const asyncParser = promisify(parseString)

//Paths
const productsFilePath = path.join(__dirname, "products.json")
const productsFolderPath = path.join(__dirname, "../../../public/img/products")
const reviewsFilePath = path.join(__dirname, "../reviews/reviews.json")

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
        res.status(201).send({ ID: newProduct.ID })
      }
    } catch (error) {
      next(error)
    }
  }
)

//Read

router.get("/", async (req, res, next) => {
  try {
    const products = await readDB(productsFilePath)
    if (req.query && req.query.category) {
      const filteredProducts = products.filter(
        (product) =>
          product.hasOwnProperty("category") &&
          product.category.startsWith(req.query.category)
      )
      res.send(filteredProducts)
    } else {
      res.send(products)
    }
  } catch (error) {
    next(error)
  }
})

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
  async (req, res, next) => {
    const productId = req.params.productId
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const products = await readDB(productsFilePath)
        const newProductsArray = products.filter(
          (product) => product.ID !== productId
        )
        const modifiedProduct = {
          ...req.body,
          ID: productId,
          modifiedAt: new Date(),
        }
        newProductsArray.push(modifiedProduct)
        await writeDB(productsFilePath, newProductsArray)
        res.send({ ID: productId })
      }
    } catch (error) {
      next(error)
    }
  }
)

//Delete
router.delete("/:productId", async (req, res, next) => {
  try {
    const productId = req.params.productId
    const products = await readDB(productsFilePath)
    const checkIdIsCorrect = products.find(
      (product) => product.ID === productId
    )
    if (!checkIdIsCorrect) {
      const err = new Error()
      err.message = "Id not found"
      err.httpStatusCode = 404
      next(err)
    } else {
      const newProductsArray = products.filter(
        (product) => product.ID !== productId
      )
      await writeDB(productsFilePath, newProductsArray)
      res.status(204).send(`project with id ${productId} deleted`)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviewsArray = await readDB(reviewsFilePath)
    const reviews = reviewsArray.filter(
      (review) => review.elementId === req.params.id
    )
    if (reviews.length > 0) {
      res.status(200).send(reviews)
    } else {
      const err = new Error()
      err.message = "Id not found"
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Upload Picture

router.post(
  "/:id/uploadPicture",
  upload.single("product"),
  async (req, res, next) => {
    try {
      const productId = req.params.id
      await writeFile(
        path.join(productsFolderPath, `${productId}.jpg`),
        req.file.buffer
      )
      const products = await readDB(productsFilePath)
      let singleProduct = await products.find(
        (product) => product.ID === productId
      )

      singleProduct.imageUrl = `http://localhost:${process.env.PORT}/img/products/${singleProduct.ID}.jpg`

      await writeDB(productsFilePath, products)
      res.send("ok")
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

//sum two prices
router.get("/sum/TwoPrices", async (req, res, next) => {
  try {
    const products = await readDB(productsFilePath)
    if (req.query.p1 && req.query.p2) {
      const product1 = products.find((product) => product.ID === req.query.p1)
      const product2 = products.find((product) => product.ID === req.query.p2)

      //     POST /calculator.asmx HTTP/1.1
      // Host: www.dneonline.com
      // Content-Type: text/xml; charset=utf-8
      // Content-Length: length
      // SOAPAction: "http://tempuri.org/Add"

      // <?xml version="1.0" encoding="utf-8"?>
      // <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      //   <soap:Body>
      //     <Add xmlns="http://tempuri.org/">
      //       <intA>int</intA>
      //       <intB>int</intB>
      //     </Add>
      //   </soap:Body>
      // </soap:Envelope>

      //build the xml body

      const xmlBody = begin()
        .ele("soap:Envelope", {
          "xmlnw:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
        })
        .ele("soap:Body")
        .ele("Add", { xmlns: "http://tempuri.org/" })
        .ele("intA")
        .text(product1.price)
        .up()
        .ele("intB")
        .text(product2.price)
        .end()

      console.log(xmlBody)

      const response = await axios({
        method: "post",
        url: "http://www.dneonline.com/calculator.asmx?op=Add",
        data: xmlBody,
        headers: { "Content-type": "text/xml" },
      })

      if (response.ok) {
        const xml = response.data
        console.log(xml)
        const parsedJs = await asyncParser(xml)

        res.send(parsedJs)
      } else {
        console.log("somethin went wrong")
      }
    } else {
      console.log("one or both id not found")
    }
  } catch (error) {
    next(error)
  }
})

//export to csv
router.get("/exportToCsv", async (req, res, next) => {})

module.exports = router
