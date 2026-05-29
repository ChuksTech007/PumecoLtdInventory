import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import MileageLogModel from '@/models/MileageLog'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const vehicle = await VehicleModel.findById(id)
      .populate('branch_id', 'name')
      .populate('assigned_driver_id', 'name')
      .lean()
    if (!vehicle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(vehicle)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const session = await auth()
    const data = await req.json()

    const existing = await VehicleModel.findById(id).lean() as any
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Clean empty optional fields
    if (!data.branch_id) delete data.branch_id
    if (!data.assigned_driver_id) delete data.assigned_driver_id

    const newMileage = data.current_mileage ? Number(data.current_mileage) : null
    const vehicle = await VehicleModel.findByIdAndUpdate(id, data, { new: true }).lean() as any

    // Create mileage log if mileage changed
    if (newMileage && newMileage !== existing.current_mileage) {
      await MileageLogModel.create({
        vehicle_id: id,
        mileage: newMileage,
        source: 'manual_update',
        source_id: id,
        recorded_by: session?.user?.id,
        notes: 'Mileage updated via vehicle edit',
      })
    }

    await logActivity('update', 'Vehicle', id, vehicle.registration_number, `Updated vehicle ${vehicle.registration_number}`)
    return NextResponse.json(vehicle)
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Registration number already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const vehicle = await VehicleModel.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true }).lean() as any
    if (!vehicle) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('delete', 'Vehicle', id, vehicle.registration_number, `Deleted vehicle ${vehicle.registration_number}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
