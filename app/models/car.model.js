const { model, Schema } = require('mongoose');
const CarSchema = new Schema({
  vehicle_number: {
    type: String,
    required: true
  },
  vehicle_name: {
    type: String,
  },
  created_year: {
    type: String,
  },
  price: {
    type: String,
  },
  bodyStyle: {
    type: String,
  },
  fuelType: {
    type: String,
  },
  color: {
    type: String,
  },
  mileage: {
    type: String,
  },
  previous_owners: {
    type: String,
  },
  service_history: {
    type: String,
  },
  personal_register: {
    type: String,
  },
  import_status: {
    type: String,
  },
  v_key: {
    type: String,
  },
  non_runner: {
    type: String,
  },
  mot_month: {
    type: String,
  },
  insurance: {
    type: String,
  },
  private_hire: {
    type: String,
  },
  driving_tuition: {
    type: String,
  },
  police: {
    type: String,
  },
  seats: {
    type: String,
  },
  zone: {
    type: String,
  },
  component: {
    type: String,
  },
  fault: {
    type: String,
  },
}, {
  timestamps: ['createdAt', 'updatedAt']
});
const Cars = model("Cars", CarSchema);
module.exports = Cars;