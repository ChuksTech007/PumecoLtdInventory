import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelDispensingModel from '@/models/FuelDispensing'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const dispensing = await FuelDispensingModel.findById(id)
      .populate('fuel_tank_id', 'name tank_number fuel_type')
      .populate('branch_id', 'name')
      .populate('vehicle_id', 'registration_number make model')
      .populate('driver_id', 'name')
      .populate('dispensed_by', 'name')
      .lean()
    if (!dispensing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(dispensing)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
