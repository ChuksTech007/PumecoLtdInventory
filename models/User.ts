import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['admin', 'fleet_officer', 'fuel_officer', 'branch_manager', 'viewer'], default: 'viewer' },
  phone:       String,
  employee_id: String,
  branch_id:   { type: Schema.Types.ObjectId, ref: 'Branch' },
  is_active:   { type: Boolean, default: true },
}, { timestamps: true })

export default models.User || model('User', UserSchema)
