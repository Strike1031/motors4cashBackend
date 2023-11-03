const db = require("../models");
const axios = require("axios");
const nodemailer = require('nodemailer');
const Car = db.cars;
const Appointment = db.appointment;
require('dotenv').config();

// credentials for sending email 
const mailSender = "johnclark.developer@gmail.com";
const mailSenderPasswrod = "cnhclzgdoogotiqs";
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: mailSender,    // name
        pass: mailSenderPasswrod,     // password for johnclark 
    },
});


// Get VehicleData
exports.getVehicleData = async (req, res) => {
    try {
        const { reg, mileage } = req.query;
        let carDetails = {
            reg: reg,
            price: 0,
            makeModel: "",
            yearOfManufacture: "",
            mileage: "",
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
        const carImageJsonData = await axios({
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
        const vehicleJsonData = await axios({
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
            carDetails.mileage = mileage;

        }
        else {
            console.log(vehicleJsonData.data.Response.StatusMessage);
            // res.send(vehicleJsonData.data.Response.StatusMessage);
        }

        // Get postal code
        const postalCodeJsonData = await axios({
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
            insurance,
            private_hire,
            driving_tuition,
            police,
            seats,
            damaged,
            //    
            BodyWork,
            PanelDamageCount,
            DamageTypes,
            WindScreen,
            CrackedDriverSide,
            CrackedPassengerSide,
            CrackedRearWindow,
            Large5pCoin,
            DashWarningLight,
            DashMaxMiles,
            ServiceDue,
            OilWarning,
            EngineManagement,
            AirbagWarning,
            ABS,
            Wheels,
            AlloyScuffed,
            TyreTradeLimit,
            Mirrors,
            MirrorFaulty,
            MirrorGlass,
            MirrorCover,
            Interior,
            HasStains,
            HasTears,
            HasBurns,
            WrapPrivatePlate,
            WrapTwoKeys,
            WrapOverMOT,
            WrapLogbook,
            WrapSC,
            WrapMissingPart,
            WrapFaultyElectrics,
            WrapMechanicalIssues,
            WrapNoModification,
            WrapNoMileageAlteration,
            WrapIsNotImported,
            WrapRightHandDrive,
            WrapExDriveSchool,
            WrapTaxi,
            //
            name,
            email,
            postcode,
            phone,
            appointment_place,
            appointment_date,
            appointment_time,
            refNumber
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
                price: price,
                bodyStyle: bodyStyle,
                fuelType: fuelType,
                color: color,
                mileage: mileage,
                previous_owners: previous_owners,
                service_history: service_history,
                personal_register: personal_register,
                import_status: import_status,
                v_key: v_key,
                non_runner: non_runner,
                insurance: insurance,
                private_hire: private_hire,
                driving_tuition: driving_tuition,
                police: police,
                seats: seats,
                damaged: damaged,
                //
                BodyWork: BodyWork,
                PanelDamageCount: PanelDamageCount,
                DamageTypes: DamageTypes,
                WindScreen: WindScreen,
                CrackedDriverSide: CrackedDriverSide,
                CrackedPassengerSide: CrackedPassengerSide,
                CrackedRearWindow: CrackedRearWindow,
                Large5pCoin: Large5pCoin,
                DashWarningLight: DashWarningLight,
                DashMaxMiles: DashMaxMiles,
                ServiceDue: ServiceDue,
                OilWarning: OilWarning,
                EngineManagement: EngineManagement,
                AirbagWarning: AirbagWarning,
                ABS: ABS,
                Wheels: Wheels,
                AlloyScuffed: AlloyScuffed,
                TyreTradeLimit: TyreTradeLimit,
                Mirrors: Mirrors,
                MirrorFaulty: MirrorFaulty,
                MirrorGlass: MirrorGlass,
                MirrorCover: MirrorCover,
                Interior: Interior,
                HasStains: HasStains,
                HasTears: HasTears,
                HasBurns: HasBurns,
                WrapPrivatePlate: WrapPrivatePlate,
                WrapTwoKeys: WrapTwoKeys,
                WrapOverMOT: WrapOverMOT,
                WrapLogbook: WrapLogbook,
                WrapSC: WrapSC,
                WrapMissingPart: WrapMissingPart,
                WrapFaultyElectrics: WrapFaultyElectrics,
                WrapMechanicalIssues: WrapMechanicalIssues,
                WrapNoModification: WrapNoModification,
                WrapNoMileageAlteration: WrapNoMileageAlteration,
                WrapIsNotImported: WrapIsNotImported,
                WrapRightHandDrive: WrapRightHandDrive,
                WrapExDriveSchool: WrapExDriveSchool,
                WrapTaxi: WrapTaxi,
                //
                ref_number: refNumber,
            };
            await Car.updateOne(newCar,
                { id: existingCar.id }
            );
            const newAppointment = {
                name: name,
                email: email,
                postcode: postcode,
                phone: phone,
                car_id: existingCar.vehicle_number,
                ref_number: refNumber,
                appointment_place: appointment_place,
                appointment_date: appointment_date,
                appointment_time: appointment_time,
                editable: false,
            };
            const data = await Appointment.create(newAppointment);
            const emailData = { "car": newCar, "appointment": newAppointment };
            sendWelcomeEmail(emailData);
            res.status(200).json({ status: true, message: "Reservation successful! We will call you with best valuation.", data: data });
        } else {
            const newCar = {
                vehicle_number: vehicle_number,
                vehicle_name: vehicle_name,
                created_year: created_year,
                price: price,
                bodyStyle: bodyStyle,
                fuelType: fuelType,
                color: color,
                mileage: mileage,
                previous_owners: previous_owners,
                service_history: service_history,
                personal_register: personal_register,
                import_status: import_status,
                v_key: v_key,
                non_runner: non_runner,
                insurance: insurance,
                private_hire: private_hire,
                driving_tuition: driving_tuition,
                police: police,
                seats: seats,
                damaged: damaged,
                //
                BodyWork: BodyWork,
                PanelDamageCount: PanelDamageCount,
                DamageTypes: DamageTypes,
                WindScreen: WindScreen,
                CrackedDriverSide: CrackedDriverSide,
                CrackedPassengerSide: CrackedPassengerSide,
                CrackedRearWindow: CrackedRearWindow,
                Large5pCoin: Large5pCoin,
                DashWarningLight: DashWarningLight,
                DashMaxMiles: DashMaxMiles,
                ServiceDue: ServiceDue,
                OilWarning: OilWarning,
                EngineManagement: EngineManagement,
                AirbagWarning: AirbagWarning,
                ABS: ABS,
                Wheels: Wheels,
                AlloyScuffed: AlloyScuffed,
                TyreTradeLimit: TyreTradeLimit,
                Mirrors: Mirrors,
                MirrorFaulty: MirrorFaulty,
                MirrorGlass: MirrorGlass,
                MirrorCover: MirrorCover,
                Interior: Interior,
                HasStains: HasStains,
                HasTears: HasTears,
                HasBurns: HasBurns,
                WrapPrivatePlate: WrapPrivatePlate,
                WrapTwoKeys: WrapTwoKeys,
                WrapOverMOT: WrapOverMOT,
                WrapLogbook: WrapLogbook,
                WrapSC: WrapSC,
                WrapMissingPart: WrapMissingPart,
                WrapFaultyElectrics: WrapFaultyElectrics,
                WrapMechanicalIssues: WrapMechanicalIssues,
                WrapNoModification: WrapNoModification,
                WrapNoMileageAlteration: WrapNoMileageAlteration,
                WrapIsNotImported: WrapIsNotImported,
                WrapRightHandDrive: WrapRightHandDrive,
                WrapExDriveSchool: WrapExDriveSchool,
                WrapTaxi: WrapTaxi,
                //
                ref_number: refNumber,
            };
            const data = await Car.create(newCar);
            const newAppointment = {
                name: name,
                email: email,
                postcode: postcode,
                phone: phone,
                car_id: data.vehicle_number,
                ref_number: refNumber,
                appointment_place: appointment_place,
                appointment_date: appointment_date,
                appointment_time: appointment_time,
                editable: false,
            };
            await Appointment.create(newAppointment);
            const emailData = { "car": newCar, "appointment": newAppointment };
            sendWelcomeEmail(emailData);
            res.status(200).json({ status: true, message: "Reservation successful! We will call you with best valuation.", data: data });
        }
    } catch (error) {
        console.log("Server error : ", error);
        res.status(500).json({ status: false, message: "An error occurred!", error: error.message });
    }
};

// async function sendEmail(toEmail, subject, text, fromEmail) {
//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//       host: 'live.smtp.mailtrap.io', //replace with your SMTP host
//       port: 587,
//       auth: {
//         user: 'api', 
//         pass: '764bbb881e868bb69ffc7efdc8b2bfb6', 
//       },
//     });

//     // send mail with defined transport object
//     let info = await transporter.sendMail({
//       from: fromEmail, // sender address
//       to: toEmail, // list of receivers
//       subject: subject, // Subject line
//       text: text, // plain text body
//     });

//     console.log(`Message sent: ${info.messageId}`);
// }

// exports.sendEmail = async (req, res) => {
//     console.log('sendEmail');
//     await sendEmail('johnclark.developer@gmail.com', 'Hello', 'This is a test email', 'hello@motors4.cash')
//     .catch(console.error);
//     res.send('done');
// }

//Send Email to someone
const sendEmailFn = (to, subject, text, html) => {
    try {
        transporter.sendMail({
            from: mailSender,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });
    } catch (error) {
        console.log('sending email error: ', error.message);
    }

}

const sendWelcomeEmail = (data) => {
    const myHTML = `<!DOCTYPE html>
    <!-- saved from url=(0067)https://fvdgkakpa2.preview-posted-stuff.com/V2-AaNn-Wew4-7MK3-TSfS/ -->
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title></title>
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
        <link href="./motors4_files/css" rel="stylesheet" type="text/css">
        <link href="./motors4_files/css2" rel="stylesheet" type="text/css"><!--<![endif]-->
        <style>
            * {
                box-sizing: border-box;
            }
    
            body {
                margin: 0;
                padding: 0;
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
            }
    
            #MessageViewBody a {
                color: inherit;
                text-decoration: none;
            }
    
            p {
                line-height: inherit
            }
    
            .desktop_hide,
            .desktop_hide table {
                mso-hide: all;
                display: none;
                max-height: 0px;
                overflow: hidden;
            }
    
            .image_block img+div {
                display: none;
            }
    
            @media (max-width:768px) {
                .mobile_hide {
                    display: none;
                }
    
                .row-content {
                    width: 100% !important;
                }
    
                .stack .column {
                    width: 100%;
                    display: block;
                }
    
                .mobile_hide {
                    min-height: 0;
                    max-height: 0;
                    max-width: 0;
                    overflow: hidden;
                    font-size: 0px;
                }
    
                .desktop_hide,
                .desktop_hide table {
                    display: table !important;
                    max-height: none !important;
                }
    
                .reverse {
                    display: table;
                    width: 100%;
                }
    
                .reverse .column.first {
                    display: table-footer-group !important;
                }
    
                .reverse .column.last {
                    display: table-header-group !important;
                }
    
                .row-2 td.column.first .border {
                    padding: 0;
                    border-top: 0;
                    border-right: 0px;
                    border-bottom: 0;
                    border-left: 0;
                }
    
                .row-2 td.column.last .border {
                    padding: 30px 25px 25px;
                    border-top: 0;
                    border-right: 0px;
                    border-bottom: 0;
                    border-left: 0;
                }
    
                .row-5 .column-1 .block-1.heading_block h1,
                .row-6 .column-2 .block-1.paragraph_block td.pad>div {
                    text-align: center !important;
                }
    
                .row-1 .column-1,
                .row-6 .column-1 {
                    padding: 20px 10px !important;
                }
    
                .row-1 .column-2 {
                    padding: 5px 25px 20px !important;
                }
    
                .row-2 .column-1 .border {
                    padding: 0 !important;
                }
    
                .row-2 .column-2 .border {
                    padding: 35px 30px !important;
                }
    
                .row-5 .column-1 {
                    padding: 40px 25px 25px !important;
                }
    
                .row-5 .column-2 {
                    padding: 5px 25px 30px !important;
                }
    
                .row-6 .column-2 {
                    padding: 5px 30px 20px 25px !important;
                }
            }
        </style>
    </head>
    
    <body style="background-color: #f7f7f7; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f7f7; background-image: none; background-position: top left; background-size: auto; background-repeat: no-repeat;">
            <tbody>
                <tr>
                    <td>
                        <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-repeat: no-repeat; border-radius: 0; color: #000; background-color: #4f5aba; background-image: url(&#39;https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/1068289_1053532/imported/c59524-20231004-224807/1_header-bg.jpg&#39;); background-size: cover; width: 790px; margin: 0 auto;" width="790">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 30px; padding-right: 10px; padding-top: 20px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad" style="width:100%;">
                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://i.ibb.co/JyF5Qp4/2-white-logo-5b6a0e433dfdbe559c0b80d93abe7f0f.png" style="display: block; height: auto; border: 0; max-width: 223.33333333333331px; width: 100%;" width="223.33333333333331"></div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                    <td class="column column-2" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 30px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="color:#ffbf00;direction:ltr;font-family:Inter, sans-serif;font-size:17px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:20.4px;">
                                                                        <p style="margin: 0;">Your Reference: ${data["car"]["ref_number"]} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Registration: ${data["car"]["vehicle_number"]}</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #efeef4; color: #000; width: 790px; margin: 0 auto;" width="790">
                                            <tbody>
                                                <tr class="reverse">
                                                    <td class="column column-1 first" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <div class="border">
                                                            <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tbody><tr>
                                                                    <td class="pad" style="width:100%;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img src="https://i.ibb.co/HTbq1x5/woman.jpg" style="display: block; height: auto; border: 0px; max-width: 395px; width: 100%; visibility: visible;" width="395" data-xblocker="passed"></div>
                                                                    </td>
                                                                </tr>
                                                            </tbody></table>
                                                        </div>
                                                    </td>
                                                    <td class="column column-2 last" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 25px; padding-left: 25px; padding-right: 25px; padding-top: 30px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <div class="border">
                                                            <table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tbody><tr>
                                                                    <td class="pad" style="padding-bottom:20px;padding-top:5px;text-align:center;width:100%;">
                                                                        <h1 style="margin: 0; color: #4f5aba; direction: ltr; font-family: &#39;Noto Serif&#39;, Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Thank you for choosing Motors4Cash</span></h1>
                                                                    </td>
                                                                </tr>
                                                            </tbody></table>
                                                            <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tbody><tr>
                                                                    <td class="pad" style="padding-bottom:10px;padding-top:10px;">
                                                                        <div style="color:#515151;direction:ltr;font-family:Inter, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:180%;text-align:left;mso-line-height-alt:28.8px;">
                                                                            <p style="margin: 0; margin-bottom: 16px;">One of our agents are now reviewing the information provided and will be in contact shortly!</p>
                                                                            <p style="margin: 0;">If you have any further questions please contact us/p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody></table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000; width: 790px; margin: 0 auto;" width="790">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad" style="width:100%;">
                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://i.ibb.co/hs3vpXw/valuation.png" style="display: block; height: auto; border: 0px; max-width: 155px; width: 100%; visibility: visible;" width="155" alt="I&#39;m an image" title="I&#39;m an image" data-xblocker="passed"></div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                        <table class="text_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="" style="font-size: 12px; font-family: Inter, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                            <p style="margin: 0; text-align: center; mso-line-height-alt: 14.399999999999999px;"><em><strong><span style="font-size:16px;">Free Valuation</span></strong></em></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                        <table class="text_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="" style="font-size: 12px; font-family: Inter, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                            <p style="margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="font-size:12px;">Get a REAL valuation by one of our agents, No automated box standard AI.</span></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                    <td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad" style="width:100%;">
                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://i.ibb.co/T4Hyk1G/appointment-73a79222a4bdc09a30b14f997d7e78cf.png" style="display: block; height: auto; border: 0px; max-width: 155px; width: 100%; visibility: visible;" width="155" alt="I&#39;m an image" title="I&#39;m an image" data-xblocker="passed"></div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                        <table class="text_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="" style="font-size: 12px; font-family: Inter, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                            <p style="margin: 0; text-align: center; mso-line-height-alt: 14.399999999999999px;"><span style="font-size:16px;"><em><strong>Book an Appointment</strong></em></span></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                        <table class="text_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="" style="font-size: 12px; font-family: Inter, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                            <p style="margin: 0; text-align: center; mso-line-height-alt: 14.399999999999999px;">Once we have reviewed your valuation we will request a timeslot.</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                    <td class="column column-3" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad" style="width:100%;">
                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://i.ibb.co/D5khtDM/sell.png" style="display: block; height: auto; border: 0px; max-width: 156px; width: 100%; visibility: visible;" width="156" alt="I&#39;m an image" title="I&#39;m an image" data-xblocker="passed"></div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                        <table class="text_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="" style="font-size: 12px; font-family: Inter, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                            <p style="margin: 0; font-size: 16px; text-align: center; mso-line-height-alt: 19.2px;"><em><strong>Collection</strong></em></p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                        <table class="text_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="font-family: sans-serif">
                                                                        <div class="" style="font-size: 12px; font-family: Inter, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                            <p style="margin: 0; text-align: center; mso-line-height-alt: 14.399999999999999px;">We’ll buy and collect your vehicle within the agreed timeslot.</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000; width: 790px; margin: 0 auto;" width="790">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad" style="width:100%;">
                                                                    <div class="alignment" align="center" style="line-height:10px;">
                                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-repeat: no-repeat; border-radius: 0; color: #000; background-image: url(&#39;https://i.ibb.co/5rns8BC/45747052-aece-49b7-8ba5-d773e1ed66d8.png&#39;); background-size: cover; width: 790px; height: 1000px; margin: 0 auto;" width="790">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td class="pad" style="text-align: center;">
                                                                                        <div style="margin-left: 300px; margin-top: -200px;">
                                                                                            <h1 style="color: rgb(30,139,195)">Vehicle Information</h1>
                                                                                            <br/>
                                                                                            <br/>
                                                                                            <h2 style="color: rgb(30,139,195)">Mileage: ${data["car"]["mileage"]}</h2>
                                                                                            <br/>
                                                                                            <h2 style="color: rgb(30,139,195)">Year of Manufacture: ${data["car"]["created_year"]}</h2>
                                                                                            <br/>
                                                                                            <h2 style="color: rgb(30,139,195)">Color: ${data["car"]["color"]}</h2>
                                                                                            <br/>
                                                                                            <h2 style="color: rgb(30,139,195)">BodyStyle: ${data["car"]["bodyStyle"]} </h2>
                                                                                            <br/>
                                                                                            <h2 style="color: rgb(30,139,195)">FuelType: ${data["car"]["fuelType"]} </h2>
                                                                                            <br/>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-repeat: no-repeat; border-radius: 0; color: #000; background-color: #4f5aba; background-image: url(&#39;https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/1068289_1053532/imported/c59524-20231004-224807/post-code.jpg&#39;); background-size: cover; width: 790px; margin: 0 auto;" width="790">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 40px; padding-left: 25px; padding-right: 25px; padding-top: 40px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad" style="padding-bottom:5px;padding-left:10px;padding-top:5px;text-align:center;width:100%;">
                                                                    <h1 style="margin: 0; color: #ffffff; direction: ltr; font-family: &#39;Noto Serif&#39;, Georgia, serif; font-size: 40px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">&nbsp; &nbsp; &nbsp; &nbsp;Free&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Collection&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<span style="color: #ffbb00;">Nationwide</span></span></h1>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                    <td class="column column-2" width="50%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 40px; padding-left: 25px; padding-right: 25px; padding-top: 40px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="heading_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <h1 style="margin: 0; color: #7747FF; direction: ltr; font-family: Inter, sans-serif; font-size: 38px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder"></span></h1>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;">
                            <tbody>
                                <tr>
                                    <td>
                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-repeat: no-repeat; border-radius: 0; color: #000; background-size: auto; background-color: #201f42; background-image: url(&#39;https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/1068289_1053532/imported/c59524-20231004-224807/1_header-bg.jpg&#39;); width: 790px; margin: 0 auto;" width="790">
                                            <tbody>
                                                <tr>
                                                    <td class="column column-1" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 30px; padding-right: 10px; padding-top: 20px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="heading_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <h1 style="margin: 0; color: #f7f7f7; direction: ltr; font-family: &#39;Courier New&#39;, Courier, &#39;Lucida Sans Typewriter&#39;, &#39;Lucida Typewriter&#39;, monospace; font-size: 31px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder"></span></h1>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                    <td class="column column-2" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-left: 25px; padding-right: 30px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                        <table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                            <tbody><tr>
                                                                <td class="pad">
                                                                    <div style="color:#ffffff;direction:ltr;font-family:Inter, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:16.8px;">
                                                                        <p style="margin: 0;">Copyright © 2023 Motors4Cash, All rights reserved.</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody></table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table><!-- End -->
    
    
    <gdiv class="ginger-extension-writer" style="display: none;"><gdiv class="ginger-extension-writer-frame"><iframe src="./motors4_files/index.html"></iframe></gdiv></gdiv></body></html>`;
    //Send Reference number, Registration number, Basic Vehicle details
    sendEmailFn(data.appointment.email, "Welcome to Motors4.cash", "", myHTML);
}

exports.getVehicleDataByRefNum = async (req, res) => {
    const { ref_number } = req.body;
    const carDetails = await Car.findOne({ ref_number: ref_number });
    res.status(200).json({ status: true, message: "getVehicleDataByRefNum", data: carDetails });
}

// It is updated by Admin
exports.editAppointment = async (req, res) => {
    //update Appointment by Admin
    const { name, email, refNumber, appointmentDate, appointmentTime, appointmentAddress } = req.body;
    await Appointment.updateOne({ ref_number: refNumber }, {
        $set: {
            postcode: appointmentAddress,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
        }
    });
    //send email to the customer for upgrading appointment
    const myHTML = `
       <div>
         <p>Hello, ${name}</p>
         <p>Please choose your compfortable meeting time by using the link</p>
         <a href="${process.env.FRONTEND_URL}/appointment/${refNumber}">${process.env.FRONTEND_URL}/appointment/${refNumber}</a>
         <br/>
         <p>Current Appointment Address: ${appointmentAddress}<p>
         <p>Current Appointment Date: ${appointmentDate}<p>
         <p>Current Appointment Time: ${appointmentTime}<p>
       </div>
    `;
    sendEmailFn(email, "Upgrade Appointment", "", myHTML);
}

// exports.sendEmail = (req, res) => {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true, // use SSL`
//         auth: {
//           user: "user1@gmail.com",    // name
//           pass: "cnhclzgdoogotiqs",     // pass, cnhc-lzgd-oogo-tiqs
//         },
//       });

//       transporter.sendMail({
//         from: "user1@gmail.com",
//         to: "user1@gmail.com",
//         subject: 'Welcome to Motors4.cash!',
//         text: 'Welcome message',
//         html: `<h3>Welcome to Motors4.cash</h3>`,
//       });
//       res.send("Done");
// }

exports.getAppointmentData = async (req, res) => {
    try {
        const { reg } = req.query;

        if (!reg) {
            res.status(400).json({ status: false, message: "You can't get Appointment data without Reg" });
        }

        const data = await Appointment.find({ car_id: reg });
        res.status(200).json({ status: true, message: "Appointment Data List", data: data });
    } catch (error) {
        console.log("Server error : ", error);
        res.status(500).json({ status: false, message: "An error occurred!", error: error.message });
    }
}


exports.getAppointmentDataByRefNum = async (req, res) => {
    try {
        const { ref_number } = req.query;

        if (!ref_number) {
            res.status(400).json({ status: false, message: "You can't get Appointment data without Reg" });
        }

        const data = await Appointment.find({ ref_number: ref_number });
        res.status(200).json({ status: true, message: "Appointment Data List", data: data });
    } catch (error) {
        console.log("Server error : ", error);
        res.status(500).json({ status: false, message: "An error occurred!", error: error.message });
    }
}

exports.updateAppointmentByCustomer = async (req, res) => {
    try {
        const { ref_number, appointmentAddress, appointmentDate, appointmentTime } = req.body;

        if (!ref_number) {
           return;
        }

        await Appointment.updateOne({ ref_number: ref_number }, {
            $set: {
                postcode: appointmentAddress,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
            }
        });
    } catch (error) {
        console.log("Server error : ", error.message);
    }
}

exports.loginAdmin = async (req, res) => {
    try {
        const { name, password } = req.body;
        if (name == process.env.ADMIN_NAME && password == process.env.ADMIN_PASSWORD) {
            res.status(200).json({ status: true, message: "Login Succeed", data: "" });
        }
        else {
            res.status(403).json({ status: false, message: "Admin name or Password is incorrect", data: "" });
        }
    } catch (error) {
        res.status(400).json({ status: false, message: "An error occurred!", error: error.message });
    }
}

exports.getAdminData = async (req, res) => {
    try {
        const { name, password } = req.body;
        let data = await Appointment.find();
        if (name == process.env.ADMIN_NAME && password == process.env.ADMIN_PASSWORD) {
            res.status(200).json({ status: true, message: "Access Succeed", data: data });
        }
        else {
            res.status(403).json({ status: false, message: "Unauthorized User", data: "" });
        }
    } catch (error) {
        res.status(400).json({ status: false, message: "An error occurred!", error: "An error occurred!" });
        console.log(error.message);
    }
}