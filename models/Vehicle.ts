import mongoose, { Schema, model, models } from 'mongoose'

const VehicleSchema = new Schema({
  registration_number:    { type: String, required: true, unique: true },
  fleet_number:           String,
  make:                   { type: String, required: true },
  model:                  { type: String, required: true },
  year:                   Number,
  color:                  String,
  type:                   { type: String, required: true },
  status:                 { type: String, enum: ['active', 'in_service', 'breakdown', 'decommissioned'], default: 'active' },
  engine_number:          String,
  chassis_number:         String,
  current_mileage:        { type: Number, default: 0 },
  fuel_capacity:          Number,
  avg_fuel_consumption:   Number,
  branch_id:              { type: Schema.Types.ObjectId, ref: 'Branch' },
  assigned_driver_id:     { type: Schema.Types.ObjectId, ref: 'User' },
  last_service_date:      Date,
  last_service_mileage:   Number,
  next_service_mileage:   Number,
  insurance_expiry:       Date,
  road_worthiness_expiry: Date,
  image_path:             String,
  notes:                  String,
  deleted_at:             Date,
}, { timestamps: true })

export default models.Vehicle || model('Vehicle', VehicleSchema)
