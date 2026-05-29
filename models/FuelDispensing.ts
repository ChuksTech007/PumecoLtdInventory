import mongoose, { Schema, model, models } from 'mongoose'

const FuelDispensingSchema = new Schema({
  reference_number:      { type: String, unique: true },
  fuel_tank_id:          { type: Schema.Types.ObjectId, ref: 'FuelTank', required: true },
  branch_id:             { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  vehicle_id:            { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  dispensed_by:          { type: Schema.Types.ObjectId, ref: 'User' },
  approved_by:           { type: Schema.Types.ObjectId, ref: 'User' },
  driver_id:             { type: Schema.Types.ObjectId, ref: 'User' },
  destination_branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  purpose:               { type: String, required: true },
  quantity_requested:    Number,
  quantity_dispensed:    { type: Number, required: true },
  tank_level_before:     Number,
  tank_level_after:      Number,
  vehicle_mileage:       Number,
  dispensing_date:       { type: Date, required: true },
  status:                { type: String, default: 'dispensed' },
  notes:                 String,
}, { timestamps: true })

export default models.FuelDispensing || model('FuelDispensing', FuelDispensingSchema)
