import mongoose, { Schema, model, models } from 'mongoose'

const ActivityLogSchema = new Schema({
  user_id:     { type: Schema.Types.ObjectId, ref: 'User' },
  action:      String,
  model_type:  String,
  model_id:    String,
  model_label: String,
  branch_id:   { type: Schema.Types.ObjectId, ref: 'Branch' },
  changes:     Schema.Types.Mixed,
  ip_address:  String,
  description: String,
}, { timestamps: true })

export default models.ActivityLog || model('ActivityLog', ActivityLogSchema)
