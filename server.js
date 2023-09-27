const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();
const app = express();
const db = require("./app/models");
const mongoose = require("mongoose");

// var corsOptions = {
//   origin: ["http://1ocalhost:3000"]
// };

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());


// simple route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Node.js and sequelize application."
  });
});

require("./app/routes/main.routes")(app);

// /////////////////////////////////////////////
mongoose.connect(process.env.DATABASE_LINK)
  .then(function (result) {
    console.log("MongoDB Database Accessed");
  })
  .catch(function (err) {
    console.log("MongoDB Database Access Failed");
  })
// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
