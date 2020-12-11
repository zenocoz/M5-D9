//---------------------Require
const express = require("express");
const cors = require("cors");
const reviews = require("./services/reviews");

const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling");

//---------------------Instances
const server = express();

//-----------------------Use
server.use(cors());
server.use(express.json());
server.use("/reviews", reviews);

//errors
server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(catchAllErrorHandler);

//---------------------Listen
const port = process.env.PORT || 3001;
server.listen(port, () => console.log("server created on port", port));
