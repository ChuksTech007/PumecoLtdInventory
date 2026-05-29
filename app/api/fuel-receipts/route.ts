import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelReceiptModel from '@/models/FuelReceipt'
import FuelTankModel from '@/models/FuelTank'
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
    const from = searchParams.get('from_date')
    const to = searchParams.get('to_date')
    if (from || to) {
      filter.receipt_date = {}
      if (from) filter.receipt_date.$gte = new Date(from)
      if (to) filter.receipt_date.$lte = new Date(to)
    }
    const receipts = await FuelReceiptModel.find(filter)
      .populate('fuel_tank_id', 'name tank_number')
      .populate('branch_id', 'name')
      .populate('received_by', 'name')
      .sort({ receipt_date: -1 })
      .lean()
    return NextResponse.json(receipts)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await auth()
    const data = await req.json()
    const { fuel_tank_id, branch_id, quantity_received, receipt_date } = data
    if (!fuel_tank_id || !branch_id || !quantity_received || !receipt_date) {
      return NextResponse.json({ error: 'fuel_tank_id, branch_id, quantity_received and receipt_date are required' }, { status: 400 })
    }

    const tank = await FuelTankModel.findById(fuel_tank_id)
    if (!tank) return NextResponse.json({ error: 'Fuel tank not found' }, { status: 404 })

    const qty = Number(quantity_received)
    const pricePerLitre = data.price_per_litre ? Number(data.price_per_litre) : undefined
    const total_cost = pricePerLitre ? qty * pricePerLitre : undefined
    const tank_level_before = tank.current_level
    const newLevel = Math.min(tank.current_level + qty, tank.capacity)

    const reference_number = generateRef('FRC')

    const receipt = await FuelReceiptModel.create({
      ...data,
      reference_number,
      received_by: session?.user?.id,
      quantity_received: qty,
      price_per_litre: pricePerLitre,
      total_cost,
      tank_level_before,
      tank_level_after: newLevel,
    })

    // Update tank level
    await FuelTankModel.findByIdAndUpdate(fuel_tank_id, { current_level: newLevel })

    await logActivity('create', 'FuelReceipt', receipt._id.toString(), reference_number,
      `Received ${qty}L of fuel into tank ${tank.name}. Level: ${tank_level_before}L → ${newLevel}L`)

    return NextResponse.json(receipt, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
