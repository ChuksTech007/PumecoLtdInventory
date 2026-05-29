import mongoose, { Schema, model, models } from 'mongoose'

const BranchSchema = new Schema({
  name:         { type: String, required: true },
  code:         { type: String, required: true, unique: true },
  location:     { type: String, required: true },
  state:        String,
  address:      String,
  manager_name: String,
  phone:        String,
  email:        String,
  is_active:    { type: Boolean, default: true },
  notes:        String,
}, { timestamps: true })

export default models.Branch || model('Branch', BranchSchema)
