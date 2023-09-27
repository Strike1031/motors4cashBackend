const dbConfig = require("../config/db.config.js");

const db = {};

db.cars = require("./car.model.js")
db.appointment = require("./appointment.model.js")

module.exports = db;