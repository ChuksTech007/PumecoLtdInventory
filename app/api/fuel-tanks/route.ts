import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import { auth } from '@/auth'
import { logActivity } from '@/lib/activity-logger'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const filter: Record<string, any> = {}
    if (session?.user?.role !== 'admin') filter.branch_id = session?.user?.branch_id
    const branch = searchParams.get('branch')
    if (branch) filter.branch_id = branch
    const fuel_type = searchParams.get('fuel_type')
    if (fuel_type) filter.fuel_type = fuel_type
    const is_active = searchParams.get('is_active')
    if (is_active !== null && is_active !== '') filter.is_active = is_active === 'true'
    const tanks = await FuelTankModel.find(filter)
      .populate('branch_id', 'name')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(tanks)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const data = await req.json()
    const { name, tank_number, fuel_type, capacity, branch_id } = data
    if (!name || !tank_number || !fuel_type || !capacity || !branch_id) {
      return NextResponse.json({ error: 'name, tank_number, fuel_type, capacity and branch_id are required' }, { status: 400 })
    }
    const tank = await FuelTankModel.create(data)
    await logActivity('create', 'FuelTank', tank._id.toString(), tank.name, `Created fuel tank ${tank.name} (${tank.tank_number})`)
    return NextResponse.json(tank, { status: 201 })
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Tank number already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
