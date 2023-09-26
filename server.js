const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const db = require("./app/models");
db.sequelize.sync();

// var corsOptions = {
//   origin: ["http://192.168.3.19:3000"]
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

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
