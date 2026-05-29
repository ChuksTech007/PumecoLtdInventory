import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelReceiptModel from '@/models/FuelReceipt'
import FuelTankModel from '@/models/FuelTank'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const receipt = await FuelReceiptModel.findById(id)
      .populate('fuel_tank_id', 'name tank_number fuel_type')
      .populate('branch_id', 'name')
      .populate('received_by', 'name')
      .lean()
    if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(receipt)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const receipt = await FuelReceiptModel.findById(id)
    if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Reverse the tank level — subtract what was added
    await FuelTankModel.findByIdAndUpdate(receipt.fuel_tank_id, {
      $inc: { current_level: -(receipt.quantity_received ?? 0) },
    })
    await FuelReceiptModel.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
