import mongoose, { Schema, model, models } from 'mongoose'

const FuelTankSchema = new Schema({
  name:          { type: String, required: true },
  tank_number:   { type: String, required: true, unique: true },
  fuel_type:     { type: String, required: true },
  capacity:      { type: Number, required: true },
  current_level: { type: Number, default: 0 },
  minimum_level: { type: Number, default: 0 },
  branch_id:     { type: Schema.Types.ObjectId, ref: 'Branch' },
  is_active:     { type: Boolean, default: true },
  notes:         String,
}, { timestamps: true })

export default models.FuelTank || model('FuelTank', FuelTankSchema)
