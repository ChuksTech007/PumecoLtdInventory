import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import FuelTankModel from '@/models/FuelTank'
import { logActivity } from '@/lib/activity-logger'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const tank = await FuelTankModel.findById(id).populate('branch_id', 'name').lean()
    if (!tank) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tank)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const data = await req.json()
    if (!data.branch_id) delete data.branch_id
    const tank = await FuelTankModel.findByIdAndUpdate(id, data, { new: true }).lean() as any
    if (!tank) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('update', 'FuelTank', id, tank.name, `Updated fuel tank ${tank.name}`)
    return NextResponse.json(tank)
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'Tank number already exists' }, { status: 400 })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    // Soft delete via is_active = false (no deleted_at on FuelTank schema, use is_active)
    const tank = await FuelTankModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean() as any
    if (!tank) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await logActivity('delete', 'FuelTank', id, tank.name, `Deactivated fuel tank ${tank.name}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
