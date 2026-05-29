import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelDispensingModel from '@/models/FuelDispensing'
import FuelTankModel from '@/models/FuelTank'
import VehicleModel from '@/models/Vehicle'
import MileageLogModel from '@/models/MileageLog'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'
import { generateRef } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const filter: Record<string, any> = {}
    if (session?.user?.role !== 'admin') filter.branch_id = session?.user?.branch_id
    const branch = searchParams.get('branch')
    if (branch) filter.branch_id = branch
    const purpose = searchParams.get('purpose')
    if (purpose) filter.purpose = purpose
    const from = searchParams.get('from_date')
    const to = searchParams.get('to_date')
    if (from || to) {
      filter.dispensing_date = {}
      if (from) filter.dispensing_date.$gte = new Date(from)
      if (to) filter.dispensing_date.$lte = new Date(to)
    }
    const dispensings = await FuelDispensingModel.find(filter)
      .populate('fuel_tank_id', 'name tank_number')
      .populate('branch_id', 'name')
      .populate('vehicle_id', 'registration_number')
      .populate('driver_id', 'name')
      .sort({ dispensing_date: -1 })
      .lean()
    return NextResponse.json(dispensings)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const data = await req.json()
    const { fuel_tank_id, branch_id, purpose, quantity_dispensed, dispensing_date } = data
    if (!fuel_tank_id || !branch_id || !purpose || !quantity_dispensed || !dispensing_date) {
      return NextResponse.json({ error: 'fuel_tank_id, branch_id, purpose, quantity_dispensed and dispensing_date are required' }, { status: 400 })
    }

    const tank = await FuelTankModel.findById(fuel_tank_id)
    if (!tank) return NextResponse.json({ error: 'Fuel tank not found' }, { status: 404 })

    const qty = Number(quantity_dispensed)
    if (tank.current_level < qty) {
      return NextResponse.json({ error: `Insufficient fuel. Tank has ${tank.current_level}L, requested ${qty}L` }, { status: 400 })
    }

    const tank_level_before = tank.current_level
    const newLevel = Math.max(tank.current_level - qty, 0)
    const reference_number = generateRef('FDI')

    // Clean optional fields
    if (!data.vehicle_id) delete data.vehicle_id
    if (!data.driver_id) delete data.driver_id

    const dispensing = await FuelDispensingModel.create({
      ...data,
      reference_number,
      dispensed_by: session?.user?.id,
      quantity_dispensed: qty,
      tank_level_before,
      tank_level_after: newLevel,
    })

    // Update tank level
    await FuelTankModel.findByIdAndUpdate(fuel_tank_id, { current_level: newLevel })

    // Update vehicle mileage and create mileage log if applicable
    if (data.vehicle_id && data.vehicle_mileage) {
      const vehicleMileage = Number(data.vehicle_mileage)
      await VehicleModel.findByIdAndUpdate(data.vehicle_id, { current_mileage: vehicleMileage })
      await MileageLogModel.create({
        vehicle_id: data.vehicle_id,
        mileage: vehicleMileage,
        source: 'fuel_dispensing',
        source_id: dispensing._id.toString(),
        recorded_by: session?.user?.id,
        notes: `Mileage recorded during fuel dispensing ${reference_number}`,
      })
    }

    await logActivity('create', 'FuelDispensing', dispensing._id.toString(), reference_number,
      `Dispensed ${qty}L for ${purpose}. Tank: ${tank_level_before}L → ${newLevel}L`)

    return NextResponse.json(dispensing, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
