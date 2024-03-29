const { model, Schema } = require('mongoose');
const appointmentSchema = new Schema({
    name: {
      type: String
    },
    email: {
      type: String
    },
    postcode: {
      type: String
    },
    phone: {
      type: String
    },
    car_id: {
      type: String
    },
    appointment_place: {
      type: String
    },
    appointment_date: {
      type: String
    },
    appointment_time: {
      type: String
    },
    ref_number: {
      type: String
    }
  }, {
    timestamps: ['createdAt', 'updatedAt']
});
const appointments = model("Appointments", appointmentSchema);
module.exports = appointments;