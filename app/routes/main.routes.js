module.exports = app => {
    const main = require("../controllers/main.controller.js");
  
    var router = require("express").Router();

    app.use('/api/', router);
  
    // Get a Vehicle Data
    router.get("/getVehicleData", main.getVehicleData);

    router.post("/setVehicleStatusData", main.setVehicleStatusData);

    router.get("/getAppointmentData", main.getAppointmentData);
    
    router.post("/admin/", main.loginAdmin);
    router.post("/admin/table", main.getAdminData);
  };