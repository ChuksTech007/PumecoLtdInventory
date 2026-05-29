import mongoose, { Schema, model, models } from 'mongoose'

const FuelReceiptSchema = new Schema({
  reference_number:   { type: String, unique: true },
  fuel_tank_id:       { type: Schema.Types.ObjectId, ref: 'FuelTank', required: true },
  branch_id:          { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  received_by:        { type: Schema.Types.ObjectId, ref: 'User' },
  approved_by:        { type: Schema.Types.ObjectId, ref: 'User' },
  supplier_name:      String,
  waybill_number:     String,
  invoice_number:     String,
  quantity_ordered:   Number,
  quantity_received:  { type: Number, required: true },
  price_per_litre:    Number,
  total_cost:         Number,
  tank_level_before:  Number,
  tank_level_after:   Number,
  receipt_date:       { type: Date, required: true },
  status:             { type: String, default: 'received' },
  notes:              String,
}, { timestamps: true })

export default models.FuelReceipt || model('FuelReceipt', FuelReceiptSchema)
