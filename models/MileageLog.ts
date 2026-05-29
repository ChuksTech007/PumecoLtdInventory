import mongoose, { Schema, model, models } from 'mongoose'

const MileageLogSchema = new Schema({
  vehicle_id:   { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mileage:      { type: Number, required: true },
  source:       String,
  source_id:    String,
  recorded_by:  { type: Schema.Types.ObjectId, ref: 'User' },
  notes:        String,
}, { timestamps: true })

export default models.MileageLog || model('MileageLog', MileageLogSchema)
