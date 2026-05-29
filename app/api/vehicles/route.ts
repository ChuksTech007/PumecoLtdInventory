import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import VehicleModel from '@/models/Vehicle'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const filter: Record<string, any> = { deleted_at: null }
    if (session?.user?.role !== 'admin') filter.branch_id = session?.user?.branch_id
    const branch = searchParams.get('branch')
    if (branch) filter.branch_id = branch
    const vehicles = await VehicleModel.find(filter)
      .populate('branch_id', 'name')
      .populate('assigned_driver_id', 'name')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(vehicles)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const data = await req.json()
    const { registration_number, make, model, type } = data
    if (!registration_number || !make || !model || !type) {
      return NextResponse.json({ error: 'registration_number, make, model and type are required' }, { status: 400 })
    }
    // Clean up empty optional fields
    if (!data.branch_id) delete data.branch_id
    if (!data.assigned_driver_id) delete data.assigned_driver_id
    if (!data.year) delete data.year
    if (!data.current_mileage) data.current_mileage = 0
    const vehicle = await VehicleModel.create(data)
    await logActivity('create', 'Vehicle', vehicle._id.toString(), vehicle.registration_number, `Created vehicle ${vehicle.registration_number}`)
    return NextResponse.json(vehicle, { status: 201 })
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Registration number already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
