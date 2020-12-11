//TOOLS AND MIDDLEWARE
const express = require("express")

//Instances
const server = express()

const port = process.env.PORT || 3001

server.listen(port, () => console.log("server created on port", port))
