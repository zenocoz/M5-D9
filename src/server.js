//---------------------Require
const express = require("express")
const cors = require("cors")

const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling")

//---------------------Instances
const server = express()

//-----------------------Use
server.use(cors())
server.use(express.json())
//errors
server.use(notFoundErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(badRequestErrorHandler)
server.use(catchAllErrorHandler)

//---------------------Listen
const port = process.env.PORT || 3001
server.listen(port, () => console.log("server created on port", port))
