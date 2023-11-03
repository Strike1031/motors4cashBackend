const { model, Schema } = require('mongoose');
const CarSchema = new Schema({
  vehicle_number: {
    type: String,
    required: true
  },
  ref_number: {
    type: String
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
  damaged: {
    type: String,
  },
  BodyWork: {
    type: String,
  },
  PanelDamageCount: {
    type: String,
  },
  DamageTypes: {
    type: Array,
  },
  WindScreen: {
    type: String,
  },
  CrackedDriverSide: {
    type: String,
  },
  CrackedPassengerSide: {
    type: String,
  },
  CrackedRearWindow: {
    type: String,
  },
  Large5pCoin: {
    type: String,
  },
  DashWarningLight: {
    type: String,
  },
  DashMaxMiles: {
    type: String,
  },
  ServiceDue: {
    type: String,
  },
  OilWarning: {
    type: String,
  },
  EngineManagement: {
    type: String,
  },
  AirbagWarning: {
    type: String,
  },
  ABS: {
    type: String,
  },
  Wheels: {
    type: String,
  },
  AlloyScuffed: {
    type: String,
  },
  TyreTradeLimit: {
    type: String,
  },
  Mirrors: {
    type: String,
  },
  MirrorFaulty: {
    type: String,
  },
  MirrorGlass: {
    type: String,
  },
  MirrorCover: {
    type: String,
  },
  Interior: {
    type: String,
  },
  HasStains: {
    type: String,
  },
  HasTears: {
    type: String,
  },
  HasBurns: {
    type: String,
  },
  WrapPrivatePlate: {
    type: String,
  },
  WrapTwoKeys: {
    type: String,
  },
  WrapOverMOT: {
    type: String,
  },
  WrapLogbook: {
    type: String,
  },
  WrapSC: {
    type: String,
  },
  WrapMissingPart: {
    type: String,
  },
  WrapFaultyElectrics: {
    type: String,
  },
  WrapMechanicalIssues: {
    type: String,
  },
  WrapNoModification: {
    type: String,
  },
  WrapNoMileageAlteration: {
    type: String,
  },
  WrapIsNotImported: {
    type: String,
  },
  WrapRightHandDrive: {
    type: String,
  },
  WrapExDriveSchool: {
    type: String,
  },
  WrapTaxi: {
    type: String,
  },
}, {
  timestamps: ['createdAt', 'updatedAt']
});
const Cars = model("Cars", CarSchema);
module.exports = Cars;