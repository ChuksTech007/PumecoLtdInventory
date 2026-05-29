import mongoose, { Schema, model, models } from 'mongoose'

const ServiceRecordSchema = new Schema({
  reference_number:             { type: String, unique: true },
  vehicle_id:                   { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  branch_id:                    { type: Schema.Types.ObjectId, ref: 'Branch' },
  created_by:                   { type: Schema.Types.ObjectId, ref: 'User' },
  approved_by:                  { type: Schema.Types.ObjectId, ref: 'User' },
  service_type:                 { type: String, required: true },
  status:                       { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  service_date:                 { type: Date, required: true },
  completion_date:              Date,
  mileage_at_service:           Number,
  mechanic_name:                String,
  workshop:                     String,
  labour_cost:                  { type: Number, default: 0 },
  parts_cost:                   { type: Number, default: 0 },
  total_cost:                   { type: Number, default: 0 },
  description:                  { type: String, required: true },
  parts_replaced:               String,
  mechanic_notes:               String,
  next_service_recommendation:  String,
  next_service_mileage:         Number,
  next_service_date:            Date,
  deleted_at:                   Date,
}, { timestamps: true })

export default models.ServiceRecord || model('ServiceRecord', ServiceRecordSchema)
