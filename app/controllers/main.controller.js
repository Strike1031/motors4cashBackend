const db = require("../models");
const axios = require("axios");
const Car = db.cars;
const Appointment = db.appointment;
require('dotenv').config();

// Get VehicleData
exports.getVehicleData = async (req, res) => {
        try {
        const { reg, mileage } = req.query;
        let carDetails = {
            reg: reg,
            price: 0,
            makeModel: "",
            yearOfManufacture: "",     
            mileage: mileage,
            colour: "",
            bodyStyle: "",
            fuelType: "",
            VehicleImages: null,
        };
        // Get details from the database
        const customDetails = await Car.findOne({ vehicle_number: reg });
        /**
         *   Get car details via API
         */
        const carImageJsonData =  await axios({
            method: 'get',
            url: `https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleImageData?v=2&api_nullitems=1&auth_apikey=${process.env.API_KEY}&key_VRM=${reg}`
        });
    
        // Get Car images
        if (carImageJsonData.data.Response.StatusCode == "Success") {
            //
            carDetails.VehicleImages = carImageJsonData.data.Response.DataItems.VehicleImages;
            // VehicleImages:     {"ImageDetailsCount": 3,  "ImageDetailsList": []}
            // ImageDetailsList:  [{"ImageUrl: "https://cdn2.../", "ExpiryDate": "2023-09-22T00:00:00", "ViewPoint":"Exterior_Angle270" }, {}]
            // console.log(VehicleImages);
        }
        else {
            console.log(carImageJsonData.data.Response.StatusMessage);
            // res.send(carImageJsonData.data.Response.StatusMessage);
        }
    
        // Get car predict price
        const priceJsonData = await axios({
            method: 'get',
            url: `https://uk1.ukvehicledata.co.uk/api/datapackage/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=${process.env.API_KEY}&key_VRM=${reg}`
        });
        if (priceJsonData.data.Response.StatusCode == "Success") {
            if (priceJsonData.data.Response.DataItems?.MileageRecordList.length > 0) {
                let maxMileage = 0;
                maxMileage = priceJsonData.data.Response.DataItems?.MileageRecordList[0].Mileage;
                let TradeAverage = 0;
                TradeAverage = priceJsonData.data.Response.DataItems?.ValuationList?.TradeAverage;
                // compare to mileage
                const predictPrice = mileage / maxMileage * TradeAverage;
                // predictPrice
                carDetails.price = predictPrice ?? 0;
            }
    
        }
        else {
            console.log(priceJsonData.data.Response.StatusMessage);
        }
        
        // Get Vehicle Data
        const  vehicleJsonData = await axios({
            method: 'get',
            url: `https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleData?v=2&api_nullitems=1&auth_apikey=${process.env.API_KEY}&key_VRM=${reg}`
        });
        if (vehicleJsonData.data.Response.StatusCode == "Success") {
            const colourChangeDetails = vehicleJsonData?.data?.Response?.DataItems?.VehicleHistory?.ColourChangeDetails;
            if (colourChangeDetails)
                carDetails.colour = colourChangeDetails.CurrentColour;
            else
                carDetails.colour = vehicleJsonData.data.Response.DataItems.VehicleHistory.VehicleRegistration.Colour;
    
            carDetails.makeModel = vehicleJsonData.data.Response.DataItems.VehicleRegistration.MakeModel;
            carDetails.yearOfManufacture = vehicleJsonData.data.Response.DataItems.VehicleRegistration.YearOfManufacture;
            carDetails.bodyStyle = vehicleJsonData.data.Response.DataItems.SmmtDetails.BodyStyle;
            carDetails.fuelType = vehicleJsonData.data.Response.DataItems.VehicleRegistration.FuelType;
    
        }
        else {
            console.log(vehicleJsonData.data.Response.StatusMessage);
            // res.send(vehicleJsonData.data.Response.StatusMessage);
        }     
    
         // Get postal code
         const  postalCodeJsonData = await axios({
            method: 'get',
            url: `https://uk1.ukvehicledata.co.uk/api/datapackage/PostcodeLookup?v=2&api_nullitems=1&auth_apikey=${process.env.API_KEY}&key_POSTCODE=${reg}`
        });
        if (postalCodeJsonData.data.Response.StatusCode == "Success") {
            const addressList = postalCodeJsonData.data.Response?.DataItems?.AddressDetails?.AddressList;
            // [
            //     {
            // //        "Udprn": 2676859,
            // //        "SummaryAddress": "Lloyds Bank, Facilities Department, Bank House, Wine Street, BRISTOL, BS1 2AN",
            //         "FormattedAddressLines": {
            //             "Organisation": "Lloyds Bank, Facilities Department",
            //             "Premises": "Bank House",
            //             "Street": "Wine Street",
            //             "Locality": null,
            //             "PostTown": "BRISTOL",
            //             "County": "Avon",
            //             "Postcode": "BS1 2AN"
            //         },
            //  //       "ComponentParts": {
            //  //           "PoBox": null,
            //  //           "SubBuildingName": null,
            //   //          "BuildingName": "Bank House",
            //   //          "BuildingNumber": "",
            //   //          "Thoroughfare": null,
            //   //          "Street": "Wine Street"
            //         }
            //     }
            // ],
            console.log(addressList);   
        }
        else {
            console.log(postalCodeJsonData.data.Response.StatusMessage);
           // res.send(postalCodeJsonData.data.Response.StatusMessage);
        }

        const data = {
            carDetails: carDetails,
            customDetails: customDetails
        }
        res.status(200).json({ status: true, message: "VehicleData", data: data });
    } catch (error) {
        console.log("Server error : ", error);
        res.status(500).json({ status: false, message: "An error occurred!", error: error.message });
    }
};

// Set VehicleData and Appointment Data to Database
exports.setVehicleStatusData = async (req, res) => {
    try {
        const {
            vehicle_number,
            vehicle_name,
            created_year,
            color,
            price,
            bodyStyle,
            fuelType,
            mileage,
            previous_owners,
            service_history,
            personal_register,
            import_status,
            v_key,
            non_runner,
            mot_month,
            insurance,
            private_hire,
            driving_tuition,
            police,
            seats,
            zone,
            component,
            fault,
            email,
            postcode,
            phone,
            appointment_place,
            appointment_date,
            appointment_time
        } = req.body;
        // Validate request parameters
        // if (!vehicle_number || !email || !appointment_place || !appointment_date || !appointment_time) {
        //     return res.status(400).json({ status: false, message: "Invalid request parameters" });
        // }
        // Check if the vehicle already exists
        const existingCar = await Car.findOne({ vehicle_number: vehicle_number });
        if (existingCar) {
            const newCar = {
                vehicle_number: vehicle_number,
                vehicle_name: vehicle_name,
                created_year: created_year,
                price : price,
                bodyStyle : bodyStyle,
                fuelType : fuelType,
                color: color,
                mileage: mileage,
                previous_owners: previous_owners,
                service_history: service_history,
                personal_register: personal_register,
                import_status: import_status,
                v_key: v_key,
                non_runner: non_runner,
                mot_month: mot_month,
                insurance: insurance,
                private_hire: private_hire,
                driving_tuition: driving_tuition,
                police: police,
                seats: seats,
                zone: zone,
                component: component,
                fault: fault
            };
            await Car.updateOne(newCar, 
                { id: existingCar.id }
            );
            const newAppointment = {
                email: email,
                postcode: postcode,
                phone: phone,
                car_id: existingCar.vehicle_number,
                appointment_place: appointment_place,
                appointment_date: appointment_date,
                appointment_time: appointment_time,
            };
            const data = await Appointment.create(newAppointment);
            res.status(200).json({ status: true, message: "Reservation successful! We will call you with best valuation.", data: data });
        } else {
            const newCar = {
                vehicle_number: vehicle_number,
                vehicle_name: vehicle_name,
                created_year: created_year,
                price : price,
                bodyStyle : bodyStyle,
                fuelType : fuelType,
                color: color,
                mileage: mileage,
                previous_owners: previous_owners,
                service_history: service_history,
                personal_register: personal_register,
                import_status: import_status,
                v_key: v_key,
                non_runner: non_runner,
                mot_month: mot_month,
                insurance: insurance,
                private_hire: private_hire,
                driving_tuition: driving_tuition,
                police: police,
                seats: seats,
                zone: zone,
                component: component,
                fault: fault
            };
            const data = await Car.create(newCar);
            const newAppointment = {
                email: email,
                postcode: postcode,
                phone: phone,
                car_id: data.vehicle_number,
                appointment_place: appointment_place,
                appointment_date: appointment_date,
                appointment_time: appointment_time,
            };
            await Appointment.create(newAppointment);
            res.status(200).json({ status: true, message: "Reservation successful! We will call you with best valuation.", data: data });
        }
    } catch (error) {
        console.log("Server error : ", error);
        res.status(500).json({ status: false, message: "An error occurred!", error: error.message });
    }
};


exports.getAppointmentData = async (req, res) => {
    try {
        const { reg } = req.query;

        if(!reg) {
            res.status(400).json({ status: false, message: "You can't get Appointment data without Reg"});
        }
        
        const data = await Appointment.find({ car_id: reg });
        res.status(200).json({ status: true, message: "Appointment Data List", data:data});
    } catch (error) {
        console.log("Server error : ", error);
        res.status(500).json({ status: false, message: "An error occurred!", error: error.message });
    }
}

exports.loginAdmin = async(req, res) => {
    try {
        const {name, password} = req.body;
        if (name == process.env.ADMIN_NAME && password == process.env.ADMIN_PASSWORD) {
            res.status(200).json({status: true, message: "Login Succeed", data: ""});
        }
        else {
            res.status(403).json({status: false, message: "Admin name or Password is incorrect", data: ""});
        }
    } catch (error) {
        res.status(400).json({ status: false, message: "An error occurred!", error: error.message });
    }
}

exports.getAdminData = async(req, res) => {
    try {
        const {name, password} = req.body;
        let data =  await Car.findAll();
        if (name == process.env.ADMIN_NAME && password == process.env.ADMIN_PASSWORD) {
            res.status(200).json({status: true, message: "Access Succeed", data: data});
        }
        else {
            res.status(403).json({status: false, message: "Unauthorized User", data: ""});
        }
    } catch (error) {
        res.status(400).json({ status: false, message: "An error occurred!", error: error.message });
    }
}