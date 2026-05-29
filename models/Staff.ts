import mongoose, { Schema, model, models } from 'mongoose'

const StaffSchema = new Schema({
  full_name:          { type: String, required: true },
  staff_number:       { type: String, required: true, unique: true },
  phone:              String,
  email:              String,
  designation:        { type: String, required: true },
  license_number:     String,
  license_expiry:     Date,
  license_class:      String,
  branch_id:          { type: Schema.Types.ObjectId, ref: 'Branch' },
  hire_date:          Date,
  is_active:          { type: Boolean, default: true },
  emergency_contact:  String,
  emergency_phone:    String,
  notes:              String,
  user_id:            { type: Schema.Types.ObjectId, ref: 'User' },
  deleted_at:         Date,
}, { timestamps: true })

export default models.Staff || model('Staff', StaffSchema)
