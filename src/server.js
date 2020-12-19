//---------------------Require
const express = require("express")
const cors = require("cors")
const { join } = require("path")
const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling")

//Routes
const productsRoutes = require("./services/products")
const reviews = require("./services/reviews")
const cartsRoutes = require("./services/carts")

const publicFolderPath = join(__dirname, "../public")
//---------------------Instances
const server = express()

//-----------------------Use

server.use(cors())
server.use(express.json())
server.use(express.static(publicFolderPath))

server.use("/reviews", reviews)
server.use("/products", productsRoutes)
server.use("/carts", cartsRoutes)

//errors
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(catchAllErrorHandler)

//---------------------Listen
const port = process.env.PORT || 3001
server.listen(port, () => console.log("server created on port", port))
